/**
 * Kortana Reward Distribution Engine
 *
 * Kortana EVM: contract→contract CALL is broken (silent no-op).
 * Fix: send native DNR directly from distributor EOA to each holder wallet
 * (plain value transfer — DNR is the native token of Kortana, not ERC-20).
 *
 * Flow every epoch:
 *  1. Aggregate confirmed node holders from MongoDB
 *  2. Calculate DNR per wallet (tier rate × quantity)
 *  3. Send native DNR via signer.sendTransaction({ to: wallet, value }) for each holder
 *  4. Persist RewardEpoch + UserReward records in MongoDB
 */

const cron       = require("node-cron");
const mongoose   = require("mongoose");
const { ethers } = require("ethers");

const NodePurchase = require("../models/NodePurchase");
const RewardEpoch  = require("../models/RewardEpoch");
const UserReward   = require("../models/UserReward");
const SaleConfig   = require("../models/SaleConfig");
const { getProvider } = require("../config/blockchain");
const logger       = require("../utils/logger");
const { alertAdmin } = require("../utils/telegramAlert");

const DNR_RATES = { 0: 1, 1: 2, 2: 5, 3: 10 };

async function distributeRewards() {
  logger.info("[RewardEngine] Starting epoch distribution...");

  try {
    // 1. Aggregate confirmed purchases → wallet+tier totals
    const activePurchases = await NodePurchase.aggregate([
      { $match: { status: "confirmed" } },
      {
        $group: {
          _id: { wallet: "$walletAddress", tier: "$tierId" },
          totalNodes: { $sum: "$quantity" },
        },
      },
    ]);

    if (activePurchases.length === 0) {
      logger.info("[RewardEngine] No active purchasers — skipping epoch.");
      return;
    }

    // 2. Build reward map: wallet → total DNR (integer, converted to wei below)
    const rewardMap = {};
    for (const { _id, totalNodes } of activePurchases) {
      const { wallet, tier } = _id;
      const rate = DNR_RATES[tier] ?? 0;
      rewardMap[wallet] = (rewardMap[wallet] || 0) + totalNodes * rate;
    }

    const recipients = Object.keys(rewardMap);
    const totalDNR   = Object.values(rewardMap).reduce((a, b) => a + b, 0);

    logger.info(`[RewardEngine] ${recipients.length} holders — ${totalDNR} DNR total`);

    // 3. Check distributor native DNR balance
    const provider  = getProvider();
    const signer    = new ethers.Wallet(process.env.DISTRIBUTOR_PRIVATE_KEY, provider);
    const vaultBal  = await provider.getBalance(signer.address);
    const totalWei  = ethers.parseUnits(totalDNR.toString(), 18);

    if (vaultBal < totalWei) {
      const msg = `Distributor DNR balance too low: has ${ethers.formatUnits(vaultBal, 18)}, needs ${totalDNR}`;
      logger.error("[RewardEngine] " + msg);
      await alertAdmin(`CRITICAL: ${msg}`);
      return;
    }

    // 4. Send native DNR directly to each holder wallet
    //    DNR is the native token of Kortana — plain value transfer, not ERC-20
    const txHashes = [];
    for (const wallet of recipients) {
      const amount = ethers.parseUnits(rewardMap[wallet].toString(), 18);
      try {
        const tx = await signer.sendTransaction({
          to:       wallet,
          value:    amount,
          gasLimit: 21_000,
          gasPrice: 1,
        });
        await tx.wait();
        txHashes.push(tx.hash);
        logger.info(`[RewardEngine] Sent ${rewardMap[wallet]} DNR → ${wallet}  tx=${tx.hash}`);
      } catch (err) {
        logger.error(`[RewardEngine] Transfer failed for ${wallet}: ${err.message}`);
        // Continue with remaining wallets
      }
    }

    // 5. Persist epoch record in MongoDB
    const session    = await mongoose.startSession();
    session.startTransaction();
    try {
      const config     = await SaleConfig.findOne().session(session);
      const epochNumber = (config?.currentEpoch ?? 0) + 1;

      await RewardEpoch.create([{
        epochNumber,
        startTime:           new Date(),
        totalDNRDistributed: totalDNR,
        totalRecipients:     recipients.length,
        distributionTxHash:  txHashes[0] ?? "direct-transfer",
        status:              "completed",
        recipients: recipients.map(w => ({
          walletAddress: w,
          dnrAmount:     rewardMap[w],
          claimed:       true,  // auto-sent — no claim needed
        })),
      }], { session });

      await UserReward.insertMany(
        recipients.map(wallet => ({
          walletAddress: wallet,
          epochNumber,
          tierId:        -1,
          dnrAmount:     rewardMap[wallet],
          pending:       false,  // already sent directly
          claimed:       true,
          claimedAt:     new Date(),
        })),
        { session }
      );

      const nextEpochTime = new Date(Date.now() + (config?.epochDurationSeconds ?? 2160) * 1000);
      await SaleConfig.updateOne({}, {
        $inc: { currentEpoch: 1, totalDNRDistributed: totalDNR },
        $set: { nextEpochTime },
      }, { session });

      await session.commitTransaction();
      logger.info(`[RewardEngine] Epoch ${epochNumber} complete — ${totalDNR} DNR → ${recipients.length} holders`);

    } catch (dbErr) {
      await session.abortTransaction();
      logger.error("[RewardEngine] DB persist failed:", dbErr);
    } finally {
      session.endSession();
    }

  } catch (err) {
    logger.error("[RewardEngine] Distribution failed:", err);
    await alertAdmin(`CRITICAL: Reward distribution failed\n\`${err.message}\``);
  }
}

function startRewardEngine() {
  const schedule = process.env.REWARD_CRON_SCHEDULE || "*/36 * * * *";
  logger.info(`[RewardEngine] Scheduled: ${schedule}`);
  cron.schedule(schedule, distributeRewards);
}

module.exports = { startRewardEngine, distributeRewards };
