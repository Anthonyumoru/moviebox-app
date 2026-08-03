import { useState, useEffect } from 'react';
import R2Uploader from './components/R2Uploader';
import CastButton from './components/CastButton';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [movies, setMovies] = useState([]);
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [mood, setMood] = useState("");
  const [dark, setDark] = useState(localStorage.getItem("theme") === "dark");
  const [loading, setLoading] = useState(true);
  const [showRequests, setShowRequests] = useState(false);
  const [reqTitle, setReqTitle] = useState("");
  const [reqCategory, setReqCategory] = useState("Nollywood");
  const [reqDesc, setReqDesc] = useState("");
  const [continueWatching, setContinueWatching] = useState([]);

  // ===== AUTH STATE =====
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("currentUser") || "null"));
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [profilePic, setProfilePic] = useState(localStorage.getItem("profilePic") || "");

  const categories = ["All", "Nollywood", "Church Program", "Comedy", "Music Video", "Snapchat", "Drama", "Action", "Uncategorized"];

  const moods = [
    { emoji: "😂", label: "Laugh", cats: ["Comedy"] },
    { emoji: "🙏", label: "Spiritual", cats: ["Church Program"] },
    { emoji: "😢", label: "Emotional", cats: ["Drama"] },
    { emoji: "🎤", label: "Vibes", cats: ["Music Video"] },
    { emoji: "🔥", label: "Thrill", cats: ["Action", "Drama"] },
    { emoji: "📱", label: "Quick", cats: ["Snapchat"] },
  ];

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("continueWatching") || "[]");
    setContinueWatching(saved);
  }, []);

  // ===== AUTH FUNCTIONS =====
  const handleAuth = () => {
    if (!authUsername.trim() || !authPassword.trim()) {
      return alert("Please enter username and password");
    }
    if (authMode === "signup") {
      const users = JSON.parse(localStorage.getItem("users") || "{}");
      if (users[authUsername]) {
        return alert("Username already exists. Please login instead.");
      }
      users[authUsername] = { password: authPassword, joinedAt: Date.now() };
      localStorage.setItem("users", JSON.stringify(users));
      localStorage.setItem("currentUser", JSON.stringify({ username: authUsername }));
      setUser({ username: authUsername });
      setShowAuth(false);
      setAuthUsername("");
      setAuthPassword("");
      alert("✅ Account created! Welcome to NaijaFlix");
    } else {
      const users = JSON.parse(localStorage.getItem("users") || "{}");
      if (!users[authUsername] || users[authUsername].password !== authPassword) {
        return alert("❌ Wrong username or password");
      }
      localStorage.setItem("currentUser", JSON.stringify({ username: authUsername }));
      setUser({ username: authUsername });
      setShowAuth(false);
      setAuthUsername("");
      setAuthPassword("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setUser(null);
    alert("👋 Logged out. See you soon!");
  };

  const uploadProfilePic = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const filename = encodeURIComponent(file.name);
      const contentType = encodeURIComponent(file.type || "image/jpeg");
      const res = await fetch(
        `${API_URL}/api/upload/single?filename=${filename}&contentType=${contentType}`,
        { method: "POST", body: file }
      );
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("profilePic", data.publicUrl);
        setProfilePic(data.publicUrl);
        alert("✅ Profile picture updated!");
      }
    } catch (err) {
      alert("Failed to upload profile picture");
    }
  };

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/movies?t=${Date.now()}`);
      setMovies(res.data);
    } catch (err) {
      console.error("Failed to load movies:", err);
    }
    setLoading(false);
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API_URL}/requests`);
      setRequests(res.data);
    } catch (err) {
      console.error("Failed to load requests:", err);
    }
  };

  useEffect(() => { fetchMovies(); fetchRequests(); }, []);

  const handleDelete = async (id) => {
    if (confirm('Delete this movie?')) {
      await axios.delete(`${API_URL}/movies/${id}`);
      fetchMovies();
    }
  };

  const saveProgress = (movie, progress) => {
    let saved = JSON.parse(localStorage.getItem("continueWatching") || "[]");
    saved = saved.filter(m => m.id !== movie.id);
    if (progress > 0 && progress < 95) {
      saved.unshift({ ...movie, progress, savedAt: Date.now() });
    }
    saved = saved.slice(0, 10);
    localStorage.setItem("continueWatching", JSON.stringify(saved));
    setContinueWatching(saved);
  };

  const voteRequest = async (id) => {
    const voterId = localStorage.getItem("voterId") || `user_${Date.now()}`;
    localStorage.setItem("voterId", voterId);
    try {
      await axios.post(`${API_URL}/requests/${id}/vote`, { voter: voterId });
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to vote");
    }
  };

  const submitRequest = async () => {
    if (!reqTitle.trim()) return alert("Please enter a movie title");
    try {
      await axios.post(`${API_URL}/requests`, {
        title: reqTitle,
        category: reqCategory,
        description: reqDesc,
      });
      setReqTitle("");
      setReqDesc("");
      fetchRequests();
      alert("✅ Request submitted!");
    } catch (err) {
      alert("Failed to submit request");
    }
  };

  const reportMovie = async (movie) => {
    const reason = prompt("Why are you reporting this video?");
    if (!reason) return;
    try {
      await axios.post(`${API_URL}/requests`, {
        title: `🚨 REPORT: ${movie.title}`,
        category: "Report",
        description: `Movie ID: ${movie.id} - ${reason}`,
      });
      alert("✅ Reported! Admin will review it.");
    } catch (err) {
      alert("Failed to report");
    }
  };

  const deleteRequest = async (id) => {
    if (confirm('Delete this request?')) {
      await axios.delete(`${API_URL}/requests/${id}`);
      fetchRequests();
    }
  };

  const filtered = movies.filter(m => {
    const matchSearch =
      (m.title && m.title.toLowerCase().includes(search.toLowerCase())) ||
      (m.description && m.description.toLowerCase().includes(search.toLowerCase()));
    const matchCat = category === "All" || m.category === category;
    const moodCats = mood ? moods.find(mo => mo.label === mood)?.cats : null;
    const matchMood = !mood || (moodCats && moodCats.includes(m.category));
    return m.approved === 1 && matchSearch && matchCat && matchMood;
  });

  const moviesByCategory = {};
  if (category === "All" && !search && !mood) {
    categories.slice(1).forEach(cat => {
      const catMovies = movies.filter(m => m.category === cat && m.approved === 1);
      if (catMovies.length > 0) moviesByCategory[cat] = catMovies;
    });
  } else {
    if (filtered.length > 0) moviesByCategory["Results"] = filtered;
  }

  return (
    <div className="home">
      <div className="nav">
        <div className="nav-left">
          <span className="nav-logo">🎬NaijaFlix</span>
        </div>
        <div className="nav-right" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {user ? (
            <>
              <label style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                {profilePic ? (
                  <img src={profilePic} alt="profile" style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: "20px" }}>👤</span>
                )}
                <span style={{ fontSize: "14px", color: "#888" }}>@{user.username}</span>
                <input type="file" accept="image/*" onChange={uploadProfilePic} style={{ display: "none" }} />
              </label>
              <button className="theme-toggle" onClick={handleLogout} style={{ fontSize: "14px" }}>
                🚪 Logout
              </button>
            </>
          ) : (
            <button className="theme-toggle" onClick={() => { setAuthMode("login"); setShowAuth(true); }} style={{ fontSize: "14px" }}>
              🔑 Login
            </button>
          )}
          <button className="theme-toggle" onClick={() => setShowRequests(!showRequests)} style={{ fontSize: "16px" }}>
            🎯 Requests
          </button>
          <button className="theme-toggle" onClick={() => setDark(!dark)}>
            {dark ? "☀️" : "🌙"}
          </button>
        </div>
      </div>

      {/* ===== AUTH MODAL ===== */}
      {showAuth && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.7)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 9999,
        }}>
          <div style={{
            background: "var(--card)", borderRadius: "12px", padding: "24px",
            maxWidth: "350px", width: "90%", border: "1px solid var(--border)",
          }}>
            <h2 style={{ marginBottom: "16px", textAlign: "center" }}>
              {authMode === "login" ? "🔑 Login" : "📝 Sign Up"}
            </h2>
            <input
              type="text"
              placeholder="Username"
              value={authUsername}
              onChange={(e) => setAuthUsername(e.target.value)}
              style={{ width: "100%", padding: "12px", marginBottom: "12px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", boxSizing: "border-box" }}
            />
            <input
              type="password"
              placeholder="Password"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              style={{ width: "100%", padding: "12px", marginBottom: "16px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", boxSizing: "border-box" }}
            />
            <button
              onClick={handleAuth}
              style={{ width: "100%", padding: "12px", background: "var(--red)", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", marginBottom: "12px" }}
            >
              {authMode === "login" ? "Login" : "Create Account"}
            </button>
            <p style={{ textAlign: "center", fontSize: "14px", color: "#888" }}>
              {authMode === "login" ? "No account? " : "Already have an account? "}
              <span
                style={{ color: "var(--red)", cursor: "pointer", textDecoration: "underline" }}
                onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
              >
                {authMode === "login" ? "Sign up" : "Login"}
              </span>
            </p>
            <button
              onClick={() => setShowAuth(false)}
              style={{ width: "100%", padding: "8px", background: "transparent", color: "#888", border: "none", cursor: "pointer", marginTop: "8px" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={{ padding: "16px", maxWidth: "1200px", margin: "0 auto" }}>
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Search movies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <p style={{ fontSize: "14px", color: "#888", marginBottom: "8px" }}>What's your mood?</p>
          <div className="category-pills">
            <button className={`pill ${mood === "" ? "pill-active" : ""}`} onClick={() => setMood("")}>
              📺 All
            </button>
            {moods.map(mo => (
              <button
                key={mo.label}
                className={`pill ${mood === mo.label ? "pill-active" : ""}`}
                onClick={() => setMood(mo.label)}
              >
                {mo.emoji} {mo.label}
              </button>
            ))}
          </div>
        </div>

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

        {showRequests && (
          <div style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "20px",
          }}>
            <h2 style={{ marginBottom: "16px" }}>🎯 Request a Movie</h2>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
              <input
                type="text"
                placeholder="Movie title you want..."
                value={reqTitle}
                onChange={(e) => setReqTitle(e.target.value)}
                style={{ flex: 1, minWidth: "200px", padding: "10px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)" }}
              />
              <select
                value={reqCategory}
                onChange={(e) => setReqCategory(e.target.value)}
                style={{ padding: "10px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)" }}
              >
                {categories.slice(1).map(c => <option key={c}>{c}</option>)}
              </select>
              <input
                type="text"
                placeholder="Description (optional)"
                value={reqDesc}
                onChange={(e) => setReqDesc(e.target.value)}
                style={{ flex: 1, minWidth: "200px", padding: "10px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)" }}
              />
              <button
                onClick={submitRequest}
                style={{ padding: "10px 20px", background: "var(--red)", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
              >
                Submit
              </button>
            </div>

            {requests.length === 0 ? (
              <p style={{ color: "#888", textAlign: "center" }}>No requests yet. Be the first to request a movie!</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {requests.map(req => (
                  <div
                    key={req.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      background: "var(--bg)",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: "16px", marginBottom: "4px" }}>{req.title}</h3>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <span style={{ fontSize: "12px", background: "var(--red)", color: "white", padding: "2px 8px", borderRadius: "10px" }}>
                          {req.category}
                        </span>
                        {req.description && (
                          <span style={{ fontSize: "12px", color: "#888" }}>{req.description}</span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <button
                        onClick={() => voteRequest(req.id)}
                        style={{
                          padding: "6px 12px",
                          background: "var(--red)",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontWeight: "600",
                        }}
                      >
                        👍 {req.votes || 0}
                      </button>
                      <button
                        onClick={() => deleteRequest(req.id)}
                        style={{
                          padding: "6px 10px",
                          background: "#333",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {user && <R2Uploader onUpload={fetchMovies} />}

        {!loading && continueWatching.length > 0 && !search && !mood && category === "All" && (
          <div className="movie-row" style={{ marginBottom: "32px" }}>
            <h2 className="row-title">▶️ Continue Watching</h2>
            <div className="movie-scroll">
              {continueWatching.map(movie => (
                <div key={movie.id} className="movie-card">
                  <div className="movie-thumb" style={{ position: "relative" }}>
                    {movie.posterUrl ? (
                      <img src={movie.posterUrl} alt={movie.title} />
                    ) : (
                      <div className="movie-thumb-placeholder">🎬</div>
                    )}
                    <div style={{ position: "absolute", bottom: "0", left: "0", right: "0", height: "4px", background: "#333" }}>
                      <div style={{ height: "100%", width: `${movie.progress}%`, background: "var(--red)" }} />
                    </div>
                  </div>
                  <div className="movie-info">
                    <h3 className="movie-title">{movie.title}</h3>
                    <p className="movie-desc">{movie.progress}% watched</p>
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
                      ▶️ Resume
                    </button>
                    <CastButton videoUrl={movie.videoUrl} title={movie.title} />
                  </div>
                  <video
                    id={`video-${movie.id}`}
                    src={movie.videoUrl}
                    controls
                    onTimeUpdate={(e) => {
                      const pct = (e.target.currentTime / e.target.duration) * 100;
                      if (pct % 5 < 1) saveProgress(movie, Math.round(pct));
                    }}
                    style={{ display: "none", width: "100%", borderRadius: "0 0 8px 8px" }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && <p className="empty">Loading movies...</p>}

        {!loading && filtered.length === 0 && (
          <p className="empty">No movies found. Try a different search or upload one!</p>
        )}

        {!loading && filtered.length > 0 && (
          <div className="movie-sections">
            {Object.entries(moviesByCategory).map(([catName, catMovies]) => (
              <div key={catName} className="movie-row">
                <h2 className="row-title">{catName}</h2>
                <div className="movie-scroll">
                  {catMovies.map(movie => (
                    <div key={movie.id} className="movie-card">
                      <div className="movie-thumb" style={{ position: "relative" }}>
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
                      <div style={{ display: "flex", gap: "6px", padding: "8px", flexWrap: "wrap" }}>
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
                          style={{ flex: 1, padding: "8px", border: "none", borderRadius: "6px", minWidth: "60px" }}
                        >
                          ▶️ Play
                        </button>

                        <a
                          href={`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(movie.title + " trailer")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "6px", textAlign: "center", textDecoration: "none", color: "var(--text)" }}
                        >
                          🎬
                        </a>

                        <CastButton videoUrl={movie.videoUrl} title={movie.title} />
                        <a
                          href={movie.videoUrl}
                          download={`${movie.title}.mp4`}
                          style={{ padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "6px", textAlign: "center", textDecoration: "none", color: "var(--text)" }}
                        >
                          ⬇️
                        </a>
                        <button
                          onClick={() => reportMovie(movie)}
                          style={{ padding: "8px 10px", background: "#ff9800", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}
                        >
                          🚨
                        </button>
                        {user && (
                          <button
                            onClick={() => handleDelete(movie.id)}
                            style={{ padding: "8px 10px", background: "#333", color: "white", border: "none", borderRadius: "6px" }}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                      <video
                        id={`video-${movie.id}`}
                        src={movie.videoUrl}
                        controls
                        onTimeUpdate={(e) => {
                          const pct = (e.target.currentTime / e.target.duration) * 100;
                          if (pct % 5 < 1) saveProgress(movie, Math.round(pct));
                        }}
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
