const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  poster: { type: String },
  backdrop: { type: String },
  rating: { type: Number },
  trailer: { type: String },
  videoUrl: { type: String },  // for uploaded movies
  description: { type: String },
  uploadedBy: { type: String, default: "Admin" },
  source: { type: String, default: "upload" } // upload instead of tmdb
}, { timestamps: true });

module.exports = mongoose.model('MovieUpload', movieSchema);
