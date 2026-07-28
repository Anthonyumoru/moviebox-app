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

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload Movie
router.post('/movie', async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title) return res.status(400).json({ error: 'Title is required' });
    if (!req.files ||!req.files.video) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    console.log("Uploading to cloudinary...");
    const result = await cloudinary.uploader.upload(req.files.video.tempFilePath, {
      resource_type: "video",
      folder: "moviebox/movies",
      chunk_size: 6000000 // for big files
    });

    const movie = await Movie.create({
      title,
      description: description || "",
      videoUrl: result.secure_url,
      poster: result.secure_url,
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
    if (!req.files ||!req.files.audio) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    const result = await cloudinary.uploader.upload(req.files.audio.tempFilePath, {
      resource_type: "video",
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
