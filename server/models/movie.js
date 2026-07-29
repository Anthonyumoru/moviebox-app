import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  year: { type: Number },
  rating: { type: Number, default: 0 },
  poster: { type: String }, // this is your image
  backdrop: { type: String }, // big background image
  overview: { type: String }, // description
  videoUrl: { type: String }, // THIS IS FOR YOUR VIDEO
  genre: [String],
  description: { type: String },
  thumbnail: { type: String },
  duration: { type: Number },
  status: { type: String, enum: ["pending", "approved"], default: "pending" },
  views: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("Movie", movieSchema);
