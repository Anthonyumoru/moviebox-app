import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  genre: [String],
  thumbnail: String,
  videoUrl: String,
  duration: Number,
  status: { type: String, enum: ["pending","approved"], default: "pending" },
  views: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("Movie", movieSchema);
