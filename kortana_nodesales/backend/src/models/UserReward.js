const mongoose = require("mongoose");

const UserRewardSchema = new mongoose.Schema({
  walletAddress:   { type: String, required: true, lowercase: true, index: true },
  epochNumber:     { type: Number, required: true },
  tierId:          { type: Number, required: true },
  dnrAmount:       { type: Number, required: true },
  pending:         { type: Boolean, default: true },
  claimed:         { type: Boolean, default: false },
  claimedAt:       { type: Date },
  claimTxHash:     { type: String },
  autoDistributed: { type: Boolean, default: false },
}, { timestamps: true });

UserRewardSchema.index({ walletAddress: 1, epochNumber: 1 }, { unique: true });
UserRewardSchema.index({ pending: 1 });
UserRewardSchema.index({ walletAddress: 1, claimed: 1 });

module.exports = mongoose.model("UserReward", UserRewardSchema);
