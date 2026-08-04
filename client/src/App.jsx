import { useState, useEffect } from 'react';
import R2Uploader from './components/R2Uploader';
import CastButton from './components/CastButton';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "https://moviebox-backend.umoruanthony345.workers.dev";

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

  const [user, setUser] = useState(JSON.parse(localStorage.getItem("currentUser") || "null"));
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [profilePic, setProfilePic] = useState(localStorage.getItem("profilePic") || "");

  const [adminKey, setAdminKey] = useState(localStorage.getItem("adminKey") || "");
  const [showAdminSetup, setShowAdminSetup] = useState(false);
  const [adminKeyInput, setAdminKeyInput] = useState("");

  const [likedMovies, setLikedMovies] = useState(JSON.parse(localStorage.getItem("likedMovies") || "[]"));
  const [showComments, setShowComments] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [allComments, setAllComments] = useState({});
  const [likeCounts, setLikeCounts] = useState({});

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

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/movies?t=${Date.now()}`);
      setMovies(res.data);
      res.data.forEach(async (m) => {
        try {
          const likeRes = await axios.get(`${API_URL}/movies/${m.id}/likes`);
          setLikeCounts(prev => ({ ...prev, [m.id]: likeRes.data.likes }));
        } catch {}
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
      const res = await axios.post(`${API_URL}/movies/${movieId}/comments`, {
        username: user.username,
        text: commentText,
      });
      if (res.data.success) {
        setCommentText("");
        fetchComments(movieId);
      }
    } catch (err) {
      alert("Failed to comment");
    }
  };

  const deleteComment = async (commentId, movieId) => {
    if (!adminKey) return alert("⚠️ Admin key required.");
    try {
      await axios.delete(`${API_URL}/comments/${commentId}`, {
        headers: { "x-admin-key": adminKey },
      });
      fetchComments(movieId);
    } catch (err) {
      alert("Failed to delete comment");
    }
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
    if (!adminKey) return alert("⚠️ Admin key required.");
    if (confirm('Delete this request?')) {
      await axios.delete(`${API_URL}/requests/${id}`, {
        headers: { "x-admin-key": adminKey },
      });
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
              <button className="theme-toggle" onClick={handleLogout} style={{ fontSize: "14px" }}>🚪 Logout</button>
            </>
          ) : (
            <button className="theme-toggle" onClick={() => { setAuthMode("login"); setShowAuth(true); }} style={{ fontSize: "14px" }}>🔑 Login</button>
          )}
          <button className="theme-toggle" onClick={() => setShowAdminSetup(true)} style={{ fontSize: "16px" }}>⚙️</button>
          <button className="theme-toggle" onClick={() => setShowRequests(!showRequests)} style={{ fontSize: "16px" }}>🎯 Requests</button>
          <button className="theme-toggle" onClick={() => setDark(!dark)}>{dark ? "☀️" : "🌙"}</button>
        </div>
      </div>

      {showAuth && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ background: "var(--card)", borderRadius: "12px", padding: "24px", maxWidth: "350px", width: "90%", border: "1px solid var(--border)" }}>
            <h2 style={{ marginBottom: "16px", textAlign: "center" }}>{authMode === "login" ? "🔑 Login" : "📝 Sign Up"}</h2>
            <input type="text" placeholder="Username" value={authUsername} onChange={(e) => setAuthUsername(e.target.value)} style={{ width: "100%", padding: "12px", marginBottom: "12px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", boxSizing: "border-box" }} />
            <input type="password" placeholder="Password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} style={{ width: "100%", padding: "12px", marginBottom: "16px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", boxSizing: "border-box" }} />
            <button onClick={handleAuth} style={{ width: "100%", padding: "12px", background: "var(--red)", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", marginBottom: "12px" }}>{authMode === "login" ? "Login" : "Create Account"}</button>
            <p style={{ textAlign: "center", fontSize: "14px", color: "#888" }}>
              {authMode === "login" ? (
                <>Don't have an account? <span style={{ color: "var(--red)", cursor: "pointer" }} onClick={() => setAuthMode("signup")}>Sign Up</span></>
              ) : (
                <>Already have an account? <span style={{ color: "var(--red)", cursor: "pointer" }} onClick={() => setAuthMode("login")}>Login</span></>
              )}
            </p>
            <button onClick={() => setShowAuth(false)} style={{ width: "100%", padding: "10px", background: "transparent", color: "#888", border: "none", cursor: "pointer", marginTop: "8px" }}>Cancel</button>
          </div>
        </div>
      )}

      {showAdminSetup && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ background: "var(--card)", borderRadius: "12px", padding: "24px", maxWidth: "350px", width: "90%", border: "1px solid var(--border)" }}>
            <h2 style={{ marginBottom: "16px", textAlign: "center" }}>⚙️ Admin Setup</h2>
            <p style={{ fontSize: "13px", color: "#888", marginBottom: "12px", textAlign: "center" }}>Enter the admin key to upload and manage videos.</p>
            <input type="password" placeholder="Admin key" value={adminKeyInput} onChange={(e) => setAdminKeyInput(e.target.value)} style={{ width: "100%", padding: "12px", marginBottom: "12px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", boxSizing: "border-box" }} />
            <button onClick={saveAdminKey} style={{ width: "100%", padding: "12px", background: "var(--red)", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", marginBottom: "8px" }}>Save Admin Key</button>
            {adminKey && (
              <button onClick={clearAdminKey} style={{ width: "100%", padding: "10px", background: "transparent", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "6px", cursor: "pointer" }}>Remove Admin Key</button>
            )}
            <button onClick={() => setShowAdminSetup(false)} style={{ width: "100%", padding: "10px", background: "transparent", color: "#888", border: "none", cursor: "pointer", marginTop: "8px" }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ padding: "16px", maxWidth: "1200px", margin: "0 auto" }}>
        <div className="search-bar">
          <input type="text" placeholder="🔍 Search movies..." value={search} onChange={(e) => setSearch(e.target.value)} className="search-input" />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <p style={{ fontSize: "14px", color: "#888", marginBottom: "8px" }}>What's your mood?</p>
          <div className="category-pills">
            <button className={`pill ${mood === "" ? "pill-active" : ""}`} onClick={() => setMood("")}>📺 All</button>
            {moods.map(mo => (
              <button key={mo.label} className={`pill ${mood === mo.label ? "pill-active" : ""}`} onClick={() => setMood(mo.label)}>{mo.emoji} {mo.label}</button>
            ))}
          </div>
        </div>

        <div className="category-pills">
          {categories.map(cat => (
            <button key={cat} className={`pill ${category === cat ? "pill-active" : ""}`} onClick={() => setCategory(cat)}>{cat}</button>
          ))}
        </div>

        {adminKey && <R2Uploader onUpload={fetchMovies} />}

        {showRequests && (
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
            <h2 style={{ marginBottom: "16px" }}>🎯 Request a Movie</h2>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
              <input type="text" placeholder="Movie title you want..." value={reqTitle} onChange={(e) => setReqTitle(e.target.value)} style={{ flex: 1, minWidth: "200px", padding: "10px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)" }} />
              <select value={reqCategory} onChange={(e) => setReqCategory(e.target.value)} style={{ padding: "10px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)" }}>
                {categories.slice(1).map(c => <option key={c}>{c}</option>)}
              </select>
              <input type="text" placeholder="Description (optional)" value={reqDesc} onChange={(e) => setReqDesc(e.target.value)} style={{ flex: 1, minWidth: "200px", padding: "10px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)" }} />
              <button onClick={submitRequest} style={{ padding: "10px 20px", background: "var(--red)", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}>Submit</button>
            </div>
            {requests.length === 0 ? (
              <p style={{ color: "#888", textAlign: "center" }}>No requests yet. Be the first to request a movie!</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {requests.map(req => (
                  <div key={req.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", border: "1px solid var(--border)", borderRadius: "8px", background: "var(--bg)" }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: "16px", marginBottom: "4px" }}>{req.title}</h3>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <span style={{ fontSize: "12px", background: "var(--red)", color: "white", padding: "2px 8px", borderRadius: "10px" }}>{req.category}</span>
                        {req.description && <span style={{ fontSize: "12px", color: "#888" }}>{req.description}</span>}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button onClick={() => voteRequest(req.id)} style={{ padding: "6px 12px", background: "var(--red)", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px" }}>👍 {req.votes || 0}</button>
                      {adminKey && (
                        <button onClick={() => deleteRequest(req.id)} style={{ padding: "6px 10px", background: "transparent", color: "#f44336", border: "1px solid #f44336", borderRadius: "6px", cursor: "pointer", fontSize: "14px" }}>🗑️</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {loading ? (
          <p style={{ textAlign: "center", padding: "40px", color: "#888" }}>Loading movies...</p>
        ) : (
          <>
            {continueWatching.length > 0 && (
              <div style={{ marginBottom: "24px" }}>
                <h2 style={{ fontSize: "18px", marginBottom: "12px" }}>▶️ Continue Watching</h2>
                <div className="movie-grid" style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "8px" }}>
                  {continueWatching.map(m => (
                    <div key={m.id} onClick={() => setSelectedMovie(m)} style={{ minWidth: "160px", cursor: "pointer", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border)" }}>
                      <img src={m.posterUrl} alt={m.title} style={{ width: "100%", height: "90px", objectFit: "cover" }} />
                      <div style={{ padding: "8px" }}>
                        <p style={{ fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>{m.title}</p>
                        <div style={{ height: "3px", background: "var(--border)", borderRadius: "2px" }}>
                          <div style={{ width: `${m.progress || 0}%`, height: "100%", background: "var(--red)", borderRadius: "2px" }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {Object.keys(moviesByCategory).length === 0 ? (
              <p style={{ textAlign: "center", padding: "40px", color: "#888" }}>No movies found.</p>
            ) : (
              Object.entries(moviesByCategory).map(([cat, catMovies]) => (
                <div key={cat} style={{ marginBottom: "24px" }}>
                  <h2 style={{ fontSize: "18px", marginBottom: "12px" }}>{cat}</h2>
                  <div className="movie-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px" }}>
                    {catMovies.map(m => (
                      <div key={m.id} style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border)", background: "var(--card)", cursor: "pointer" }} onClick={() => setSelectedMovie(m)}>
                        <div style={{ position: "relative" }}>
                          <img src={m.posterUrl} alt={m.title} style={{ width: "100%", height: "180px", objectFit: "cover" }} />
                          <div style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(0,0,0,0.7)", color: "white", padding: "2px 8px", borderRadius: "10px", fontSize: "12px" }}>❤️ {likeCounts[m.id] || 0}</div>
                        </div>
                        <div style={{ padding: "8px" }}>
                          <p style={{ fontSize: "14px", fontWeight: "600", marginBottom: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.title}</p>
                          <p style={{ fontSize: "12px", color: "#888" }}>{m.category}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
      {selectedMovie && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.9)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "16px" }}>
          <button onClick={() => { setSelectedMovie(null); setShowComments(null); }} style={{ position: "absolute", top: "16px", right: "16px", background: "var(--red)", color: "white", border: "none", borderRadius: "50%", width: "40px", height: "40px", fontSize: "20px", cursor: "pointer" }}>✕</button>
          <div style={{ maxWidth: "800px", width: "100%" }}>
            <video src={selectedMovie.videoUrl} poster={selectedMovie.posterUrl} controls autoPlay style={{ width: "100%", maxHeight: "60vh", borderRadius: "8px", background: "#000" }} onTimeUpdate={(e) => { const progress = (e.target.currentTime / e.target.duration) * 100; saveProgress(selectedMovie, progress); }} />
            <div style={{ marginTop: "12px", display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
              <h2 style={{ fontSize: "18px", flex: 1 }}>{selectedMovie.title}</h2>
              <button onClick={() => toggleLike(selectedMovie.id)} style={{ padding: "8px 12px", background: likedMovies.includes(selectedMovie.id) ? "var(--red)" : "transparent", color: likedMovies.includes(selectedMovie.id) ? "white" : "var(--text)", border: "1px solid var(--border)", borderRadius: "6px", cursor: "pointer" }}>{likedMovies.includes(selectedMovie.id) ? "❤️" : "🤍"} {likeCounts[selectedMovie.id] || 0}</button>
              <button onClick={() => handleShare(selectedMovie)} style={{ padding: "8px 12px", background: "transparent", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "6px", cursor: "pointer" }}>🔗 Share</button>
              <button onClick={() => handleDownload(selectedMovie)} style={{ padding: "8px 12px", background: "transparent", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "6px", cursor: "pointer" }}>⬇️ Download</button>
              <CastButton videoUrl={selectedMovie.videoUrl} />
              <button onClick={() => { showComments === selectedMovie.id ? setShowComments(null) : (setShowComments(selectedMovie.id), fetchComments(selectedMovie.id)); }} style={{ padding: "8px 12px", background: "transparent", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "6px", cursor: "pointer" }}>💬 Comments</button>
              <button onClick={() => reportMovie(selectedMovie)} style={{ padding: "8px 12px", background: "#ff9800", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>🚨 Report</button>
              {adminKey && (
                <>
                  <button onClick={() => approveMovie(selectedMovie.id)} style={{ padding: "8px 12px", background: "#4caf50", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>✅ Approve</button>
                  <button onClick={() => handleDelete(selectedMovie.id)} style={{ padding: "8px 12px", background: "#f44336", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>🗑️ Delete</button>
                </>
              )}
            </div>
            <p style={{ marginTop: "8px", fontSize: "14px", color: "#888" }}>{selectedMovie.description}</p>

            {showComments === selectedMovie.id && (
              <div style={{ marginTop: "16px", background: "var(--card)", borderRadius: "8px", padding: "16px", border: "1px solid var(--border)" }}>
                <h3 style={{ marginBottom: "12px" }}>💬 Comments</h3>
                {user ? (
                  <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                    <input type="text" placeholder="Write a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)" }} />
                    <button onClick={() => submitComment(selectedMovie.id)} style={{ padding: "10px 16px", background: "var(--red)", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>Post</button>
                  </div>
                ) : (
                  <p style={{ fontSize: "13px", color: "#888", marginBottom: "12px" }}>Please login to comment.</p>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {(allComments[selectedMovie.id] || []).length === 0 ? (
                    <p style={{ fontSize: "13px", color: "#888" }}>No comments yet.</p>
                  ) : (
                    (allComments[selectedMovie.id] || []).map((c, i) => (
                      <div key={i} style={{ padding: "10px", background: "var(--bg)", borderRadius: "6px", border: "1px solid var(--border)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: "600", fontSize: "13px" }}>@{c.username}</span>
                          {adminKey && (
                            <button onClick={() => deleteComment(c.id, selectedMovie.id)} style={{ background: "transparent", border: "none", color: "#f44336", cursor: "pointer", fontSize: "12px" }}>🗑️</button>
                          )}
                        </div>
                        <p style={{ fontSize: "14px", marginTop: "4px" }}>{c.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
<div style={{ textAlign: "center", padding: "20px", fontSize: "13px", color: "#888" }}>
        © 2026 NaijaFlix. All rights reserved.
      </div>
    </div>
  );
}
export default App;
