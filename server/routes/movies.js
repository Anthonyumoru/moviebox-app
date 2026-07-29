const express = require('express');
const router = express.Router();
const Movie = require('../models/movie.js'); // References your existing movie MongoDB structure schema

// HTTP GET Request: Retrieve all stored database assets 
router.get('/', async (req, res) => {
  try {
    const movies = await Movie.find({});
    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
