import { useState } from "react";
import { UploadManager } from "../../uploadManager.js";

const API_URL = import.meta.env.VITE_API_URL || "https://moviebox-backend.umoruanthony345.workers.dev";

const manager = new UploadManager({ backendUrl: API_URL });

// Generate a thumbnail from the video file
async function generateThumbnail(file) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    const url = URL.createObjectURL(file);
    video.src = url;

    video.onloadedmetadata = () => {
      // Seek to 1 second or 10% into the video
      video.currentTime = Math.min(1, video.duration * 0.1);
    };

    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to generate thumbnail"));
        }
      }, "image/jpeg", 0.8);
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load video for thumbnail"));
    };
  });
}

export default function R2Uploader({ onUpload }) {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState("Nollywood");

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const title = document.getElementById("title").value;
    const desc = document.getElementById("desc").value;
    if (!title) return alert("⚠️ Please add a Movie Title first");

    setUploading(true);
    setProgress(1);

    try {
      // 1. Generate thumbnail from video
      let posterUrl = "";
      try {
        setProgress(5);
        const thumbBlob = await generateThumbnail(file);
        const thumbFile = new File([thumbBlob], `${title.replace(/\s+/g, "-")}-thumb.jpg`, {
          type: "image/jpeg",
        });
        posterUrl = await manager.upload(thumbFile, {
          onProgress: (uploaded, total) => {
            const percent = 5 + Math.round((uploaded / total) * 10);
            setProgress(percent);
          },
        });
      } catch (err) {
        console.warn("Thumbnail generation failed:", err);
      }

      // 2. Upload the video
      const publicUrl = await manager.upload(file, {
        onProgress: (uploaded, total) => {
          const percent = 15 + Math.round((uploaded / total) * 80);
          setProgress(percent);
        },
      });

      // 3. Save movie metadata with thumbnail
      const saveRes = await fetch(`${API_URL}/movies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title,
          description: desc,
          category: category,
          videoUrl: publicUrl,
          posterUrl: posterUrl,
        }),
      });

      const saveData = await saveRes.json();

      if (!saveData.success) {
        throw new Error("Failed to save movie metadata: " + (saveData.error || "Unknown"));
      }

      setProgress(100);
      onUpload();
      alert("✅ Upload Complete! Your movie is now live");
    } catch (err) {
      console.error("Upload error:", err);
      alert("❌ Upload failed: " + (err.message || "Unknown error"));
    }

    setProgress(0);
    setUploading(false);
    document.getElementById("title").value = "";
    document.getElementById("desc").value = "";
    e.target.value = "";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px", padding: "15px", background: "var(--card)", borderRadius: "8px" }}>
      <h3>📤 Upload New Movie</h3>
      <input id="title" type="text" placeholder="Movie Title - REQUIRED" style={{ padding: "10px", borderRadius: "6px" }} />

      <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: "10px", borderRadius: "6px" }}>
        <option>Nollywood</option>
        <option>Church Program</option>
        <option>Comedy</option>
        <option>Music Video</option>
        <option>Snapchat</option>
        <option>Drama</option>
      </select>

      <input id="desc" type="text" placeholder="Short Description" style={{ padding: "10px", borderRadius: "6px" }} />

      <label style={{ padding: "14px", background: uploading ? "#666" : "var(--red)", color: "white", borderRadius: "6px", textAlign: "center", cursor: "pointer", fontWeight: "bold" }}>
        {uploading ? `⬆️ Uploading... ${progress}%` : "📁 Tap To Choose Video From Phone"}
        <input type="file" accept="video/*" onChange={handleFile} disabled={uploading} style={{ display: "none" }} />
      </label>
    </div>
  );
}
