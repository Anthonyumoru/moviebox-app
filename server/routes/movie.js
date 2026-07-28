import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import Movie from "../models/movie.js"


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
// POST /api/movies/seed - add test movies to database
router.post('/seed', async (req, res) => {
  try {
    // Clear old test movies first
    await Movie.deleteMany({})

    const testMovies = [
      { title: "The Dark Knight", year: 2008, poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg", description: "Batman faces the Joker", genre: "Action", status: "approved" },
      { title: "Inception", year: 2010, poster: "https://image.tmdb.org/t/p/w500/edv321aKPqgI0K9C0L9w3fG4z1l.jpg", description: "Dreams within dreams", genre: "Sci-Fi", status: "approved" },
      { title: "Interstellar", year: 2014, poster: "https://image.tmdb.org/t/p/w500/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg", description: "Space exploration", genre: "Sci-Fi", status: "approved" },
      { title: "Avengers: Endgame", year: 2019, poster: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg", description: "The final battle", genre: "Action", status: "approved" }
    ]

    await Movie.insertMany(testMovies)
    res.json({ success: true, message: "4 test movies added" })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
