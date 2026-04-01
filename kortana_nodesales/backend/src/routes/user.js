/**
 * User routes (JWT required)
 *
 * GET  /api/user/portfolio       — nodes, rewards, history
 * GET  /api/user/rewards         — paginated reward history
 * GET  /api/user/pending-rewards — current claimable DNR
 * POST /api/user/claim           — record a user-initiated claim (after on-chain tx)
 * GET  /api/user/referrals       — referral stats
 */

const express      = require("express");
const NodePurchase = require("../models/NodePurchase");
const UserReward   = require("../models/UserReward");
const User         = require("../models/User");
const { requireAuth } = require("../middleware/auth");
const { isNoDbMode } = require("../config/database");
const NodePurchase = require("../models/NodePurchase");
const logger       = require("../utils/logger");

const router = express.Router();

router.use(requireAuth);

// ─── GET /portfolio ───────────────────────────────────────────────────────────

router.get("/portfolio", async (req, res) => {
  if (isNoDbMode()) {
    return res.json({
      wallet: req.user.walletAddress,
      nodeSummary: {}, totalUSDTInvested: 0,
      totalEarned: 0, totalPending: 0, totalClaimed: 0, recentPurchases: [],
    });
  }
  try {
    const wallet = req.user.walletAddress;

    const purchases = await NodePurchase.find({ walletAddress: wallet, status: "confirmed" })
      .sort({ purchasedAt: -1 });

    const rewardSummary = await UserReward.aggregate([
      { $match: { walletAddress: wallet } },
      {
        $group: {
          _id: null,
          totalEarned:  { $sum: "$dnrAmount" },
          totalPending: { $sum: { $cond: ["$pending", "$dnrAmount", 0] } },
          totalClaimed: { $sum: { $cond: ["$claimed", "$dnrAmount", 0] } },
        },
      },
    ]);

    const nodeSummary = purchases.reduce((acc, p) => {
      acc[p.tierId] = (acc[p.tierId] || 0) + p.quantity;
      return acc;
    }, {});

    const totalUSDTInvested = purchases.reduce((sum, p) => sum + p.totalPaid, 0);

    res.json({
      wallet,
      nodeSummary,
      totalUSDTInvested,
      ...rewardSummary[0] || { totalEarned: 0, totalPending: 0, totalClaimed: 0 },
      recentPurchases: purchases.slice(0, 10),
    });
  } catch (err) {
    logger.error("[User] portfolio error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── GET /rewards ─────────────────────────────────────────────────────────────

router.get("/rewards", async (req, res) => {
  if (isNoDbMode()) return res.json({ rewards: [], total: 0, page: 1, pages: 0 });
  const page  = Math.max(1, parseInt(req.query.page  || "1"));
  const limit = Math.min(50, parseInt(req.query.limit || "10"));

  try {
    const [rewards, total] = await Promise.all([
      UserReward.find({ walletAddress: req.user.walletAddress })
        .sort({ epochNumber: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      UserReward.countDocuments({ walletAddress: req.user.walletAddress }),
    ]);

    res.json({ rewards, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    logger.error("[User] rewards error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── GET /pending-rewards ────────────────────────────────────────────────────
// Rewards are sent directly each epoch — "pending" = what they earned this epoch
// so far (based on node holdings), not an on-chain claimable balance.

router.get("/pending-rewards", async (req, res) => {
  try {
    if (isNoDbMode()) return res.json({ pendingDNR: "0" });

    const wallet  = req.user.walletAddress;
    const DNR_RATES = { 0: 1, 1: 2, 2: 5, 3: 10 };

    // Sum up nodes held × rate = DNR they'll earn next epoch
    const purchases = await NodePurchase.find({ walletAddress: wallet, status: "confirmed" });
    let pendingDNR = 0;
    for (const p of purchases) {
      pendingDNR += p.quantity * (DNR_RATES[p.tierId] ?? 0);
    }

    res.json({ pendingDNR: pendingDNR.toString() });
  } catch (err) {
    logger.error("[User] pending-rewards error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── POST /claim ──────────────────────────────────────────────────────────────
// Called by the frontend after the user executes claimRewards() on-chain.
// Marks pending UserReward records as claimed and stores the tx hash.

router.post("/claim", async (req, res) => {
  const schema = require("zod").z.object({ txHash: require("zod").z.string().min(66).max(66) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid txHash" });

  try {
    const wallet = req.user.walletAddress;
    const { txHash } = parsed.data;

    const result = await UserReward.updateMany(
      { walletAddress: wallet, claimed: false, pending: true },
      {
        $set: {
          claimed:         true,
          pending:         false,
          claimedAt:       new Date(),
          claimTxHash:     txHash,
        },
      }
    );

    res.json({ ok: true, updated: result.modifiedCount });
  } catch (err) {
    logger.error("[User] claim record error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── POST /referral ───────────────────────────────────────────────────────────
// Record referrer wallet when a new user arrives via a referral link.
// Only effective once — ignored if referredBy is already set.

router.post("/referral", async (req, res) => {
  const schema = require("zod").z.object({ referrerWallet: require("zod").z.string().min(42).max(42) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid wallet" });

  try {
    const user           = req.user;
    const referrerWallet = parsed.data.referrerWallet.toLowerCase();

    // Prevent self-referral and double-registration
    if (user.referredBy || referrerWallet === user.walletAddress) {
      return res.json({ ok: true, skipped: true });
    }

    // Verify referrer exists
    const referrer = await User.findOne({ walletAddress: referrerWallet });
    if (!referrer) return res.status(404).json({ error: "Referrer not found" });

    await User.updateOne(
      { walletAddress: user.walletAddress },
      { $set: { referredBy: referrerWallet } }
    );

    res.json({ ok: true });
  } catch (err) {
    logger.error("[User] referral error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── GET /referrals ───────────────────────────────────────────────────────────

router.get("/referrals", async (req, res) => {
  try {
    const user = req.user;
    const referrals = await User.find({ referredBy: user.walletAddress })
      .select("walletAddress joinedAt")
      .sort({ joinedAt: -1 });

    res.json({
      referralCode:          user.referralCode,
      totalReferrals:        user.totalReferrals,
      totalReferralEarnings: user.totalReferralEarnings,
      referrals,
    });
  } catch (err) {
    logger.error("[User] referrals error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
