const mongoose = require("mongoose");

// Persisted nonces — survive server restarts (unlike in-memory Map).
// TTL index auto-deletes expired documents after 5 minutes.
const NonceSchema = new mongoose.Schema({
  nonce:     { type: String, required: true, unique: true },
  expiresAt: { type: Date,   required: true, index: { expires: 0 } },
});

module.exports = mongoose.model("Nonce", NonceSchema);
