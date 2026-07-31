import { useState } from 'react';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

export default function R2Uploader({ onUpload }) {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState("Nollywood");

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const title = document.getElementById('title').value;
    const desc = document.getElementById('desc').value;
    if (!title) return alert("⚠️ Please add a Movie Title first");

    setUploading(true);
    setProgress(1);

    try {
      // 1. Upload file directly to Worker (Worker saves to R2)
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(`${API_URL}/api/upload/r2-upload-url`, formData, {
        onUploadProgress: (p) => {
          if (p.total) {
            setProgress(Math.round((p.loaded * 100) / p.total));
          }
        },
      });

      const { success, publicUrl, error } = res.data;

      if (!success) {
        throw new Error(error || "Upload failed");
      }

      // 2. Now save the movie to KV
      await fetch(`${API_URL}/movies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title,
          description: desc,
          category: category,
          videoUrl: publicUrl,
          posterUrl: "",
        }),
      });

      onUpload(); // refresh movies instantly
      alert("✅ Upload Complete! Your movie is now live");

    } catch (err) {
      alert("❌ Upload failed: " + err.message);
    }

    setProgress(0);
    setUploading(false);
    document.getElementById('title').value = "";
    document.getElementById('desc').value = "";
    e.target.value = ""; // reset file input
  };

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', padding: '15px', background: 'var(--card)', borderRadius: '8px'}}>
      <h3>📤 Upload New Movie</h3>
      <input id="title" type="text" placeholder="Movie Title - REQUIRED" style={{padding: '10px', borderRadius: '6px'}} />

      <select value={category} onChange={(e) => setCategory(e.target.value)} style={{padding: '10px', borderRadius: '6px'}}>
        <option>Nollywood</option><option>Church Program</option><option>Comedy</option>
        <option>Music Video</option><option>Snapchat</option><option>Drama</option>
      </select>

      <input id="desc" type="text" placeholder="Short Description" style={{padding: '10px', borderRadius: '6px'}} />

      {/* AUTO UPLOAD BUTTON */}
      <label style={{padding: '14px', background: uploading? '#666' : 'var(--red)', color: 'white', borderRadius: '6px', textAlign: 'center', cursor: 'pointer', fontWeight: 'bold'}}>
        {uploading? `⬆️ Uploading... ${progress}%` : '📁 Tap To Choose Video From Phone'}
        <input type="file" accept="video/*" onChange={handleFile} disabled={uploading} style={{display: 'none'}} />
      </label>

    </div>
  );
}

