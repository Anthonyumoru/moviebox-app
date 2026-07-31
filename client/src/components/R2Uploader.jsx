
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
      // 1. Get presigned URL from Worker
      const { data } = await axios.post(`${API_URL}/api/upload/r2-upload-url`, {
        filename: file.name,
        contentType: file.type
      });

      if (!data || !data.url) {
        throw new Error("Worker did not return a presigned URL");
      }

      const { url, publicUrl } = data;

      // 2. Upload DIRECTLY to R2 using fetch (NOT axios)
      //    axios crashes on File objects with "Cannot convert undefined or null to object"
      //    fetch handles File/Blob bodies natively
      const uploadRes = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: file,
      });

      if (!uploadRes.ok) {
        const errText = await uploadRes.text().catch(() => 'Unknown R2 error');
        throw new Error(`R2 upload failed (${uploadRes.status}): ${errText}`);
      }

      setProgress(100);

      // 3. Save to KV
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

      onUpload();
      alert("✅ Upload Complete! Your movie is now live");

    } catch (err) {
      console.error("Upload error:", err);
      alert("❌ Upload failed: " + (err.message || "Unknown error"));
    }

    setProgress(0);
    setUploading(false);
    document.getElementById('title').value = "";
    document.getElementById('desc').value = "";
    e.target.value = "";
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

      <label style={{padding: '14px', background: uploading? '#666' : 'var(--red)', color: 'white', borderRadius: '6px', textAlign: 'center', cursor: 'pointer', fontWeight: 'bold'}}>
        {uploading? `⬆️ Uploading... ${progress}%` : '📁 Tap To Choose Video From Phone'}
        <input type="file" accept="video/*" onChange={handleFile} disabled={uploading} style={{display: 'none'}} />
      </label>
    </div>
  );
}

