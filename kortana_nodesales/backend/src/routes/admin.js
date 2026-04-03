/**
 * Admin routes (admin JWT required)
 *
 * GET    /api/admin/dashboard
 * POST   /api/admin/distribute
 * PUT    /api/admin/tier/:id
 * GET    /api/admin/users
 * GET    /api/admin/user/:wallet
 * POST   /api/admin/announce
 * PUT    /api/admin/announce/:id
 * DELETE /api/admin/announce/:id
 * POST   /api/admin/faq
 * PUT    /api/admin/faq/:id
 * DELETE /api/admin/faq/:id
 */

const express       = require("express");
const { z }         = require("zod");
const NodePurchase  = require("../models/NodePurchase");
const RewardEpoch   = require("../models/RewardEpoch");
const SaleConfig    = require("../models/SaleConfig");
const User          = require("../models/User");
const UserReward    = require("../models/UserReward");
const FAQ           = require("../models/FAQ");
const Announcement  = require("../models/Announcement");
const { requireAuth } = require("../middleware/auth");
const { adminOnly }   = require("../middleware/adminOnly");
const { distributeRewards, isDistributing } = require("../services/rewardEngine");
const logger = require("../utils/logger");

const router = express.Router();
router.use(requireAuth, adminOnly);

// ─── GET /dashboard ───────────────────────────────────────────────────────────

router.get("/dashboard", async (req, res) => {
  try {
    const [config, totalUsers, recentEpochs, salesToday] = await Promise.all([
      SaleConfig.findOne(),
      User.countDocuments(),
      RewardEpoch.find({ status: "completed" }).sort({ epochNumber: -1 }).limit(5),
      NodePurchase.aggregate([
        {
          $match: {
            status:      "confirmed",
            purchasedAt: { $gte: new Date(Date.now() - 86400000) },
          },
        },
        {
          $group: {
            _id:        "$tierId",
            totalSold:  { $sum: "$quantity" },
            totalUSDT:  { $sum: "$totalPaid" },
          },
        },
      ]),
    ]);

    res.json({
      config,
      totalUsers,
      recentEpochs,
      salesToday,
    });
  } catch (err) {
    logger.error("[Admin] dashboard error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── POST /distribute (manual trigger) ───────────────────────────────────────

router.post("/distribute", async (req, res) => {
  if (isDistributing()) {
    return res.status(409).json({ error: "Distribution already in progress — try again shortly." });
  }
  try {
    // Run async — don't block the HTTP response for a long distribution
    distributeRewards().catch(err => logger.error("[Admin] manual distribute error:", err));
    res.json({ ok: true, message: "Distribution triggered" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PUT /tier/:id ────────────────────────────────────────────────────────────

router.put("/tier/:id", async (req, res) => {
  const tierId = parseInt(req.params.id);
  const schema = z.object({
    active:     z.boolean().optional(),
    priceUSDT:  z.number().positive().optional(),
    maxSupply:  z.number().positive().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });

  try {
    const updates = {};
    if (parsed.data.active    !== undefined) updates["tiers.$.active"]    = parsed.data.active;
    if (parsed.data.priceUSDT !== undefined) updates["tiers.$.priceUSDT"] = parsed.data.priceUSDT;
    if (parsed.data.maxSupply !== undefined) updates["tiers.$.maxSupply"] = parsed.data.maxSupply;

    await SaleConfig.updateOne({ "tiers.tierId": tierId }, { $set: updates });
    res.json({ ok: true });
  } catch (err) {
    logger.error("[Admin] tier update error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── GET /users ───────────────────────────────────────────────────────────────

router.get("/users", async (req, res) => {
  const page    = Math.max(1, parseInt(req.query.page  || "1"));
  const limit   = Math.min(100, parseInt(req.query.limit || "20"));
  const search  = req.query.search;

  const filter = search
    ? { walletAddress: { $regex: search, $options: "i" } }
    : {};

  try {
    const [users, total] = await Promise.all([
      User.find(filter).sort({ joinedAt: -1 }).skip((page - 1) * limit).limit(limit),
      User.countDocuments(filter),
    ]);
    res.json({ users, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    logger.error("[Admin] users error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── GET /user/:wallet ────────────────────────────────────────────────────────

router.get("/user/:wallet", async (req, res) => {
  try {
    const wallet  = req.params.wallet.toLowerCase();
    const [user, purchases, rewards] = await Promise.all([
      User.findOne({ walletAddress: wallet }),
      NodePurchase.find({ walletAddress: wallet }).sort({ purchasedAt: -1 }),
      UserReward.find({ walletAddress: wallet }).sort({ epochNumber: -1 }).limit(20),
    ]);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user, purchases, rewards });
  } catch (err) {
    logger.error("[Admin] user detail error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── FAQ CRUD ─────────────────────────────────────────────────────────────────

router.post("/faq", async (req, res) => {
  const schema = z.object({
    question:    z.string().min(1),
    answer:      z.string().min(1),
    order:       z.number().default(0),
    isPublished: z.boolean().default(true),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });

  try {
    const faq = await FAQ.create(parsed.data);
    res.status(201).json(faq);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/faq/:id", async (req, res) => {
  const schema = z.object({
    question:    z.string().min(1).optional(),
    answer:      z.string().min(1).optional(),
    order:       z.number().optional(),
    isPublished: z.boolean().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, { $set: parsed.data }, { new: true });
    if (!faq) return res.status(404).json({ error: "FAQ not found" });
    res.json(faq);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/faq/:id", async (req, res) => {
  try {
    await FAQ.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ─── ANNOUNCEMENT CRUD ────────────────────────────────────────────────────────

router.post("/announce", async (req, res) => {
  const schema = z.object({
    title:       z.string().min(1),
    body:        z.string().min(1),
    isPublished: z.boolean().default(true),
    pinned:      z.boolean().default(false),
    expiresAt:   z.string().datetime().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });

  try {
    const announcement = await Announcement.create(parsed.data);
    res.status(201).json(announcement);
  } catch (err) {
    logger.error("[Admin] announce error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/announce/:id", async (req, res) => {
  const schema = z.object({
    title:       z.string().min(1).optional(),
    body:        z.string().min(1).optional(),
    isPublished: z.boolean().optional(),
    pinned:      z.boolean().optional(),
    expiresAt:   z.string().datetime().optional().nullable(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id, { $set: parsed.data }, { new: true }
    );
    if (!announcement) return res.status(404).json({ error: "Announcement not found" });
    res.json(announcement);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/announce/:id", async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
