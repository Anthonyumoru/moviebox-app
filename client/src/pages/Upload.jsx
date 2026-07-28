import { useState } from 'react';
import axios from 'axios';

const API_URL = 'https://moviebox-app-production-dd12.up.railway.app/api/movies'; // CHANGE THIS TO YOUR RAILWAY URL

const Upload = () => {
  const [movieTitle, setMovieTitle] = useState('');
  const [movieDesc, setMovieDesc] = useState('');
  const [movieFile, setMovieFile] = useState(null);

  const [musicTitle, setMusicTitle] = useState('');
  const [musicArtist, setMusicArtist] = useState('');
  const [musicFile, setMusicFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const uploadMovie = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('title', movieTitle);
    formData.append('description', movieDesc);
    formData.append('file', movieFile); // CHANGED: was 'video'

    try {
      const res = await axios.post(`${API_URL}/movie`, formData);
      alert('Movie Uploaded Successfully!');
      console.log(res.data);
      setMovieTitle(''); setMovieDesc(''); setMovieFile(null);
    } catch(err) {
      alert('Movie Upload Failed: ' + err.message);
    }
    setLoading(false);
  }

  const uploadMusic = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('title', musicTitle);
    formData.append('artist', musicArtist);
    formData.append('audio', musicFile);

    try {
      const res = await axios.post(`${API_URL}/music`, formData);
      alert('Music Uploaded Successfully!');
      console.log(res.data);
      setMusicTitle(''); setMusicArtist(''); setMusicFile(null);
    } catch(err) {
      alert('Music Upload Failed: ' + err.message);
    }
    setLoading(false);
  }

  return (
    <div className="p-8 text-white min-h-screen bg-black">
      <h1 className="text-3xl font-bold mb-8 text-red-600">Upload Center</h1>

      {/* MOVIE UPLOAD */}
      <div className="bg-gray-900 p-6 rounded-lg mb-8">
        <h2 className="text-xl mb-4">Upload Movie/Video</h2>
        <form onSubmit={uploadMovie}>
          <input type="text" placeholder="Movie Title" value={movieTitle} onChange={(e)=>setMovieTitle(e.target.value)} className="block mb-4 p-2 w-full text-black" />
          <input type="text" placeholder="Description" value={movieDesc} onChange={(e)=>setMovieDesc(e.target.value)} className="block mb-4 p-2 w-full text-black" />
          <input type="file" accept="video/*" onChange={(e)=>setMovieFile(e.target.files[0])} className="mb-4 text-white" />
          <button type="submit" className="bg-red-600 px-6 py-2 rounded font-bold">{loading? "Uploading..." : "Upload Movie"}</button>
        </form>
      </div>

      {/* MUSIC UPLOAD */}
      <div className="bg-gray-900 p-6 rounded-lg">
        <h2 className="text-xl mb-4">Upload Music/Audio</h2>
        <form onSubmit={uploadMusic}>
          <input type="text" placeholder="Song Title" value={musicTitle} onChange={(e)=>setMusicTitle(e.target.value)} className="block mb-4 p-2 w-full text-black" />
          <input type="text" placeholder="Artist Name" value={musicArtist} onChange={(e)=>setMusicArtist(e.target.value)} className="block mb-4 p-2 w-full text-black" />
          <input type="file" accept="audio/*" onChange={(e)=>setMusicFile(e.target.files[0])} className="mb-4 text-white" />
          <button type="submit" className="bg-red-600 px-6 py-2 rounded font-bold">{loading? "Uploading..." : "Upload Music"}</button>
        </form>
      </div>
    </div>
  )
}

export default Upload;
