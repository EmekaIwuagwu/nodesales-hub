const mongoose = require("mongoose");
const crypto   = require("crypto");

const UserSchema = new mongoose.Schema({
  walletAddress:         { type: String, required: true, unique: true, lowercase: true },
  nonce:                 { type: String, default: () => crypto.randomBytes(16).toString("hex") },
  referralCode:          { type: String, unique: true, sparse: true },
  referredBy:            { type: String, lowercase: true },
  totalReferrals:        { type: Number, default: 0 },
  totalReferralEarnings: { type: Number, default: 0 },
  joinedAt:              { type: Date, default: Date.now },
  lastLoginAt:           { type: Date },
  isAdmin:               { type: Boolean, default: false },
  isBlacklisted:         { type: Boolean, default: false },
  country:               { type: String },
  notes:                 { type: String },
}, { timestamps: true });

UserSchema.pre("save", function(next) {
  if (!this.referralCode) {
    this.referralCode = this.walletAddress.slice(2, 10).toUpperCase();
  }
  next();
});

UserSchema.methods.refreshNonce = function() {
  this.nonce = crypto.randomBytes(16).toString("hex");
  return this.save();
};

module.exports = mongoose.model("User", UserSchema);
