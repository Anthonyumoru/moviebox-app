import { useState, useEffect } from 'react';
import R2Uploader from './components/R2Uploader';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "https://moviebox-backend.umoruanthony345.workers.dev";

function App() {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [dark, setDark] = useState(localStorage.getItem("theme") === "dark");
  const [loading, setLoading] = useState(true);

  const categories = ["All", "Nollywood", "Church Program", "Comedy", "Music Video", "Snapchat", "Drama", "Action", "Uncategorized"];

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
    try {
      const res = await axios.get(`${API_URL}/movies`);
      setMovies(res.data);
    } catch (err) {
      console.error("Failed to load movies:", err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchMovies(); }, []);

  const handleDelete = async (id) => {
    if (confirm('Delete this movie?')) {
      await axios.delete(`${API_URL}/movies/${id}`);
      fetchMovies();
    }
  };

  const filtered = movies.filter(m => {
    const matchSearch =
      (m.title && m.title.toLowerCase().includes(search.toLowerCase())) ||
      (m.description && m.description.toLowerCase().includes(search.toLowerCase()));
    const matchCat = category === "All" || m.category === category;
    return matchSearch && matchCat;
  });

  // Group movies by category for Netflix-style rows
  const moviesByCategory = {};
  if (category === "All" && !search) {
    categories.slice(1).forEach(cat => {
      const catMovies = movies.filter(m => m.category === cat);
      if (catMovies.length > 0) moviesByCategory[cat] = catMovies;
    });
  } else {
    if (filtered.length > 0) moviesByCategory["Results"] = filtered;
  }

  return (
    <div className="home">
      {/* Header */}
      <div className="nav">
        <div className="nav-left">
          <span className="nav-logo">🎬 MovieBox</span>
        </div>
        <div className="nav-right">
          <button className="theme-toggle" onClick={() => setDark(!dark)}>
            {dark ? "☀️" : "🌙"}
          </button>
        </div>
      </div>

      <div style={{ padding: "16px", maxWidth: "1200px", margin: "0 auto" }}>
        {/* Search */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Search movies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Category Pills */}
        <div className="category-pills">
          {categories.map(cat => (
            <button
              key={cat}
              className={`pill ${category === cat ? "pill-active" : ""}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Upload Component */}
        <R2Uploader onUpload={fetchMovies} />

        {/* Loading */}
        {loading && <p className="empty">Loading movies...</p>}

        {/* No Results */}
        {!loading && filtered.length === 0 && (
          <p className="empty">No movies found. Try a different search or upload one!</p>
        )}

        {/* Netflix-style Category Rows */}
        {!loading && filtered.length > 0 && (
          <div className="movie-sections">
            {Object.entries(moviesByCategory).map(([catName, catMovies]) => (
              <div key={catName} className="movie-row">
                <h2 className="row-title">{catName}</h2>
                <div className="movie-scroll">
                  {catMovies.map(movie => (
                    <div key={movie.id} className="movie-card">
                      <div className="movie-thumb">
                        {movie.posterUrl ? (
                          <img src={movie.posterUrl} alt={movie.title} />
                        ) : (
                          <div className="movie-thumb-placeholder">🎬</div>
                        )}
                      </div>
                      <div className="movie-info">
                        <h3 className="movie-title">{movie.title}</h3>
                        <p className="movie-desc">{movie.description || "No description"}</p>
                        <span className="movie-cat-tag">{movie.category}</span>
                      </div>
                      <div style={{ display: "flex", gap: "6px", padding: "8px" }}>
                        <button
                          onClick={() => {
                            const vid = document.getElementById(`video-${movie.id}`);
                            if (vid.style.display === "block") {
                              vid.style.display = "none";
                              vid.pause();
                            } else {
                              vid.style.display = "block";
                              vid.play();
                            }
                          }}
                          className="play-btn"
                          style={{ flex: 1, padding: "8px", border: "none", borderRadius: "6px" }}
                        >
                          ▶️ Play
                        </button>
                        <a
                          href={movie.videoUrl}
                          download={`${movie.title}.mp4`}
                          style={{ flex: 1, padding: "8px", border: "1px solid var(--border)", borderRadius: "6px", textAlign: "center", textDecoration: "none", color: "var(--text)" }}
                        >
                          ⬇️
                        </a>
                        <button
                          onClick={() => handleDelete(movie.id)}
                          style={{ padding: "8px 10px", background: "#333", color: "white", border: "none", borderRadius: "6px" }}
                        >
                          🗑️
                        </button>
                      </div>
                      <video
                        id={`video-${movie.id}`}
                        src={movie.videoUrl}
                        controls
                        style={{ display: "none", width: "100%", borderRadius: "0 0 8px 8px" }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
