import { useState, useEffect } from 'react';
import R2Uploader from './components/R2Uploader'
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [dark, setDark] = useState(localStorage.getItem("theme") === "dark");
  const [loading, setLoading] = useState(true);

  const categories = ["All", "Nollywood", "Church Program", "Comedy", "Music Video", "Snapchat", "Drama"];

  // Theme toggle
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  const fetchMovies = async () => {
    setLoading(true);
    const res = await axios.get(`${API_URL}/movies`);
    setMovies(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchMovies(); }, []);

  const handleDelete = async (id) => {
    if (confirm('Delete this movie?')) {
      await axios.delete(`${API_URL}/movies/${id}`);
      fetchMovies();
    }
  };

  // Filter by search + category
  const filtered = movies.filter(m => {
    const matchSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || m.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div style={{padding: '20px', maxWidth: '1300px', margin: 'auto', background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh'}}>
      {/* Header */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
        <h1>MovieBox 🎬</h1>
        <button 
          onClick={() => setDark(!dark)}
          style={{padding: '10px 16px', borderRadius: '8px', border: '1px solid #555', cursor: 'pointer'}}
        >
          {dark? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>

      {/* Search + Category */}
      <div style={{display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap'}}>
        <input 
          type="text"
          placeholder="Search Nollywood, Church..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #555'}}
        />
        <select 
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
          style={{padding: '10px', borderRadius: '8px', border: '1px solid #555'}}
        >
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <R2Uploader onUpload={fetchMovies} />

      {loading? <p>Loading...</p> : (
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px'}}>
          {filtered.map(movie => (
            <div key={movie.id} style={{border: '1px solid #555', padding: '10px', borderRadius: '8px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <h3>{movie.title}</h3>
                {movie.category && <span style={{background: 'red', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '12px'}}>{movie.category}</span>}
              </div>
              <p>{movie.description}</p>
              
              {/* Video hidden until play */}
              <video id={`video-${movie.id}`} src={movie.videoUrl} controls width="100%" style={{display: 'none', borderRadius: '8px'}} />
              
              {/* Buttons */}
              <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                <button 
                  onClick={() => {
                    const vid = document.getElementById(`video-${movie.id}`);
                    vid.style.display = "block";
                    vid.play();
                  }}
                  style={{flex: 1, padding: '8px', background: 'red', color: 'white', border: 'none', borderRadius: '6px'}}
                >
                  ▶️ Play
                </button>
                
                <a 
                  href={movie.videoUrl} 
                  download={`${movie.title}.mp4`}
                  style={{flex: 1, padding: '8px', border: '1px solid #555', borderRadius: '6px', textAlign: 'center', textDecoration: 'none'}}
                >
                  ⬇️ Download
                </a>

                <button onClick={() => handleDelete(movie.id)} style={{padding: '8px 12px', background: '#333', color: 'white', border: 'none', borderRadius: '6px'}}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
