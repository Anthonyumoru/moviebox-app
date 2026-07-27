import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import movie from "../models/Movie.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// POST /api/movies/upload
router.post("/upload", upload.fields([{name: 'video'}, {name: 'thumbnail'}]), async (req, res) => {
  try {
    const videoResult = await cloudinary.uploader.upload(req.files.video[0].path, {
      resource_type: "video",
      folder: "moviebox"
    });
    const thumbResult = await cloudinary.uploader.upload(req.files.thumbnail[0].path, {
      folder: "moviebox-thumbs"
    });

    fs.unlinkSync(req.files.video[0].path);
    fs.unlinkSync(req.files.thumbnail[0].path);

    const newMovie = new Movie({
      title: req.body.title,
      description: req.body.description,
      genre: req.body.genre.split(","),
      videoUrl: videoResult.secure_url,
      thumbnail: thumbResult.secure_url,
      duration: videoResult.duration
    });

    await newMovie.save();
    res.json({ success: true, movie: newMovie });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/movies - get all approved
router.get("/", async (req, res) => {
  const movies = await Movie.find({ status: "approved" }).sort({ createdAt: -1 });
  res.json(movies);
});

export default router;
