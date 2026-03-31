const User         = require("../models/User");
const NodePurchase = require("../models/NodePurchase");
const logger       = require("../utils/logger");

// 5% referral bonus on USDT paid (recorded off-chain; no on-chain transfer)
const REFERRAL_RATE = 0.05;

// USDT prices per tier (6-decimal integer)
const TIER_PRICES = { 0: 300e6, 1: 500e6, 2: 1000e6, 3: 2000e6 };

async function processReferralBonus(buyerWallet, tierId, quantity) {
  try {
    const buyer = await User.findOne({ walletAddress: buyerWallet });
    if (!buyer || !buyer.referredBy) return;

    const referrer = await User.findOne({ walletAddress: buyer.referredBy });
    if (!referrer) return;

    const bonus = TIER_PRICES[tierId] * quantity * REFERRAL_RATE;

    await User.updateOne(
      { walletAddress: buyer.referredBy },
      {
        $inc: {
          totalReferralEarnings: bonus,
          totalReferrals: 1,
        },
      }
    );

    logger.info(`[Referral] ${buyer.referredBy} earned ${bonus / 1e6} USDT from ${buyerWallet}`);
  } catch (err) {
    logger.error("[Referral] processReferralBonus error:", err);
  }
}

module.exports = { processReferralBonus };
