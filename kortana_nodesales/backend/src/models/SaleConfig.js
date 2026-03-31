const mongoose = require("mongoose");

const TierConfigSchema = new mongoose.Schema({
  tierId:              Number,
  name:                String,
  priceUSDT:           Number,
  maxSupply:           Number,
  sold:                { type: Number, default: 0 },
  dnrPerEpoch:         Number,
  active:              { type: Boolean, default: true },
  licenseTokenAddress: String,
}, { _id: false });

const SaleConfigSchema = new mongoose.Schema({
  tiers: [TierConfigSchema],
  currentEpoch:         { type: Number, default: 0 },
  epochDurationSeconds: { type: Number, default: 86400 },
  nextEpochTime:        { type: Date },
  totalDNRDistributed:  { type: Number, default: 0 },
  totalUSDTRaised:      { type: Number, default: 0 },
  rewardVaultAddress:   String,
  nodeSaleAddress:      String,
}, { timestamps: true });

module.exports = mongoose.model("SaleConfig", SaleConfigSchema);
