/**
 * Must be used AFTER requireAuth.
 * Rejects non-admin wallet addresses.
 */
function adminOnly(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

module.exports = { adminOnly };
