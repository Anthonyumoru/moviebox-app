import { useState, useEffect } from 'react';
import R2Uploader from './components/R2Uploader';
import CastButton from './components/CastButton';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "https://moviebox-backend.umoruanthony345.workers.dev/";

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

  // ===== ADMIN STATE =====
  const [adminKey, setAdminKey] = useState(localStorage.getItem("adminKey") || "");
  const [showAdminSetup, setShowAdminSetup] = useState(false);
  const [adminKeyInput, setAdminKeyInput] = useState("");

  // ===== LIKE / COMMENT STATE =====
  const [likedMovies, setLikedMovies] = useState(JSON.parse(localStorage.getItem("likedMovies") || "[]"));
  const [showComments, setShowComments] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [allComments, setAllComments] = useState({});
  const [likeCounts, setLikeCounts] = useState({});

  // ===== PLAYER STATE =====
  const [selectedMovie, setSelectedMovie] = useState(null);

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
      const key = localStorage.getItem("adminKey") || "";
      const res = await fetch(
        `${API_URL}/api/upload/single?filename=${filename}&contentType=${contentType}`,
        { method: "POST", body: file, headers: { "x-admin-key": key } }
      );
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("profilePic", data.publicUrl);
        setProfilePic(data.publicUrl);
        alert("✅ Profile picture updated!");
      } else {
        alert("❌ " + (data.error || "Upload failed"));
      }
    } catch (err) {
      alert("Failed to upload profile picture");
    }
  };

  // ===== ADMIN FUNCTIONS =====
  const saveAdminKey = () => {
    if (!adminKeyInput.trim()) return alert("Enter your admin key");
    localStorage.setItem("adminKey", adminKeyInput);
    setAdminKey(adminKeyInput);
    setShowAdminSetup(false);
    setAdminKeyInput("");
    alert("✅ Admin key saved! You can now upload and manage videos.");
  };

  const clearAdminKey = () => {
    localStorage.removeItem("adminKey");
    setAdminKey("");
    alert("Admin key removed.");
  };

  // ===== MOVIE FUNCTIONS =====
  const fetchMovies = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/movies?t=${Date.now()}`);
      setMovies(res.data);
      res.data.forEach(async (m) => {
        const likeRes = await axios.get(`${API_URL}/movies/${m.id}/likes`);
        setLikeCounts(prev => ({ ...prev, [m.id]: likeRes.data.likes }));
      });
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
    if (!adminKey) return alert("⚠️ Admin key required. Tap ⚙️ to set it.");
    if (confirm('Delete this movie?')) {
      await axios.delete(`${API_URL}/movies/${id}`, {
        headers: { "x-admin-key": adminKey },
      });
      fetchMovies();
    }
  };

  const approveMovie = async (id) => {
    if (!adminKey) return alert("⚠️ Admin key required.");
    try {
      await axios.post(`${API_URL}/movies/${id}/approve`, {}, {
        headers: { "x-admin-key": adminKey },
      });
      alert("✅ Movie approved!");
      fetchMovies();
    } catch (err) {
      alert("Failed to approve: " + (err.response?.data?.error || "Unknown error"));
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

  const handleDownload = async (movie) => {
    try {
      const res = await fetch(movie.videoUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${movie.title}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      window.open(movie.videoUrl, "_blank");
    }
  };

  // ===== LIKE FUNCTION (D1) =====
  const toggleLike = async (movieId) => {
    if (!user) return alert("Please login to like");
    try {
      const res = await axios.post(`${API_URL}/movies/${movieId}/likes`, {
        username: user.username,
      });
      if (res.data.success) {
        let liked = [...likedMovies];
        if (res.data.action === "liked") {
          liked.push(movieId);
        } else {
          liked = liked.filter(id => id !== movieId);
        }
        setLikedMovies(liked);
        localStorage.setItem("likedMovies", JSON.stringify(liked));
        setLikeCounts(prev => ({ ...prev, [movieId]: res.data.likes }));
      }
    } catch (err) {
      alert("Failed to like");
    }
  };

  // ===== SHARE FUNCTION =====
  const handleShare = async (movie) => {
    const shareUrl = window.location.href;
    const shareText = `🎬 Check out "${movie.title}" on NaijaFlix!`;
    if (navigator.share) {
      try {
        await navigator.share({ title: movie.title, text: shareText, url: shareUrl });
      } catch (err) {}
    } else {
      try {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        alert("🔗 Link copied to clipboard!");
      } catch (err) {
        prompt("Copy this link:", `${shareText} ${shareUrl}`);
      }
    }
  };

  // ===== COMMENT FUNCTIONS (D1) =====
  const fetchComments = async (movieId) => {
    try {
      const res = await axios.get(`${API_URL}/movies/${movieId}/comments`);
      setAllComments(prev => ({ ...prev, [movieId]: res.data }));
    } catch (err) {
      console.error("Failed to load comments:", err);
    }
  };

  const submitComment = async (movieId) => {
    if (!user) return alert("Please login to comment");
    if (!commentText.trim()) return;
    try {
      await axios.post(`${API_URL}/movies/${movieId}/comments`, {
        username: user.username,
        text: commentText,
      });
      setCommentText("");
      fetchComments(movieId);
    } catch (err) {
      alert("Failed to comment");
    }
  };

  const deleteComment = async (commentId, movieId) => {
    if (!adminKey) return alert("⚠️ Admin key required.");
    if (confirm("Delete this comment?")) {
      try {
        await axios.delete(`${API_URL}/comments/${commentId}`, {
          headers: { "x-admin-key": adminKey },
        });
        fetchComments(movieId);
      } catch (err) {
        alert("Failed to delete comment");
      }
    }
  };

  // ===== REQUEST FUNCTIONS =====
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
    if (!adminKey) return alert("⚠️ Admin key required.");
    if (confirm('Delete this request?')) {
      await axios.delete(`${API_URL}/requests/${id}`, {
        headers: { "x-admin-key": adminKey },
      });
      fetchRequests();
    }
  };

  // ===== FILTERING =====
  const filtered = movies.filter(m => {
    const matchSearch =
      (m.title && m.title.toLowerCase().includes(search.toLowerCase())) ||
      (m.description && m.description.toLowerCase().includes(search.toLowerCase()));
    const matchCat = category === "All" || m.category === category;
    const moodCats = mood ? moods.find(mo => mo.label === mood)?.cats : null;
    const matchMood = !mood || (moodCats && moodCats.includes(m.category));
    return matchSearch && matchCat && matchMood;
  });

  const moviesByCategory = {};
  if (category === "All" && !search && !mood) {
    categories.slice(1).forEach(cat => {
      const catMovies = movies.filter(m => m.category === cat);
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
          <button className="theme-toggle" onClick={() => setShowAdminSetup(true)} style={{ fontSize: "16px" }}>
            ⚙️
          </button>
          <button className="theme-toggle" onClick={() => setShowRequests(!showRequests)} style={{ fontSize: "16px" }}>
            🎯 Requests
          </button>
          <button className="theme-toggle" onClick={() => setDark(!dark)}>
            {dark ? "☀️" : "🌙"}
          </button>
        </div>
      </div>

      {/* ===== ADMIN SETUP MODAL ===== */}
      {showAdminSetup && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.7)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 9999,
        }}>
          <div style={{
            background: "var(--card)", borderRadius: "12px", padding: "24px",
            maxWidth: "350px", width: "90%", border: "1px solid var(--border)",
          }}>
            <h2 style={{ marginBottom: "16px", textAlign: "center" }}>⚙️ Admin Setup</h2>
            <p style={{ fontSize: "13px", color: "#888", marginBottom: "12px", textAlign: "center" }}>
              Enter the admin key to upload and manage videos.
            </p>
            <input
              type="password"
              placeholder="Admin key"
              value={adminKeyInput}
              onChange={(e) => setAdminKeyInput(e.target.value)}
              style={{ width: "100%", padding: "12px", marginBottom: "12px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", boxSizing: "border-box" }}
            />
            <button
              onClick={saveAdminKey}
              style={{ width: "100%", padding: "12px", background: "var(--red)", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", marginBottom: "8px" }}
            >
              Save Admin Key
            </button>
            {adminKey && (
              <button
                onClick={clearAdminKey}
                style={{ width: "100%", padding: "10px", background: "transparent", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "6px", cursor: "pointer" }}
              >
                Remove Admin Key
              </button>
            )}
            <button
              onClick={() => setShowAdminSetup(false)}
              style={{ width: "100%", padding: "10px", background: "transparent", color: "#888", border: "none", cursor: "pointer", marginTop: "8px" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

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
            <p style={{ textAlign: "center", color: "#888", fontSize: "14px" }}>
              {authMode === "login" ? "Don't have an account? " : "Already have an account? "}
              <span
                style={{ color: "var(--red)", cursor: "pointer", fontWeight: "600" }}
                onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
              >
                {authMode === "login" ? "Sign Up" : "Login"}
              </span>
            </p>
            <button
              onClick={() => setShowAuth(false)}
              style={{ width: "100%", padding: "10px", background: "transparent", color: "#888", border: "none", cursor: "pointer", marginTop: "8px" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ===== MAIN CONTENT ===== */}
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

        {/* ===== UPLOAD SECTION (Admin only) ===== */}
        {adminKey && <R2Uploader onUpload={fetchMovies} />}

        {/* ===== REQUESTS PANEL ===== */}
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
                        style={{ padding: "6px 12px", background: "var(--red)", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px" }}
                      >
                        👍 {req.votes}
                      </button>
                      {adminKey && (
                        <button
                          onClick={() => deleteRequest(req.id)}
                          style={{ padding: "6px 10px", background: "transparent", color: "#888", border: "1px solid var(--border)", borderRadius: "6px", cursor: "pointer", fontSize: "14px" }}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== CONTINUE WATCHING ===== */}
        {continueWatching.length > 0 && !search && !mood && category === "All" && (
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "18px", marginBottom: "12px" }}>▶️ Continue Watching</h2>
            <div className="movie-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "12px" }}>
              {continueWatching.map(m => (
                <div
                  key={m.id}
                  onClick={() => setSelectedMovie(m)}
                  style={{ cursor: "pointer", borderRadius: "8px", overflow: "hidden", background: "var(--card)", border: "1px solid var(--border)" }}
                >
                  {m.posterUrl ? (
                    <img src={m.posterUrl} alt={m.title} style={{ width: "100%", height: "120px", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "120px", background: "#333", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px" }}>🎬</div>
                  )}
                  <div style={{ padding: "8px" }}>
                    <p style={{ fontSize: "13px", fontWeight: "600", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</p>
                    {m.progress && (
                      <div style={{ height: "3px", background: "#333", borderRadius: "2px", marginTop: "6px" }}>
                        <div style={{ width: `${m.progress}%`, height: "100%", background: "var(--red)", borderRadius: "2px" }} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== MOVIE GRID BY CATEGORY ===== */}
        {loading ? (
          <p style={{ textAlign: "center", color: "#888", padding: "40px" }}>Loading movies...</p>
        ) : Object.keys(moviesByCategory).length === 0 ? (
          <p style={{ textAlign: "center", color: "#888", padding: "40px" }}>No movies found.</p>
        ) : (
          Object.entries(moviesByCategory).map(([catName, catMovies]) => (
            <div key={catName} style={{ marginBottom: "24px" }}>
              <h2 style={{ fontSize: "18px", marginBottom: "12px" }}>{catName}</h2>
              <div className="movie-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "12px" }}>
                {catMovies.map(m => (
                  <div
                    key={m.id}
                    style={{ borderRadius: "8px", overflow: "hidden", background: "var(--card)", border: "1px solid var(--border)" }}
                  >
                    <div onClick={() => setSelectedMovie(m)} style={{ cursor: "pointer" }}>
                      {m.posterUrl ? (
                        <img src={m.posterUrl} alt={m.title} style={{ width: "100%", height: "180px", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "180px", background: "#333", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px" }}>🎬</div>
                      )}
                    </div>
                    <div style={{ padding: "8px" }}>
                      <p style={{ fontSize: "13px", fontWeight: "600", margin: "0 0 4px 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</p>
                      <p style={{ fontSize: "11px", color: "#888", margin: "0 0 6px 0" }}>{m.category}</p>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        <button
                          onClick={() => toggleLike(m.id)}
                          style={{ padding: "4px 8px", border: "1px solid var(--border)", borderRadius: "6px", cursor: "pointer", fontSize: "12px", background: likedMovies.includes(m.id) ? "var(--red)" : "transparent", color: likedMovies.includes(m.id) ? "white" : "var(--text)" }}
                        >
                          ❤️ {likeCounts[m.id] || 0}
                        </button>
                        <button
                          onClick={() => { setShowComments(m.id); fetchComments(m.id); }}
                          style={{ padding: "4px 8px", border: "1px solid var(--border)", borderRadius: "6px", cursor: "pointer", fontSize: "12px", background: "transparent", color: "var(--text)" }}
                        >
                          💬
                        </button>
                        <button
                          onClick={() => handleShare(m)}
                          style={{ padding: "4px 8px", border: "1px solid var(--border)", borderRadius: "6px", cursor: "pointer", fontSize: "12px", background: "transparent", color: "var(--text)" }}
                        >
                          🔗
                        </button>
                        <button
                          onClick={() => handleDownload(m)}
                          style={{ padding: "4px 8px", border: "1px solid var(--border)", borderRadius: "6px", cursor: "pointer", fontSize: "12px", background: "transparent", color: "var(--text)" }}
                        >
                          ⬇️
                        </button>
                        <button
                          onClick={() => reportMovie(m)}
                          style={{ padding: "4px 8px", border: "1px solid var(--border)", borderRadius: "6px", cursor: "pointer", fontSize: "12px", background: "transparent", color: "#ff9800" }}
                        >
                          🚨
                        </button>
                        {adminKey && (
                          <button
                            onClick={() => handleDelete(m.id)}
                            style={{ padding: "4px 8px", border: "1px solid var(--border)", borderRadius: "6px", cursor: "pointer", fontSize: "12px", background: "transparent", color: "#f44336" }}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        {/* ===== COMMENTS MODAL ===== */}
        {showComments && (
          <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.7)", display: "flex",
            alignItems: "center", justifyContent: "center", zIndex: 9999,
          }}>
            <div style={{
              background: "var(--card)", borderRadius: "12px", padding: "20px",
              maxWidth: "500px", width: "90%", maxHeight: "80vh", overflowY: "auto",
              border: "1px solid var(--border)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h2>💬 Comments</h2>
                <button onClick={() => setShowComments(null)} style={{ background: "transparent", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--text)" }}>✕</button>
              </div>
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") submitComment(showComments); }}
                  style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)" }}
                />
                <button
                  onClick={() => submitComment(showComments)}
                  style={{ padding: "10px 16px", background: "var(--red)", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
                >
                  Post
                </button>
              </div>
              {(!allComments[showComments] || allComments[showComments].length === 0) ? (
                <p style={{ color: "#888", textAlign: "center" }}>No comments yet. Be the first!</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {allComments[showComments].map((c, i) => (
                    <div key={c.id || i} style={{ padding: "10px", border: "1px solid var(--border)", borderRadius: "8px", background: "var(--bg)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "13px", fontWeight: "600" }}>@{c.username}</span>
                        {adminKey && (
                          <button
                            onClick={() => deleteComment(c.id, showComments)}
                            style={{ background: "transparent", border: "none", cursor: "pointer", color: "#f44336", fontSize: "14px" }}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                      <p style={{ fontSize: "14px", marginTop: "4px" }}>{c.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== VIDEO PLAYER MODAL ===== */}
        {selectedMovie && (
          <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.9)", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", zIndex: 9999,
          }}>
            <button
              onClick={() => setSelectedMovie(null)}
              style={{ position: "absolute", top: "16px", right: "16px", background: "transparent", border: "none", fontSize: "28px", cursor: "pointer", color: "white" }}
            >
              ✕
            </button>
            <div style={{ maxWidth: "900px", width: "95%" }}>
              <h2 style={{ color: "white", marginBottom: "12px" }}>{selectedMovie.title}</h2>
              <video
                src={selectedMovie.videoUrl}
                controls
                autoPlay
                style={{ width: "100%", borderRadius: "8px" }}
                onTimeUpdate={(e) => {
                  const progress = (e.target.currentTime / e.target.duration) * 100;
                  saveProgress(selectedMovie, progress);
                }}
              />
              <div style={{ display: "flex", gap: "12px", marginTop: "12px", flexWrap: "wrap" }}>
                <button onClick={() => toggleLike(selectedMovie.id)} style={{ padding: "8px 16px", border: "1px solid #444", borderRadius: "6px", cursor: "pointer", color: "white", background: likedMovies.includes(selectedMovie.id) ? "var(--red)" : "transparent" }}>
                  ❤️ {likeCounts[selectedMovie.id] || 0}
                </button>
                <button onClick={() => { setShowComments(selectedMovie.id); fetchComments(selectedMovie.id); }} style={{ padding: "8px 16px", border: "1px solid #444", borderRadius: "6px", cursor: "pointer", color: "white", background: "transparent" }}>
                  💬 Comments
                </button>
                <button onClick={() => handleShare(selectedMovie)} style={{ padding: "8px 16px", border: "1px solid #444", borderRadius: "6px", cursor: "pointer", color: "white", background: "transparent" }}>
                  🔗 Share
                </button>
                <button onClick={() => handleDownload(selectedMovie)} style={{ padding: "8px 16px", border: "1px solid #444", borderRadius: "6px", cursor: "pointer", color: "white", background: "transparent" }}>
                  ⬇️ Download
                </button>
                {adminKey && (
                  <button onClick={() => { handleDelete(selectedMovie.id); setSelectedMovie(null); }} style={{ padding: "8px 16px", border: "1px solid #f44336", borderRadius: "6px", cursor: "pointer", color: "#f44336", background: "transparent" }}>
                    🗑️ Delete
                  </button>
                )}
              </div>
              {selectedMovie.description && (
                <p style={{ color: "#aaa", marginTop: "12px", fontSize: "14px" }}>{selectedMovie.description}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default App;
