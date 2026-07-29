const updateMovies = require('./models/updateMovie.js');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const cloudinary = require('./utils/cloudinary');
const fileUpload = require('express-fileupload');

// Route File Imports
const uploadRoutes = require('./routes/upload.js'); 
const adminRoutes = require('./routes/admin.js'); 
const movieRoutes = require('./routes/movies.js'); // Newly added resource mapping

const app = express();

// Security CORS Configuration Middleware
app.use(cors({
  origin: [
    "https://moviebox-app-nu.vercel.app", // Your primary production frontend (No trailing slash)
    "https://moviebox-h5frxsczo-umoruanthony965-4125s-projects.vercel.app", // Your active development branch
    "http://localhost:5173" // Local client development testing environment
  ],
  credentials: true
}));

// Payload Parsing & Media Temporary File Storage Setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/' // Vital configuration patch allowing write access on Railway
}));

// Route Middlewares Mounting Points
app.use('/api/upload', uploadRoutes); 
app.use('/api/admin', adminRoutes); 
app.use('/api/movies', movieRoutes); // Solves the 404 endpoint request error

// Cloudinary Asset Storage Connection
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Database Management Connectivity
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected Successfully');
    updateMovies(); // Automatically invokes TMDB metadata caching initialization script
  })
  .catch((err) => console.log('MongoDB Core Connectivity Error:', err));

// Fallback Diagnostic Server Check Routing
app.get('/', (req, res) => {
  res.send('MovieBox API Server Environment is Live');
});

// Server Initialization Ports Listeners
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Active server system running seamlessly on port ${PORT}`));
