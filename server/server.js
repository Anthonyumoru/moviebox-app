const updateMovies = require('./models/updateMovies.js');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const cloudinary = require('cloudinary');
const fileupload = require('express-fileupload'); // ADD THIS
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(fileupload({ useTempFiles: true })); // ADD THIS
app.use('/api/upload', require('./routes/upload')); // ADD THIS

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Connect to MongoDB
mongoose.set('strict', false);
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('MongoDB Connected ✅');
  updateMovies(); // <-- ADD THIS
})
.catch(err => console.log('MongoDB Error:', err));

// Test Route
app.get('/', (req, res) => {
  res.send('MovieBox Server is Running 🔥');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
