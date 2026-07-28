const Movie = require('./movie.js'); // make sure filename matches

const movies = [
  {
    "id": 1,
    "title": "Inception",
    "year": 2010,
    "rating": 8.8,
    "poster": "https://image.tmdb.org/t/p/w500/qmDpIHrmpJINaRKAfWQfftjCdyi.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
    "overview": "A thief who steals corporate secrets through the use of dream-sharing technology..."
  },
  {
    "id": 2,
    "title": "The Dark Knight",
    "year": 2008,
    "rating": 9.0,
    "poster": "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/hqkIcbrOHL86UncnHIsHVcVmzue.jpg",
    "overview": "When the menace known as the Joker wreaks havoc..."
  },
  {
    "id": 3,
    "title": "Interstellar",
    "year": 2014,
    "rating": 8.6,
    "poster": "https://image.tmdb.org/t/p/w500/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg",
    "overview": "A team of explorers travel through a wormhole in space..."
  }
];

const seedDB = async () => {
    await Movie.deleteMany({}); // clear old data
    await Movie.insertMany(movies);
    console.log("Database Seeded!");
}

module.exports = seedDB;
