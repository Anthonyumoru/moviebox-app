import { useEffect, useState } from 'react'

function App() {
  const [movies, setMovies] = useState([])

  useEffect(() => {
    fetch('https://moviebox-app-production-dd12.up.railway.app/api/movies')
     .then(res => res.json())
     .then(data => setMovies(data))
  }, [])

  const featured = movies[0]

  return (
    <div style={{ background: '#141414', color: 'white', minHeight: '100vh' }}>

      {/* Header */}
      <header style={{ padding: '15px 4%', background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 10%, transparent)', position: 'fixed', width: '92%', zIndex: 10 }}>
        <h1 style={{ margin: 0, color: '#E50914', fontSize: '28px' }}>MOVIEBOX</h1>
      </header>

      {/* Hero Banner - Netflix style */}
      {featured && (
        <div style={{
          height: '80vh',
          background: `linear-gradient(to right, #000 30%, transparent), url(${featured.poster})`,
          backgroundSize: 'cover',
          padding: '20% 4% 0',
        }}>
          <h1 style={{ fontSize: '48px', margin: 0 }}>{featured.title}</h1>
          <p style={{ width: '40%' }}>The biggest movie of the year. Watch now.</p>
          <button style={{ padding: '10px 25px', fontSize: '18px', background: 'white', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>▶ Play</button>
        </div>
      )}

      {/* Movie Rows - YouTube + Netflix style */}
      <div style={{ padding: '20px 4%' }}>
        <h2>Trending Now</h2>
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}>
          {movies.map(movie => (
            <div key={movie.id} style={{ minWidth: '250px', cursor: 'pointer' }}>
              <img src={movie.poster} style={{ width: '100%', borderRadius: '4px' }} />
              <p style={{ fontSize: '14px' }}>⭐ 8.5 • {movie.year}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
