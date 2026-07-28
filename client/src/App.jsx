import { useEffect, useState } from 'react'
import axios from 'axios'

function App() {
  const [movies, setMovies] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/movies`)
      .then(res => setMovies(res.data))
  }, [])

  const filtered = movies.filter(m => 
    m.title.toLowerCase().includes(search.toLowerCase())
  )

  const featured = movies[0]

  return (
    <div style={{backgroundColor: '#141414', minHeight: '100vh', color: 'white'}}>
      {/* NAVBAR */}
      <div style={{padding: '20px', display: 'flex', justifyContent: 'space-between'}}>
        <h1 style={{fontSize: '1.8rem', fontWeight: 'bold', color: '#e50914'}}>MOVIEBOX</h1>
        <input 
          placeholder="Search movies..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{padding: '8px', borderRadius: '5px', border: 'none', backgroundColor: '#333', color: 'white'}}
        />
      </div>

      {/* HERO BANNER */}
      {featured && (
        <div style={{
          height: '400px', 
          backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8), transparent), url(${featured.backdrop})`,
          backgroundSize: 'cover',
          padding: '40px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{fontSize: '3rem', fontWeight: 'bold'}}>{featured.title}</h2>
            <p style={{maxWidth: '500px', marginTop: '10px'}}>{featured.overview}</p>
            <button style={{marginTop: '20px', padding: '10px 30px', backgroundColor: 'white', color: 'black', border: 'none', borderRadius: '5px', fontWeight: 'bold'}}>▶ Play</button>
          </div>
        </div>
      )}

      {/* MOVIE GRID */}
      <div style={{padding: '20px'}}>
        <h3 style={{fontSize: '1.5rem', marginBottom: '15px'}}>Trending Now</h3>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px'}}>
          {filtered.map(movie => (
            <div key={movie.id} style={{cursor: 'pointer', transition: 'transform 0.2s'}}>
              <img src={movie.poster} alt={movie.title} style={{width: '100%', borderRadius: '5px'}} />
              <p style={{marginTop: '5px', fontWeight: 'bold'}}>{movie.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
