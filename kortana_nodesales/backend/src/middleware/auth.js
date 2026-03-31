const jwt  = require("jsonwebtoken");
const { isNoDbMode } = require("../config/database");

/**
 * Require a valid JWT.
 * - DB mode:    verifies JWT + loads User from MongoDB → attaches req.user
 * - No-DB mode: verifies JWT only → attaches a synthetic req.user (no DB lookup)
 */
async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (isNoDbMode()) {
      // Synthetic user object — enough for routes that just need wallet / isAdmin
      req.user = {
        walletAddress: payload.wallet,
        isAdmin:       payload.isAdmin ?? false,
        isBlacklisted: false,
        refreshNonce:  async () => {},
      };
      return next();
    }

    const User = require("../models/User");
    const user = await User.findOne({ walletAddress: payload.wallet });
    if (!user || user.isBlacklisted) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = { requireAuth };
