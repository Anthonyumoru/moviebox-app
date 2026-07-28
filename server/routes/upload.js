const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const fileupload = require('express-fileupload');
const Movie = require('../models/movie');
const Music = require('../models/music');

router.use(fileupload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB limit
}));

// Upload Movie
router.post('/movie', async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    if (!req.files ||!req.files.file) return res.status(400).json({ error: 'No video file uploaded' });

    console.log("Uploading movie to cloudinary...");
    const result = await cloudinary.uploader.upload(req.files.file.tempFilePath, {
      resource_type: "video",
      folder: "moviebox/movies",
      chunk_size: 6000000 // for big files
    });

    const movie = await Movie.create({
      title,
      description: description || "",
      videoUrl: result.secure_url,
      poster: result.secure_url, // use video thumbnail as poster
      source: "upload",
      uploadedBy: "User"
    });

    res.json({ success: true, movie });
  } catch(err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// Upload Music
router.post('/music', async (req, res) => {
  try {
    const { title, artist } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    if (!req.files ||!req.files.audio) return res.status(400).json({ error: 'No audio file uploaded' });

    console.log("Uploading music to cloudinary...");
    const result = await cloudinary.uploader.upload(req.files.audio.tempFilePath, {
      resource_type: "video", // cloudinary uses "video" for audio files
      folder: "moviebox/music"
    });

    const music = await Music.create({
      title,
      artist: artist || "Unknown",
      audioUrl: result.secure_url,
      uploadedBy: "User"
    });

    res.json({ success: true, music });
  } catch(err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
