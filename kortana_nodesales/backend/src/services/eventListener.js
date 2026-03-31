/**
 * Blockchain Event Listener
 * Listens for NodePurchased events and syncs to MongoDB.
 * Idempotent — already-processed transactions are skipped.
 */

const { ethers }    = require("ethers");
const NodePurchase  = require("../models/NodePurchase");
const SaleConfig    = require("../models/SaleConfig");
const User          = require("../models/User");
const { getProvider, NODE_SALE_ABI } = require("../config/blockchain");
const { processReferralBonus }       = require("./referral");
const logger = require("../utils/logger");

function startEventListener() {
  const provider   = getProvider();
  const nodeSale   = new ethers.Contract(process.env.NODE_SALE_ADDRESS, NODE_SALE_ABI, provider);

  nodeSale.on("NodePurchased", async (buyer, tierId, quantity, totalPaid, timestamp, event) => {
    const txHash = event.log.transactionHash;
    logger.info(`[EventListener] NodePurchased: ${buyer} tier=${tierId} qty=${quantity} tx=${txHash}`);

    try {
      // Idempotency guard
      const existing = await NodePurchase.findOne({ txHash });
      if (existing) {
        logger.info(`[EventListener] Already recorded: ${txHash}`);
        return;
      }

      const config = await SaleConfig.findOne();
      const tierData = config?.tiers?.find(t => t.tierId === Number(tierId));
      const tierName = tierData?.name ?? `Tier${tierId}`;
      const pricePerNode = tierData?.priceUSDT ?? 0;

      await NodePurchase.create({
        walletAddress:       buyer.toLowerCase(),
        tierId:              Number(tierId),
        tierName,
        quantity:            Number(quantity),
        pricePerNode,
        totalPaid:           Number(totalPaid),
        txHash,
        blockNumber:         event.log.blockNumber,
        licenseTokenAddress: tierData?.licenseTokenAddress,
        status:              "confirmed",
        purchasedAt:         new Date(Number(timestamp) * 1000),
      });

      // Update sold count + totalRaised
      await SaleConfig.updateOne(
        { "tiers.tierId": Number(tierId) },
        {
          $inc: {
            "tiers.$.sold": Number(quantity),
            totalUSDTRaised: Number(totalPaid),
          },
        }
      );

      // Ensure user record exists
      await User.findOneAndUpdate(
        { walletAddress: buyer.toLowerCase() },
        { $setOnInsert: { walletAddress: buyer.toLowerCase() } },
        { upsert: true, new: true }
      );

      // Referral bonus (async, non-blocking)
      processReferralBonus(buyer.toLowerCase(), Number(tierId), Number(quantity))
        .catch(err => logger.error("[Referral] Error:", err));

    } catch (err) {
      logger.error(`[EventListener] Error processing tx ${txHash}:`, err);
    }
  });

  logger.info("[EventListener] Listening for NodePurchased on Kortana...");
}

module.exports = { startEventListener };
