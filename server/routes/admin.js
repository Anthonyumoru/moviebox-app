const express = require('express');
const router = express.Router();
const cloudinary = require('../utils/cloudinary');
const Movie = require('../models/Movie');
const fs = require('fs');
const path = require('path');

router.post('/sync', async (req, res) => {
  try {
    const moviesPath = path.join(__dirname, '../../admin-uploads/movies');
    const thumbPath = path.join(__dirname, '../../admin-uploads/thumbnails');
    
    if (!fs.existsSync(moviesPath)) return res.json({message: "No movies folder"});
    
    const movieFiles = fs.readdirSync(moviesPath).filter(f => f.endsWith('.mp4'));
    
    for(const movieFile of movieFiles){
      const name = movieFile.replace('.mp4', '');
      const thumbFile = fs.readdirSync(thumbPath).find(f => f.startsWith(name));
      
      if(!thumbFile) continue;
      
      // Upload to Cloudinary
      const videoUpload = await cloudinary.uploader.upload(`${moviesPath}/${movieFile}`, {resource_type: 'video'});
      const thumbUpload = await cloudinary.uploader.upload(`${thumbPath}/${thumbFile}`);
      
      // Save to DB
      await Movie.create({
        title: name,
        videoUrl: videoUpload.secure_url,
        thumbnailUrl: thumbUpload.secure_url,
        isOwnerUpload: true,
        isFeatured: true
      });
      
      // Delete files after upload
      fs.unlinkSync(`${moviesPath}/${movieFile}`);
      fs.unlinkSync(`${thumbPath}/${thumbFile}`);
    }
    
    res.json({message: `Synced ${movieFiles.length} owner movies`});
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

module.exports = router;
