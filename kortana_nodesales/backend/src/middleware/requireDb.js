const { isNoDbMode } = require("../config/database");

/**
 * Middleware that rejects requests requiring a database when none is connected.
 * Routes that can gracefully return empty data should NOT use this — handle
 * isNoDbMode() inline instead.
 */
function requireDb(req, res, next) {
  if (isNoDbMode()) {
    return res.status(503).json({
      error:   "Database not connected",
      message: "Add MONGODB_URI to backend/.env and restart the server.",
    });
  }
  next();
}

module.exports = { requireDb };
