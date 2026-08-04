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
              <button onClick={clearAdminKey} style={{ width: "100%", padding: "10px", background: "transparent", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "6
