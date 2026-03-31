const mongoose = require("mongoose");

const FAQSchema = new mongoose.Schema({
  question:    { type: String, required: true },
  answer:      { type: String, required: true },
  order:       { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
}, { timestamps: true });

FAQSchema.index({ isPublished: 1, order: 1 });

module.exports = mongoose.model("FAQ", FAQSchema);
