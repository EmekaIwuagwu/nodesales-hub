/**
 * Public reward / epoch routes
 *
 * GET /api/rewards/epoch/:n   — epoch details
 * GET /api/rewards/next-epoch — next distribution timestamp
 * GET /api/rewards/history    — paginated epoch history
 */

const express     = require("express");
const RewardEpoch = require("../models/RewardEpoch");
const SaleConfig  = require("../models/SaleConfig");
const { isNoDbMode } = require("../config/database");
const logger      = require("../utils/logger");

const router = express.Router();

router.get("/epoch/:n", async (req, res) => {
  try {
    const epoch = await RewardEpoch.findOne({ epochNumber: parseInt(req.params.n) });
    if (!epoch) return res.status(404).json({ error: "Epoch not found" });
    res.json(epoch);
  } catch (err) {
    logger.error("[Rewards] epoch error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/next-epoch", async (req, res) => {
  try {
    const config = await SaleConfig.findOne();
    res.json({
      nextEpochTimestamp: config?.nextEpochTime
        ? Math.floor(new Date(config.nextEpochTime).getTime() / 1000)
        : null,
      currentEpoch: config?.currentEpoch ?? 0,
    });
  } catch (err) {
    logger.error("[Rewards] next-epoch error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/history", async (req, res) => {
  if (isNoDbMode()) return res.json({ epochs: [], total: 0, page: 1, pages: 0 });
  const page  = Math.max(1, parseInt(req.query.page  || "1"));
  const limit = Math.min(50, parseInt(req.query.limit || "10"));

  try {
    const [epochs, total] = await Promise.all([
      RewardEpoch.find({ status: "completed" })
        .select("-recipients")
        .sort({ epochNumber: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      RewardEpoch.countDocuments({ status: "completed" }),
    ]);

    res.json({ epochs, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    logger.error("[Rewards] history error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
