/**
 * GET  /api/nodes/tiers          — all tier info + live remaining supply
 * GET  /api/nodes/stats          — platform-wide stats
 * POST /api/nodes/verify-purchase — verify on-chain tx, update MongoDB
 */

const express      = require("express");
const { z }        = require("zod");
const { ethers }   = require("ethers");
const SaleConfig   = require("../models/SaleConfig");
const NodePurchase = require("../models/NodePurchase");
const User         = require("../models/User");
const { getNodeSale, getProvider } = require("../config/blockchain");
const { isNoDbMode } = require("../config/database");
const logger = require("../utils/logger");

const router = express.Router();

// ─── Static tier defaults (used in no-DB mode) ────────────────────────────────

const TREASURY = process.env.TREASURY || process.env.DISTRIBUTOR_ADDRESS || "";

const STATIC_TIERS = [
  { tierId: 0, name: "Genesis", priceUSDT: 300e6,  maxSupply: 1000, sold: 0, remaining: 1000, dnrPerEpoch: 1e18,  active: true, treasury: TREASURY, licenseTokenAddress: process.env.GENESIS_LICENSE_ADDRESS  },
  { tierId: 1, name: "Early",   priceUSDT: 500e6,  maxSupply: 2000, sold: 0, remaining: 2000, dnrPerEpoch: 2e18,  active: true, treasury: TREASURY, licenseTokenAddress: process.env.EARLY_LICENSE_ADDRESS   },
  { tierId: 2, name: "Full",    priceUSDT: 1000e6, maxSupply: 1000, sold: 0, remaining: 1000, dnrPerEpoch: 5e18,  active: true, treasury: TREASURY, licenseTokenAddress: process.env.FULL_LICENSE_ADDRESS    },
  { tierId: 3, name: "Premium", priceUSDT: 2000e6, maxSupply: 500,  sold: 0, remaining: 500,  dnrPerEpoch: 10e18, active: true, treasury: TREASURY, licenseTokenAddress: process.env.PREMIUM_LICENSE_ADDRESS },
];

// ─── GET /tiers ──────────────────────────────────────────────────────────────

