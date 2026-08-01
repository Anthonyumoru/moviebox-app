import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "https://moviebox-backend.umoruanthony345.workers.dev";

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const res = await fetch(`${API_URL}/movies`);
      const data = await res.json();
      setMovies(data);
    } catch (err) {
      console.error("Failed to load movies:", err);
    }
    setLoading(false);
  };

  const categories = ["All", "Nollywood", "Church Program", "Comedy", "Music Video", "Snapchat", "Drama", "Action", "Uncategorized"];

  const filtered = movies.filter((m) => {
    const matchSearch = !search || (m.title && m.title.toLowerCase().includes(search.toLowerCase()));
    const matchCategory = activeCategory === "All" || m.category === activeCategory;
    return matchSearch && matchCategory;
  });

  const moviesByCategory = {};
  if (activeCategory === "All" && !search) {
    categories.slice(1).forEach((cat) => {
      const catMovies = movies.filter((m) => m.category === cat);
      if (catMovies.length > 0) moviesByCategory[cat] = catMovies;
    });
  } else {
    moviesByCategory["Results"] = filtered;
  }

  return (
    <div className="home">
      <div className="search-bar">
        <input
          type="text"
          placeholder="🔍 Search movies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="category-pills">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`pill ${activeCategory === cat ? "pill-active" : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading && <p className="empty">Loading movies...</p>}

      {!loading && filtered.length === 0 && (
        <p className="empty">No movies found. Try a different search or upload one!</p>
      )}

      {!loading && filtered.length > 0 && (
        <div className="movie-sections">
          {Object.entries(moviesByCategory).map(([category, catMovies]) => (
            <div key={category} className="movie-row">
              <h2 className="row-title">{category}</h2>
              <div className="movie-scroll">
                {catMovies.map((movie) => (
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
                    <a
                      href={movie.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="play-btn"
                    >
                      ▶ Play
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
