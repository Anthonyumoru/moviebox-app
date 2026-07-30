import { useState } from 'react';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

export default function R2Uploader({ onUpload }) {
  const [progress, setProgress] = useState(0);
  const [category, setCategory] = useState("CHURCH");

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const title = document.getElementById('title').value;
    const desc = document.getElementById('desc').value;
    if (!title) return alert("Add a title first");

    // 1. Get presigned URL from Worker
    const { data } = await axios.post(`${API_URL}/api/upload-url`, {
      filename: file.name,
      contentType: file.type
    });

    const { url, fields, publicUrl } = data;

    // 2. Upload directly to R2
    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append('file', file);

    await axios.post(url, formData, {
      onUploadProgress: (p) => setProgress(Math.round((p.loaded * 100) / p.total)),
    });

    // 3. Save movie to KV
    const newMovie = {
      title: title,
      description: desc,
      category: category,
      videoUrl: publicUrl,
      posterUrl: "", // we can add thumbnail later
      year: "2026",
      rating: "9.0",
      likes: 0
    };

    await fetch(`${API_URL}/api/videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMovie)
    });

    onUpload(publicUrl);
    alert("Upload complete + Saved to KV!");
    setProgress(0);
    document.getElementById('title').value = "";
    document.getElementById('desc').value = "";
  }

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '10px', padding: '20px', background: '#222', borderRadius: '8px'}}>
      <input id="title" type="text" placeholder="Movie Title" className="p-2 rounded bg-gray-800 text-white" />
      <input id="desc" type="text" placeholder="Description" className="p-2 rounded bg-gray-800 text-white" />
      
      <select value={category} onChange={(e) => setCategory(e.target.value)} className="p-2 rounded bg-gray-800 text-white">
        <option>CHURCH</option>
        <option>COMEDY</option>
        <option>MOVIE</option>
        <option>MUSIC</option>
      </select>

      <input type="file" accept="video/*" onChange={handleFile} className="text-white" />
      {progress > 0 && <p>Uploading: {progress}%</p>}
    </div>
  );
}
