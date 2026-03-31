const mongoose = require("mongoose");
const logger   = require("../utils/logger");

let isConnected = false;
let noDb        = false;

async function connectDB() {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    noDb = true;
    logger.warn("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    logger.warn(" MONGODB_URI not set — running in NO-DB mode");
    logger.warn(" API is live but all DB-dependent routes return empty data.");
    logger.warn(" Add MONGODB_URI to backend/.env and restart to enable persistence.");
    logger.warn("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    return;
  }

  mongoose.connection.on("connected",    () => { isConnected = true;  logger.info("MongoDB connected"); });
  mongoose.connection.on("disconnected", () => { isConnected = false; logger.warn("MongoDB disconnected"); });
  mongoose.connection.on("error",        (err) => logger.error("MongoDB error:", err));

  try {
    await mongoose.connect(uri, {
      maxPoolSize:              10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS:          45000,
    });
  } catch (err) {
    logger.error("MongoDB connection failed — falling back to NO-DB mode:", err.message);
    noDb = true;
  }
}

function isDbConnected() { return isConnected; }
function isNoDbMode()    { return noDb; }

module.exports = { connectDB, isDbConnected, isNoDbMode };
