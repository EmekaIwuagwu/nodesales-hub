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

const STATIC_TIERS = [
  { tierId: 0, name: "Genesis", priceUSDT: 300e6,  maxSupply: 1000, sold: 0, remaining: 1000, dnrPerEpoch: 1e18,  active: true },
  { tierId: 1, name: "Early",   priceUSDT: 500e6,  maxSupply: 2000, sold: 0, remaining: 2000, dnrPerEpoch: 2e18,  active: true },
  { tierId: 2, name: "Full",    priceUSDT: 1000e6, maxSupply: 1000, sold: 0, remaining: 1000, dnrPerEpoch: 5e18,  active: true },
  { tierId: 3, name: "Premium", priceUSDT: 2000e6, maxSupply: 500,  sold: 0, remaining: 500,  dnrPerEpoch: 10e18, active: true },
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
