const Movie = require('./movie.js'); // make sure filename matches

const movies = [
  {
    "id": 1,
    "title": "Inception",
    "year": 2010,
    "rating": 8.8,
    "poster": "https://image.tmdb.org/t/p/w500/qmDpIHrmpJINaRKAfWQfftjCdyi.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/s3TBRqn8p7Jd0h9k2eQf7oJk6X.jpg",
    "overview": "A thief who steals corporate secrets through the use of dream-sharing technology...",
    "videoUrl": ""
  },
  {
    "id": 2,
    "title": "The Dark Knight",
    "year": 2008,
    "rating": 9.0,
    "poster": "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6mKaRhLhF0.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/hqkcichhXwK9c2bJ3X5K6L7.jpg",
    "overview": "When the menace known as the Joker wreaks havoc...",
    "videoUrl": ""
  },
  {
    "id": 3,
    "title": "Interstellar",
    "year": 2014,
    "rating": 8.6,
    "poster": "https://image.tmdb.org/t/p/w500/AIYFfDkDqKcY4m5Y7Z8.jpg",
    "backdrop": "https://image.tmdb.org/t/p/original/AIYFfDkDqKcY4m5Y7Z8.jpg",
    "overview": "A team of explorers travel through a wormhole in space...",
    "videoUrl": ""
  },
  {
    "id": 4,
    "title": "Student Tools Demo",
    "year": 2026,
    "rating": 5.0,
    "poster": "https://res.cloudinary.com/dqje0mde5/video/upload/so_1,w_400,h_225,c_fill/student-tools-demo.mp4_qc3t7r.jpg",
    "backdrop": "https://res.cloudinary.com/dqje0mde5/video/upload/so_1,w_400,h_225,c_fill/student-tools-demo.mp4_qc3t7r.jpg",
    "overview": "See how Student Tools works",
    "videoUrl": "https://res.cloudinary.com/dqje0mde5/video/upload/v1785317685/student-tools-demo.mp4_qc3t7r.mp4"
  }
];

const seedDB = async () => {
  await Movie.deleteMany({}); // clear old data
  await Movie.insertMany(movies);
  console.log("Database Seeded!");
}

module.exports = seedDB;
