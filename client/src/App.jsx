import { useEffect, useState } from 'react'
import axios from 'axios'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Upload from "./pages/Upload.jsx"
import UploadMovie from "./admin-uploads/uploadmovie.jsx"

function Home() {
  const [movies, setMovies] = useState([])

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/movies`)
     .then(res => setMovies(res.data))
     .catch(err => console.log(err))
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h1>MovieBox 🎬</h1>
      <Link to="/upload">Upload Movie</Link>
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 20 }}>
        {movies.map(movie => (
          <div key={movie._id} style={{ border: '1px solid #ccc', padding: 10, width: 200 }}>
            <h3>{movie.title}</h3>
            <video src={movie.videoUrl} controls width="200" />
          </div>
        ))}
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/admin-upload" element={<UploadMovie />} />
      </Routes>
    </Router>
  )
}

export default App
