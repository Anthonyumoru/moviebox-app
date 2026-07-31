import { useState } from 'react';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

export default function R2Uploader({ onUpload }) {
  const [progress, setProgress] = useState(0);
  const [category, setCategory] = useState("Nollywood"); // <-- 1. ADD THIS

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const title = document.getElementById('title').value;
    const desc = document.getElementById('desc').value;
    if (!title) return alert("Add a title first");

    setProgress(1);
    // 1. Get presigned URL
    const { data } = await axios.post(`${API_URL}/api/upload/r2-upload-url`, {
      filename: file.name, contentType: file.type
    });
    const { url, fields, publicUrl } = data;

    // 2. Upload to R2
    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => formData.append(key, value));
    formData.append('file', file);

    await axios.post(url, formData, {
      onUploadProgress: (p) => setProgress(Math.round((p.loaded * 100) / p.total)),
    });

    // 3. Save to KV - ADD CATEGORY HERE
    const newMovie = { 
      title, 
      description: desc, 
      category: category, // <-- 2. ADD THIS LINE
      videoUrl: publicUrl, 
      posterUrl: "" 
    };
    await fetch(`${API_URL}/movies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMovie)
    });

    onUpload(); // refresh list
    alert("Upload complete!");
    setProgress(0);
    document.getElementById('title').value = "";
    document.getElementById('desc').value = "";
  };

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px'}}>
      <input id="title" type="text" placeholder="Movie Title" />
      
      {/* 3. ADD THE DROPDOWN HERE */}
      <select 
        value={category} 
        onChange={(e) => setCategory(e.target.value)}
        style={{padding: '8px', borderRadius: '6px'}}
      >
        <option>Nollywood</option>
        <option>Church Program</option>
        <option>Comedy</option>
        <option>Music Video</option>
        <option>Snapchat</option>
      </select>

      <input id="desc" type="text" placeholder="Description" />
      <input type="file" accept="video/*" onChange={handleFile} />
      {progress > 0 && <p>Uploading: {progress}%</p>}
    </div>
  );
}
