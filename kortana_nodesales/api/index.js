/**
 * Vercel Serverless Entry Point
 *
 * Wraps the Express app for Vercel's serverless runtime.
 * Environment variables are set in the Vercel dashboard.
 */

// Load env from backend/.env in local dev (Vercel uses dashboard env vars)
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: require("path").join(__dirname, "../backend/.env") });
}

const express    = require("express");
const helmet     = require("helmet");
const cors       = require("cors");

const { connectDB, isNoDbMode } = require("../backend/src/config/database");
const { isBlockchainConfigured } = require("../backend/src/config/blockchain");
const { apiLimiter }  = require("../backend/src/middleware/rateLimiter");
const FAQ          = require("../backend/src/models/FAQ");
const Announcement = require("../backend/src/models/Announcement");
const SaleConfig   = require("../backend/src/models/SaleConfig");

// ─── Routes ──────────────────────────────────────────────────────────────────

const authRoutes   = require("../backend/src/routes/auth");
const nodeRoutes   = require("../backend/src/routes/nodes");
const userRoutes   = require("../backend/src/routes/user");
const rewardRoutes = require("../backend/src/routes/rewards");
const adminRoutes  = require("../backend/src/routes/admin");

// ─── App ─────────────────────────────────────────────────────────────────────

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGIN || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

app.use(helmet());
app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (curl, mobile), or listed origins
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
      return cb(null, true);
    }
    cb(new Error("CORS: origin not allowed"));
  },
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

// ─── Cron endpoint (called by Vercel Cron or external scheduler) ──────────────
// Secured with CRON_SECRET so only the scheduler can trigger it.
app.post("/api/cron/distribute", async (req, res) => {
  const secret = req.headers["x-cron-secret"] || req.query.secret;
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const { distributeRewards } = require("../backend/src/services/rewardEngine");
    await distributeRewards();
    res.json({ ok: true, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Public ───────────────────────────────────────────────────────────────────

app.get("/api/faq", async (req, res) => {
  if (isNoDbMode()) return res.json([]);
  try {
    const faqs = await FAQ.find({ isPublished: true }).sort({ order: 1 });
    res.json(faqs);
  } catch { res.status(500).json({ error: "Server error" }); }
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
  } catch { res.status(500).json({ error: "Server error" }); }
});

app.get("/api/health", async (req, res) => {
  const noDb = isNoDbMode();
  const configExists = noDb ? false : !!(await SaleConfig.findOne().select("_id").lean());
  res.json({
    status:               "ok",
    timestamp:            new Date().toISOString(),
    dbConnected:          !noDb,
    blockchainConfigured: isBlockchainConfigured(),
    configSeeded:         configExists,
  });
});

app.use((req, res) => res.status(404).json({ error: "Not found" }));
app.use((err, req, res, next) => res.status(500).json({ error: "Internal server error" }));

// ─── DB init (cached across warm invocations) ─────────────────────────────────

let dbReady = false;
async function ensureDb() {
  if (!dbReady) {
    await connectDB();
    dbReady = true;
  }
}

// ─── Vercel handler ───────────────────────────────────────────────────────────

module.exports = async (req, res) => {
  try {
    await ensureDb();
  } catch (err) {
    // DB failure is non-fatal — routes degrade gracefully via isNoDbMode()
    console.error("[Vercel] ensureDb error:", err.message);
  }
  return app(req, res);
};
