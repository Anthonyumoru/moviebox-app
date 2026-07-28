import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import MovieRoutes from "./routes/movie.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test route
app.get("/", (req, res) => res.send("MovieBox Server is Running 🚀"));

// Routes
app.use("/api/movies", movieRoutes);

// Database connection & Server initialization
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => console.error("Database connection failed:", err));
