import Movie from './movie.js';
import axios from 'axios';
import mongoose from 'mongoose';

const TMDB_KEY = process.env.TMDB_KEY;

const updateMovies = async () => {
  console.log("Starting movie update...");
  
  await mongoose.connect(process.env.MONGO_URI);
  
  const movieIds = [27205, 157336, 299534, 155]; // Inception, Interstellar, Endgame, Dark Knight

  for(const id of movieIds) {
    const res = await axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_KEY}&append_to_response=videos`);
    const data = res.data;
    
    const trailer = data.videos.results.find(v => v.type === 'Trailer');
    
    await Movie.findOneAndUpdate(
      { id: data.id },
      {
        id: data.id,
        title: data.title,
        overview: data.overview,
        poster: `https://image.tmdb.org/t/p/w500${data.poster_path}`,
        backdrop: `https://image.tmdb.org/t/p/original${data.backdrop_path}`,
        videoUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : '',
        rating: data.vote_average,
        year: data.release_date.split('-')[0]
      },
      { upsert: true }
    );
    console.log(`Updated: ${data.title}`);
  }
  
  console.log("Movies Updated Successfully!");
  mongoose.disconnect();
}

export default updateMovies;
