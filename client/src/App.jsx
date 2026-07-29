import { useEffect, useState } from 'react'
import axios from 'axios'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Upload from './pages/Upload'
import UploadMovie from './admin-uploads/UploadMovie'

function App() {
  const [movies, setMovies] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/movies`)
    .then(res => setMovies(res.data))
    .catch(err => console.log(err))
  }, [])

  const filtered = movies.filter(m => 
    m.title.toLowerCase().includes(search.toLowerCase())
  )

  const featured = movies[0]

  return (
    <Router>
      <div style={{backgroundColor: '#141414', minHeight: '100vh', color: 'white', fontFamily: 'Arial'}}>
        <div style={{padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h1 style={{fontSize: '1.8rem', fontWeight: 'bold', color: '#E50914'}}>MOVIEBOX</h1>
          <div style={{display: 'flex', gap: '20px', alignItems: 'center'}}>
            <input 
              placeholder="Search movies..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              style={{padding: '8px 15px', borderRadius: '5px', border: 'none', backgroundColor: '#333', color: 'white'}}
            />
            <Link to="/admin/upload" style={{backgroundColor: 'red', padding: '8px 15px', borderRadius: '5px', textDecoration: 'none', color: 'white'}}>
              + Upload
            </Link>
          </div>
        </div>

        <Routes>
          <Route path="/" element={
            <>
              {/* HERO BANNER */}
              {featured && (
                <div style={{
                  height: '500px', 
                  backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.9), transparent 70%), url(${featured.poster})`,
                  backgroundSize: 'cover',
                  padding: '40px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <h2 style={{fontSize: '3rem', fontWeight: 'bold'}}>{featured.title}</h2>
                  <p style={{fontWeight: '500', maxWidth: '500px'}}>{featured.description}</p>
                  <button 
                    onClick={() => window.open(featured.videoUrl, '_blank')} 
                    style={{marginTop: '20px', padding: '10px 20px', backgroundColor: 'white', color: 'black', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', width: '120px'}}
                  >
                    Watch Now
                  </button>
                </div>
              )}

              {/* MOVIE GRID */}
              <div style={{padding: '30px 40px'}}>
                <h3 style={{fontSize: '1.5rem'}}>Trending Now</h3>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px'}}>
                  {filtered.map(movie => (
                    <div key={movie._id} onClick={() => window.open(movie.videoUrl, '_blank')} style={{cursor: 'pointer'}}>
                      <img src={movie.poster} style={{width: '100%', borderRadius: '8px'}} />
                      <p>{movie.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          } />
          
          <Route path="/upload" element={<Upload />} />
          <Route path="/admin/upload" element={<UploadMovie />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
