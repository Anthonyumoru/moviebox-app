
import { useState, useEffect } from 'react';
import R2Uploader from './R2Uploader';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [movies, setMovies] = useState([]);

  const fetchMovies = async () => {
    const res = await axios.get(`${API_URL}/movies`);
    setMovies(res.data);
  };

  useEffect(() => { fetchMovies(); }, []);

  const handleDelete = async (id) => {
    if(!confirm("Delete this movie?")) return;
    await axios.delete(`${API_URL}/movies/${id}`);
    fetchMovies();
  }

  return (
    <div style={{padding: '20px', maxWidth: '900px', margin: 'auto'}}>
      <h1>🎬 MovieBox</h1>
      <R2Uploader onUpload={fetchMovies} />
      
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px'}}>
        {movies.map(movie => (
          <div key={movie.id} style={{border: '1px solid #ccc', padding: '10px', borderRadius: '8px'}}>
            <h3>{movie.title}</h3>
            <p>{movie.description}</p>
            <video src={movie.videoUrl} controls width="100%" />
            <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
              <a href={movie.videoUrl} download>Download</a>
              <button onClick={() => handleDelete(movie.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
