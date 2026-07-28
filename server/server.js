const updateMovies = require('./models/updateMovies.js');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fileupload = require('express-fileupload');
const uploadRoutes = require('./routes/upload.js'); // 1. ADD THIS

const app = express();

// Middleware
app.use(cors({
    origin: [
        "https://moviebox-app-nu.vercel.app",  // your Vercel frontend
        "http://localhost:5173" // for local testing
    ],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileupload({ 
  useTempFiles: true,
  tempFileDir: '/tmp/'
})); // 2. FIX: Added tempFileDir for Railway

// Connect Routes
app.use('/api/upload', uploadRoutes); // 3. ADD THIS

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
  console.log('MongoDB Connected');
  updateMovies();
})
.catch(err => console.log('MongoDB Error:', err));

// Test Route
app.get('/', (req, res) => {
  res.send('Movibox Server is Running 🔥');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
