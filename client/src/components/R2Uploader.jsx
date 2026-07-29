import { useState } from "react";
import axios from "axios";

export default function R2Uploader({ onUpload }) {
  const [progress, setProgress] = useState(0);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. Get presigned URL from Railway backend
    const { data } = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/upload/r2-upload-url`,
      { filename: file.name, contentType: file.type }
    );

    const { url, fields, publicUrl } = data;

    // 2. Upload directly to R2
    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append("file", file);

    await axios.post(url, formData, {
      onUploadProgress: (p) => setProgress(Math.round((p.loaded * 100) / p.total)),
    });

    // 3. Send publicUrl to your backend to save in DB
    onUpload(publicUrl);
    alert("Upload complete! " + publicUrl);
  };

  return (
    <div>
      <input type="file" accept="video/*" onChange={handleFile} />
      {progress > 0 && <p>Uploading: {progress}%</p>}
    </div>
  );
}
