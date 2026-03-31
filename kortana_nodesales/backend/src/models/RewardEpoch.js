const mongoose = require("mongoose");

const RecipientSchema = new mongoose.Schema({
  walletAddress: String,
  nodeCount:     Number,
  tierId:        Number,
  dnrAmount:     Number,
  claimed:       { type: Boolean, default: false },
  claimedAt:     Date,
  claimTxHash:   String,
}, { _id: false });

const RewardEpochSchema = new mongoose.Schema({
  epochNumber:          { type: Number, required: true, unique: true },
  startTime:            { type: Date, required: true },
  endTime:              { type: Date },
  totalDNRDistributed:  { type: Number, required: true },
  totalRecipients:      { type: Number, required: true },
  distributionTxHash:   { type: String },
  status:               {
    type: String,
    enum: ["pending","processing","completed","failed"],
    default: "pending",
  },
  recipients: [RecipientSchema],
  errorLog:   { type: String },
}, { timestamps: true });

RewardEpochSchema.index({ status: 1 });

module.exports = mongoose.model("RewardEpoch", RewardEpochSchema);
