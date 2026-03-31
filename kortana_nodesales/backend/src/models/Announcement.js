const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  body:        { type: String, required: true },
  isPublished: { type: Boolean, default: true },
  pinned:      { type: Boolean, default: false },
  expiresAt:   { type: Date },
}, { timestamps: true });

AnnouncementSchema.index({ isPublished: 1, pinned: -1, createdAt: -1 });

module.exports = mongoose.model("Announcement", AnnouncementSchema);
