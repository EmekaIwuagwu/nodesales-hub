require("dotenv").config();

const express    = require("express");
const helmet     = require("helmet");
const cors       = require("cors");
const { connectDB, isNoDbMode } = require("./config/database");
const { startRewardEngine }  = require("./services/rewardEngine");
const { startEventListener } = require("./services/eventListener");
const { isBlockchainConfigured } = require("./config/blockchain");
const { apiLimiter } = require("./middleware/rateLimiter");
const logger       = require("./utils/logger");
const FAQ          = require("./models/FAQ");
const Announcement = require("./models/Announcement");
const SaleConfig   = require("./models/SaleConfig");

// ─── Routes ──────────────────────────────────────────────────────────────────

const authRoutes    = require("./routes/auth");
const nodeRoutes    = require("./routes/nodes");
const userRoutes    = require("./routes/user");
const rewardRoutes  = require("./routes/rewards");
const adminRoutes   = require("./routes/admin");

// ─── App setup ───────────────────────────────────────────────────────────────

const app  = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "10kb" }));
app.use(apiLimiter);

// ─── API routes ───────────────────────────────────────────────────────────────

app.use("/api/auth",    authRoutes);
app.use("/api/nodes",   nodeRoutes);
app.use("/api/user",    userRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/admin",   adminRoutes);

// ─── Public ───────────────────────────────────────────────────────────────────

app.get("/api/faq", async (req, res) => {
  if (isNoDbMode()) return res.json([]);
  try {
    const faqs = await FAQ.find({ isPublished: true }).sort({ order: 1 });
    res.json(faqs);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/announcements", async (req, res) => {
  if (isNoDbMode()) return res.json([]);
  try {
    const now = new Date();
    const announcements = await Announcement.find({
      isPublished: true,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    }).sort({ pinned: -1, createdAt: -1 }).limit(10);
    res.json(announcements);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/health", async (req, res) => {
  const noDb = isNoDbMode();
  const configExists = noDb ? false : !!(await SaleConfig.findOne().select("_id").lean());
  res.json({
    status:              "ok",
    timestamp:           new Date().toISOString(),
    dbConnected:         !noDb,
    blockchainConfigured: isBlockchainConfigured(),
    configSeeded:        configExists,
  });
});

// ─── 404 ──────────────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// ─── Error handler ────────────────────────────────────────────────────────────

app.use((err, req, res, next) => {
  logger.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ─── Start ───────────────────────────────────────────────────────────────────

async function start() {
  await connectDB();
  app.listen(PORT, () => logger.info(`Kortana Node Sale API running on :${PORT}`));

  if (process.env.NODE_ENV !== "test") {
    if (isBlockchainConfigured()) {
      startRewardEngine();
      startEventListener();
      logger.info("Blockchain services started");
    } else {
      logger.warn("Blockchain not fully configured — reward engine and event listener disabled");
      logger.warn("Set KORTANA_RPC_URL, NODE_SALE_ADDRESS, REWARD_VAULT_ADDRESS, DISTRIBUTOR_PRIVATE_KEY to enable");
    }

    // Warn if SaleConfig has not been seeded (only when DB is connected)
    if (!isNoDbMode()) {
      const config = await SaleConfig.findOne().lean();
      if (!config) {
        logger.warn("SaleConfig not found — run: node scripts/seed.js");
      }
    }
  }
}

start().catch(err => {
  logger.error("Failed to start server:", err);
  process.exit(1);
});