router.get("/tiers", async (req, res) => {
  if (isNoDbMode()) return res.json({ tiers: STATIC_TIERS });
  try {
    const config = await SaleConfig.findOne();
    if (!config) return res.status(503).json({ error: "Sale config not initialised" });

    // Optionally hydrate live sold count from chain
    const tiers = config.tiers.map(t => ({
      tierId:              t.tierId,
      name:                t.name,
      priceUSDT:           t.priceUSDT,
      maxSupply:           t.maxSupply,
      sold:                t.sold,
      remaining:           t.maxSupply - t.sold,
      dnrPerEpoch:         t.dnrPerEpoch,
      active:              t.active,
      treasury:            process.env.TREASURY || process.env.DISTRIBUTOR_ADDRESS || "",
      licenseTokenAddress: t.licenseTokenAddress,
    }));

    res.json({ tiers });
  } catch (err) {
    logger.error("[Nodes] tiers error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── GET /stats ──────────────────────────────────────────────────────────────

router.get("/stats", async (req, res) => {
  if (isNoDbMode()) return res.json({ totalNodesSold: 0, totalUSDTRaised: 0, totalDNRDistributed: 0, currentEpoch: 0, nextEpochTime: null });
  try {
    const config      = await SaleConfig.findOne();
    const totalNodes  = await NodePurchase.aggregate([
      { $match: { status: "confirmed" } },
      { $group: { _id: null, total: { $sum: "$quantity" } } },
    ]);

    res.json({
      totalNodesSold:     totalNodes[0]?.total ?? 0,
      totalUSDTRaised:    config?.totalUSDTRaised ?? 0,
      totalDNRDistributed: config?.totalDNRDistributed ?? 0,
      currentEpoch:       config?.currentEpoch ?? 0,
      nextEpochTime:      config?.nextEpochTime ?? null,
    });
  } catch (err) {
    logger.error("[Nodes] stats error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── POST /purchase ───────────────────────────────────────────────────────────
// Called by frontend after the user sends USDT directly to treasury.
// Backend verifies the on-chain transfer then mints the NodeLicense from the
// distributor EOA (EOA→contract call — works on Kortana EVM).

router.post("/purchase", async (req, res) => {
  const schema = z.object({
    txHash:   z.string().min(66).max(66),
    tierId:   z.number().int().min(0).max(3),
    quantity: z.number().int().min(1).max(10),
    buyer:    z.string().min(42).max(42),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid request" });

  const { txHash, tierId, quantity, buyer } = parsed.data;

  try {
    // Idempotency — don't double-mint
    if (!isNoDbMode()) {
      const existing = await NodePurchase.findOne({ txHash });
      if (existing) return res.json({ status: existing.status, alreadyProcessed: true });
    }

    // Verify transaction on chain
    const provider = getProvider();
    const receipt  = await provider.getTransactionReceipt(txHash);
    if (!receipt) return res.status(404).json({ error: "Transaction not found on chain" });
    if (receipt.status !== 1) return res.status(400).json({ error: "Transaction failed on chain" });

    // Verify the tx was a USDT transfer to treasury from buyer
    const ERC20_ABI = [
      "event Transfer(address indexed from, address indexed to, uint256 value)",
    ];
    const treasury = (process.env.TREASURY || process.env.DISTRIBUTOR_ADDRESS || "").toLowerCase();
    const usdtAddr = (process.env.USDT_ADDRESS || "").toLowerCase();

    // Confirm sender matches buyer
    const tx = await provider.getTransaction(txHash);
    if (!tx) return res.status(404).json({ error: "Transaction not found" });
    if (tx.from.toLowerCase() !== buyer.toLowerCase()) {
      return res.status(400).json({ error: "Transaction sender does not match buyer" });
    }
    if (tx.to.toLowerCase() !== usdtAddr) {
      return res.status(400).json({ error: "Transaction is not a USDT transfer" });
    }

    // Decode Transfer event to verify amount
    const usdtIface = new ethers.Interface(ERC20_ABI);
    let transferAmount = 0n;
    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== usdtAddr) continue;
      try {
        const parsed = usdtIface.parseLog({ topics: log.topics, data: log.data });
        if (
          parsed.name === "Transfer" &&
          parsed.args.to.toLowerCase() === treasury
        ) {
          transferAmount = parsed.args.value;
        }
      } catch {}
    }
    if (transferAmount === 0n) {
      return res.status(400).json({ error: "No USDT transfer to treasury found in transaction" });
    }

    // Look up tier price
    let tierData = STATIC_TIERS[tierId];
    if (!isNoDbMode()) {
      const config = await SaleConfig.findOne();
      tierData = config?.tiers?.find(t => t.tierId === tierId) ?? tierData;
    }
    if (!tierData) return res.status(400).json({ error: "Unknown tier" });

    const expectedCost = BigInt(tierData.priceUSDT) * BigInt(quantity);
    if (transferAmount < expectedCost) {
      return res.status(400).json({
        error: `Payment too low: sent ${transferAmount}, expected ${expectedCost}`,
      });
    }

    // Mint NodeLicense from distributor EOA (EOA→contract — works on Kortana EVM)
    const licenseAddresses = [
      process.env.GENESIS_LICENSE_ADDRESS,
      process.env.EARLY_LICENSE_ADDRESS,
      process.env.FULL_LICENSE_ADDRESS,
      process.env.PREMIUM_LICENSE_ADDRESS,
    ];
    const licAddr = licenseAddresses[tierId];
    if (!licAddr) return res.status(500).json({ error: "License address not configured" });

    const LICENSE_ABI = ["function mint(address to, uint256 amount) external"];
    const { ethers: ethersLib } = require("ethers");
    const signer  = new ethersLib.Wallet(process.env.DISTRIBUTOR_PRIVATE_KEY, provider);
    const license = new ethersLib.Contract(licAddr, LICENSE_ABI, signer);

    const mintTx  = await license.mint(buyer, quantity, { gasLimit: 300_000, gasPrice: 1 });
    const mintRec = await mintTx.wait();

    logger.info(`[Purchase] Minted ${quantity}× tier ${tierId} to ${buyer}  mintTx=${mintTx.hash}`);

    // Record in DB
    if (!isNoDbMode()) {
      await NodePurchase.create({
        walletAddress:       buyer.toLowerCase(),
        tierId,
        tierName:            tierData.name,
        quantity,
        pricePerNode:        tierData.priceUSDT,
        totalPaid:           Number(transferAmount),
        txHash,
        mintTxHash:          mintTx.hash,
        blockNumber:         receipt.blockNumber,
        licenseTokenAddress: licAddr,
        status:              "confirmed",
        purchasedAt:         new Date(),
      });

      await SaleConfig.updateOne(
        { "tiers.tierId": tierId },
        { $inc: { "tiers.$.sold": quantity, totalUSDTRaised: Number(transferAmount) } }
      );

      await User.findOneAndUpdate(
        { walletAddress: buyer.toLowerCase() },
        { $setOnInsert: { walletAddress: buyer.toLowerCase() } },
        { upsert: true, new: true }
      );
    }

    return res.json({
      status:    "confirmed",
      mintTxHash: mintTx.hash,
      gasUsed:   mintRec.gasUsed.toString(),
    });

  } catch (err) {
    logger.error("[Purchase] Error:", err);
    return res.status(500).json({ error: err?.reason || err?.message || "Server error" });
  }
});

// ─── POST /faucet ─────────────────────────────────────────────────────────────
// Backend mints 10,000 test USDT to the caller's wallet.
// Distributor EOA pays gas — user needs zero native token.

router.post("/faucet", async (req, res) => {
  const schema = z.object({ walletAddress: z.string().min(42).max(42) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid wallet address" });

  const { walletAddress } = parsed.data;

  try {
    const USDT_ABI = ["function faucet(address to, uint256 amount) external"];
    const provider = getProvider();
    const signer   = new ethers.Wallet(process.env.DISTRIBUTOR_PRIVATE_KEY, provider);
    const usdt     = new ethers.Contract(process.env.USDT_ADDRESS, USDT_ABI, signer);

    const tx = await usdt.faucet(walletAddress, 10_000n * 1_000_000n, {
      gasLimit: 300_000,
      gasPrice: 1,
    });
    await tx.wait();

    logger.info(`[Faucet] Sent 10,000 USDT → ${walletAddress}  tx=${tx.hash}`);
    return res.json({ ok: true, txHash: tx.hash, amount: "10000" });

  } catch (err) {
    logger.error("[Faucet] Error:", err);
    return res.status(500).json({ error: err?.reason || err?.message || "Faucet failed" });
  }
});

// ─── POST /verify-purchase ────────────────────────────────────────────────────

router.post("/verify-purchase", async (req, res) => {
  const schema = z.object({ txHash: z.string().min(66).max(66) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid txHash" });

  const { txHash } = parsed.data;

  try {
    const existing = await NodePurchase.findOne({ txHash });
    if (existing) return res.json({ status: existing.status, purchase: existing });

    const provider = getProvider();
    const receipt  = await provider.getTransactionReceipt(txHash);
    if (!receipt) return res.status(404).json({ error: "Transaction not found on chain" });

    res.json({ status: "pending", blockNumber: receipt.blockNumber });
  } catch (err) {
    logger.error("[Nodes] verify-purchase error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
