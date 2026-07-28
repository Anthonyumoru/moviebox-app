const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const fileupload = require('express-fileupload');
const Movie = require('../models/movie');
const Music = require('../models/music');

router.use(fileupload({ useTempFiles: true }));

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload Movie
router.post('/movie', async (req, res) => {
  try {
    const { title, description } = req.body;
    const result = await cloudinary.uploader.upload(req.files.video.tempFilePath, {
      resource_type: "video",
      folder: "moviebox/movies"
    });
    
    const movie = await Movie.create({
      title,
      description,
      videoUrl: result.secure_url,
      poster: result.secure_url,
      source: "upload",
      uploadedBy: "User"
    });
    
    res.json({ success: true, movie });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload Music
router.post('/music', async (req, res) => {
  try {
    const { title, artist } = req.body;
    const result = await cloudinary.uploader.upload(req.files.audio.tempFilePath, {
      resource_type: "video",
      folder: "moviebox/music"
    });
    
    const music = await Music.create({
      title,
      artist,
      audioUrl: result.secure_url,
      uploadedBy: "User"
    });
    
    res.json({ success: true, music });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
