const express = require('express');
const router = express.Router();
const fileUpload = require('express-fileupload');
const { S3Client } = require("@aws-sdk/client-s3");
const { createPresignedPost } = require("@aws-sdk/s3-presigned-post");
const Movie = require('../models/Movie');
const Music = require('../models/Music');

router.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB limit for temp
}));

// R2 CLIENT
const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// GET PRESIGNED UPLOAD URL - FOR BIG FILES
router.post('/r2-upload-url', async (req, res) => {
  try {
    const { filename, contentType } = req.body;
    const key = `videos/${Date.now()}-${filename}`;
    
    const { url, fields } = await createPresignedPost(s3, {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Conditions: [["content-length-range", 0, 5368709120]], // 5GB max
      Fields: { "Content-Type": contentType, key },
      Expires: 600,
    });
    
    res.json({ 
      url, 
      fields, 
      publicUrl: `${process.env.R2_PUBLIC_URL}/${key}` 
    });
  } catch(err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// OLD CLOUDINARY UPLOAD - KEEP FOR NOW OR DELETE
router.post('/movie', async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    if (!req.files || !req.files.file) return res.status(400).json({ error: 'No video file uploaded' });
    
    // You can delete cloudinary code later. For now use R2 frontend upload
    res.status(400).json({ error: 'Please use /r2-upload-url endpoint for big files' });
    
  } catch(err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
