import { useEffect, useState } from 'react'
import axios from 'axios'

function App() {
  const [movies, setMovies] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState("dark") // default dark

  // Load saved theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark"
    setTheme(savedTheme)
  }, [])

  // Save theme when it changes
  useEffect(() => {
    localStorage.setItem("theme", theme)
  }, [theme])

  // Fetch movies from backend
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/movies`)
     .then(res => {
        setMovies(res.data)
        setLoading(false)
      })
     .catch(err => {
        console.log("Error fetching movies:", err)
        setLoading(false)
      })
  }, [])

  const filteredMovies = movies.filter(movie =>
    movie.title?.toLowerCase().includes(search.toLowerCase())
  )

  // Theme colors
  const colors = theme === "dark" 
   ? { 
        bg: "#0a0a0a", 
        card: "#1a1a1a", 
        text: "#ffffff", 
        border: "#333", 
        btn1: "#e50914", // Netflix red
        btn2: "#2a2a2a" 
      }
    : { 
        bg: "#f5f5f5", 
        card: "#ffffff", 
        text: "#111", 
        border: "#ddd", 
        btn1: "#e50914", 
        btn2: "#e0e0e0" 
      }

  return (
    <div style={{ padding: 20, background: colors.bg, color: colors.text, minHeight: "100vh", transition: "background 0.3s, color 0.3s" }}>
      
      {/* HEADER WITH THEME TOGGLE */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>🎬 MovieBox</h1>
        
        {/* THEME TOGGLE BUTTON */}
        <button 
          onClick={() => setTheme(theme === "dark"? "light" : "dark")}
          style={{ 
            padding: "10px 18px", 
            background: colors.btn2, 
            color: colors.text, 
            border: `1px solid ${colors.border}`, 
            borderRadius: 8, 
            cursor: "pointer",
            fontSize: 15,
            fontWeight: 600,
            transition: "0.2s"
          }}
        >
          {theme === "dark"? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      {/* SEARCH BAR */}
      <input 
        type="text" 
        placeholder="Search movies..." 
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ 
          padding: "12px 16px", 
          width: "100%",
          maxWidth: 400,
          marginBottom: 30, 
          borderRadius: 8,
          background: colors.card,
          color: colors.text,
          border: `1px solid ${colors.border}`,
          outline: "none",
          fontSize: 16
        }}
      />

      {/* LOADING / EMPTY STATES */}
      {loading && <p>Loading movies...</p>}
      {!loading && filteredMovies.length === 0 && <p>No movies found</p>}

      {/* MOVIE GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
        {filteredMovies.map(movie => (
          <div 
            key={movie.id} 
            style={{ 
              border: `1px solid ${colors.border}`, 
              padding: 16, 
              borderRadius: 12, 
              background: colors.card,
              transition: "transform 0.2s"
            }}
          >
            <h3 style={{ marginTop: 0 }}>{movie.title}</h3>
            {movie.description && <p style={{ fontSize: 14, opacity: 0.8 }}>{movie.description}</p>}
            
            {/* BUTTONS */}
            <div style={{ display: "flex", gap: 10, marginTop: 12, marginBottom: 12 }}>
              {/* PLAY BUTTON */}
              {movie.videoUrl && (
                <a href={movie.videoUrl} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                  <button style={{ 
                    padding: "9px 18px", 
                    background: colors.btn1, 
                    color: "white", 
                    border: "none", 
                    borderRadius: 6, 
                    cursor: "pointer",
                    fontWeight: 600
                  }}>
                    ▶ Play
                  </button>
                </a>
              )}

              {/* DOWNLOAD BUTTON */}
              {movie.videoUrl && (
                <a href={movie.videoUrl} download={`${movie.title}.mp4`} style={{ textDecoration: "none" }}>
                  <button style={{ 
                    padding: "9px 18px", 
                    background: colors.btn2, 
                    color: colors.text, 
                    border: `1px solid ${colors.border}`, 
                    borderRadius: 6, 
                    cursor: "pointer",
                    fontWeight: 600
                  }}>
                    ⬇ Download
                  </button>
                </a>
              )}
            </div>

            {/* VIDEO PLAYER - only if URL exists */}
            {movie.videoUrl && (
              <video 
                src={movie.videoUrl} 
                controls 
                width="100%" 
                style={{ marginTop: 10, borderRadius: 8 }} 
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
