const mongoose = require('mongoose');

const musicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  audioUrl: { type: String, required: true },
  cover: { type: String },
  uploadedBy: { type: String, default: "User" },
  plays: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Music', musicSchema);
