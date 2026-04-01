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

// Trust Render/Vercel reverse proxy so rate limiter sees real client IPs
app.set("trust proxy", 1);

app.use(helmet());

const allowedOrigins = (process.env.ALLOWED_ORIGIN || "http://localhost:5173")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
      return cb(null, true);
    }
    cb(new Error("CORS: origin not allowed"));
  },
  credentials: true,
}));
app.use(express.json({ limit: "10kb" }));
// Skip rate limiting for health check (used by keep-alive ping and Render)
app.use((req, res, next) => {
  if (req.path === "/api/health") return next();
  return apiLimiter(req, res, next);
});

// ─── API routes ───────────────────────────────────────────────────────────────

app.use("/api/auth",    authRoutes);
app.use("/api/nodes",   nodeRoutes);
app.use("/api/user",    userRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/admin",   adminRoutes);

// ─── Public ───────────────────────────────────────────────────────────────────

// ─── Public config (contract addresses served at runtime, no build args needed) ─
app.get("/api/config", (req, res) => {
  res.json({
    usdtAddress:        process.env.USDT_ADDRESS        || "",
    nodeSaleAddress:    process.env.NODE_SALE_ADDRESS    || "",
    rewardVaultAddress: process.env.REWARD_VAULT_ADDRESS || "",
    chainId:            parseInt(process.env.KORTANA_CHAIN_ID || "72511"),
    rpcUrl:             process.env.KORTANA_RPC_URL      || "",
    explorerUrl:        process.env.EXPLORER_URL         || "https://explorer.testnet.kortana.xyz",
  });
});

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

// ─── Serve frontend (when built into /public by Docker) ───────────────────────

const path = require("path");
const fs   = require("fs");
const publicDir = path.join(__dirname, "../public");

if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  // SPA fallback — let React Router handle all non-API routes
  app.get("*", (req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });
} else {
  // ─── 404 (API-only mode, no frontend build present) ────────────────────────
  app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
  });
}

// ─── Error handler ────────────────────────────────────────────────────────────

app.use((err, req, res, next) => {
  logger.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ─── Start ───────────────────────────────────────────────────────────────────

// Keep-alive: ping self every 10 minutes to prevent Render free tier sleep
function startKeepAlive() {
  const renderUrl = process.env.RENDER_EXTERNAL_URL;
  if (!renderUrl) return;
  setInterval(() => {
    const mod = renderUrl.startsWith("https") ? require("https") : require("http");
    mod.get(`${renderUrl}/api/health`, res => {
      res.resume();
    }).on("error", () => {});
  }, 10 * 60 * 1000);
  logger.info(`Keep-alive ping enabled → ${renderUrl}/api/health`);
}

async function start() {
  await connectDB();
  app.listen(PORT, () => logger.info(`Kortana Node Sale API running on :${PORT}`));
  startKeepAlive();

  if (process.env.NODE_ENV !== "test") {
    if (isBlockchainConfigured()) {
      startRewardEngine();
      startEventListener();
      logger.info("Blockchain services started");
    } else {
      logger.warn("Blockchain not fully configured — reward engine and event listener disabled");
      logger.warn("Set KORTANA_RPC_URL, DISTRIBUTOR_PRIVATE_KEY, DNR_ADDRESS to enable");
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
