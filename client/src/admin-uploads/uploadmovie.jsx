import { useState } from "react";
import axios from "axios";
import R2Uploader from "../components/R2Uploader";

export default function UploadMovie() {
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSaveMovie = async () => {
    if (!title || !videoUrl) return alert("Add title and upload video first");
    setLoading(true);
    
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/movies`, {
        title,
        videoUrl, // this is the R2 link
      });
      alert("Movie saved!");
      setTitle("");
      setVideoUrl("");
    } catch (err) {
      alert("Error: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h2>Upload Movie to R2</h2>
      
      <input 
        type="text" 
        placeholder="Movie Title" 
        value={title} 
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      />

      <R2Uploader onUpload={(url) => {
        setVideoUrl(url);
        console.log("R2 URL:", url);
      }} />

      {videoUrl && <p style={{ color: "green" }}>Uploaded: {videoUrl}</p>}

      <button 
        onClick={handleSaveMovie} 
        disabled={loading}
        style={{ padding: "10px 20px", marginTop: "10px" }}
      >
        {loading ? "Saving..." : "Save Movie"}
      </button>
    </div>
  );
          }
