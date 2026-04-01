const mongoose = require("mongoose");

const NodePurchaseSchema = new mongoose.Schema({
  walletAddress:       { type: String, required: true, lowercase: true, index: true },
  tierId:              { type: Number, required: true },
  tierName:            { type: String, required: true },
  quantity:            { type: Number, required: true },
  pricePerNode:        { type: Number, required: true },   // USDT (6-dec integer)
  totalPaid:           { type: Number, required: true },   // USDT (6-dec integer)
  txHash:              { type: String, required: true, unique: true },
  mintTxHash:          { type: String },
  blockNumber:         { type: Number },
  licenseTokenAddress: { type: String },
  status:              { type: String, enum: ["pending","confirmed","failed"], default: "pending" },
  referredBy:          { type: String, lowercase: true },
  referralBonus:       { type: Number, default: 0 },
  network:             { type: String, default: "kortana-mainnet" },
  purchasedAt:         { type: Date, default: Date.now },
}, { timestamps: true });

NodePurchaseSchema.index({ walletAddress: 1, tierId: 1 });
NodePurchaseSchema.index({ status: 1 });

module.exports = mongoose.model("NodePurchase", NodePurchaseSchema);
