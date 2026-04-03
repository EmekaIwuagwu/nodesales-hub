const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max:      100,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: "Too many requests — please slow down." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:      20,
  message: { error: "Too many auth attempts." },
});

// Faucet: 1 request per wallet per 24 hours (keyed by wallet in body, falls back to IP)
const faucetLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max:      1,
  standardHeaders: true,
  legacyHeaders:   false,
  keyGenerator: (req) => (req.body?.walletAddress || req.ip || "unknown").toLowerCase(),
  message: { error: "Faucet already used in the last 24 hours for this wallet." },
});

module.exports = { apiLimiter, authLimiter, faucetLimiter };
