import { useEffect, useState } from 'react'
import axios from 'axios'

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
    <div style={{backgroundColor: '#141414', minHeight: '100vh', color: 'white', fontFamily: 'Arial'}}>
      
      {/* NAVBAR */}
      <div style={{padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: '#141414', zIndex: 10}}>
        <h1 style={{fontSize: '1.8rem', fontWeight: 'bold', color: '#e50914', margin: 0}}>MOVIEBOX</h1>
        <input 
          placeholder="Search movies..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{padding: '8px 15px', borderRadius: '5px', border: 'none', backgroundColor: '#333', color: 'white', width: '250px'}}
        />
      </div>

      {/* HERO BANNER */}
      {featured && (
        <div style={{
          height: '500px', 
          backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.9), transparent 70%), url(${featured.backdrop})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '40px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{fontSize: '3rem', fontWeight: 'bold', margin: '0 0 10px 0'}}>{featured.title}</h2>
            <p style={{maxWidth: '500px', marginTop: '10px', fontSize: '1rem', lineHeight: '1.5'}}>{featured.overview}</p>
            <button 
              onClick={() => window.open(featured.videoUrl, '_blank')}
              style={{marginTop: '20px', padding: '12px 35px', backgroundColor: 'white', color: 'black', border: 'none', borderRadius: '5px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer'}}>
              ▶ Play
            </button>
          </div>
        </div>
      )}

      {/* MOVIE GRID */}
      <div style={{padding: '30px 40px'}}>
        <h3 style={{fontSize: '1.5rem', marginBottom: '20px'}}>Trending Now</h3>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px'}}>
          {filtered.map(movie => (
            <div 
              key={movie.id} 
              onClick={() => window.open(movie.videoUrl, '_blank')}
              style={{cursor: 'pointer', transition: 'transform 0.3s'}}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <img 
                src={movie.poster} 
                alt={movie.title} 
                onError={(e) => e.target.src='https://via.placeholder.com/200x300/333/fff?text=No+Image'}
                style={{width: '100%', borderRadius: '8px', aspectRatio: '2/3', objectFit: 'cover'}} 
              />
              <p style={{marginTop: '8px', fontWeight: 'bold', fontSize: '0.9rem'}}>{movie.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
