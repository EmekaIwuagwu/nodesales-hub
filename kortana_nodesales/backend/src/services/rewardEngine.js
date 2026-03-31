/**
 * Kortana Reward Distribution Engine
 *
 * Runs every epoch (default: 24 h / '0 12 * * *').
 * 1. Aggregates all confirmed node holders from MongoDB
 * 2. Calculates DNR per wallet (tier × quantity × dnrRate)
 * 3. Calls RewardVault.distributeRewards() on-chain
 * 4. Persists RewardEpoch + individual UserReward records in a transaction
 */

const cron        = require("node-cron");
const mongoose    = require("mongoose");
const { ethers }  = require("ethers");

const NodePurchase = require("../models/NodePurchase");
const RewardEpoch  = require("../models/RewardEpoch");
const UserReward   = require("../models/UserReward");
const SaleConfig   = require("../models/SaleConfig");
const { getRewardVault } = require("../config/blockchain");
const logger       = require("../utils/logger");
const { alertAdmin } = require("../utils/telegramAlert");

// DNR per license per epoch (18-decimal multiplier applied on-chain, raw here)
const DNR_RATES = { 0: 1, 1: 2, 2: 5, 3: 10 };

// ─── Core distribution logic ─────────────────────────────────────────────────

async function distributeRewards() {
  logger.info("[RewardEngine] Starting epoch distribution...");
  const session = await mongoose.startSession();
  session.startTransaction();

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
      logger.info("[RewardEngine] No active purchasers. Skipping epoch.");
      await session.abortTransaction();
      return;
    }

    // 2. Build reward map: wallet → total DNR (as number, convert to BigInt below)
    const rewardMap = {};
    for (const { _id, totalNodes } of activePurchases) {
      const { wallet, tier } = _id;
      const rate = DNR_RATES[tier] ?? 0;
      rewardMap[wallet] = (rewardMap[wallet] || 0) + totalNodes * rate;
    }

    const recipients = Object.keys(rewardMap);
    const amounts    = recipients.map(w =>
      ethers.parseUnits(rewardMap[w].toString(), 18)
    );
    const totalDNR   = Object.values(rewardMap).reduce((a, b) => a + b, 0);

    // 3. On-chain distribution
    const vault = getRewardVault();
    logger.info(`[RewardEngine] Distributing ${totalDNR} DNR to ${recipients.length} wallets...`);
    const tx      = await vault.distributeRewards(recipients, amounts);
    const receipt = await tx.wait();
    logger.info(`[RewardEngine] Distribution tx: ${receipt.hash}`);

    // 4. Persist epoch record
    const config = await SaleConfig.findOne().session(session);
    const epochNumber = (config?.currentEpoch ?? 0) + 1;

    await RewardEpoch.create([{
      epochNumber,
      startTime:           new Date(),
      totalDNRDistributed: totalDNR,
      totalRecipients:     recipients.length,
      distributionTxHash:  receipt.hash,
      status:              "completed",
      recipients: recipients.map(w => ({
        walletAddress: w,
        dnrAmount:     rewardMap[w],
        claimed:       false,
      })),
    }], { session });

    // 5. Individual UserReward records
    await UserReward.insertMany(
      recipients.map(wallet => ({
        walletAddress: wallet,
        epochNumber,
        tierId:        -1,  // multi-tier — wallet-level summary
        dnrAmount:     rewardMap[wallet],
        pending:       true,
        claimed:       false,
      })),
      { session }
    );

    // 6. Update SaleConfig counters
    const nextEpochTime = new Date(Date.now() + (config?.epochDurationSeconds ?? 86400) * 1000);
    await SaleConfig.updateOne({}, {
      $inc: { currentEpoch: 1, totalDNRDistributed: totalDNR },
      $set: { nextEpochTime },
    }, { session });

    await session.commitTransaction();
    logger.info(`[RewardEngine] Epoch ${epochNumber} complete — ${totalDNR} DNR → ${recipients.length} holders`);

  } catch (err) {
    await session.abortTransaction();
    logger.error("[RewardEngine] Distribution failed:", err);
    await alertAdmin(`CRITICAL: Reward distribution failed\n\`${err.message}\``);
  } finally {
    session.endSession();
  }
}

// ─── Cron schedule: 12:00 UTC daily ──────────────────────────────────────────

function startRewardEngine() {
  const schedule = process.env.REWARD_CRON_SCHEDULE || "0 12 * * *";
  logger.info(`[RewardEngine] Scheduled: ${schedule}`);
  cron.schedule(schedule, distributeRewards);
}

module.exports = { startRewardEngine, distributeRewards };
