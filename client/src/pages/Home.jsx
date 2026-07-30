import { useState, useEffect } from 'react'

export default function Home() {
  const [videos, setVideos] = useState([])
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("ALL")
  const [playingId, setPlayingId] = useState(null)
  const API_URL = import.meta.env.VITE_API_URL // set this to your worker url

  // Fetch all videos from worker
  useEffect(() => {
    fetch(`${API_URL}/api/videos`)
     .then(res => res.json())
     .then(data => setVideos(data))
  }, [])

  // Auto play/pause on hover
  useEffect(() => {
    const cards = document.querySelectorAll('.group');
    cards.forEach(card => {
      const video = card.querySelector('video');
      if(video) {
        card.onmouseenter = () => { video.play(); setPlayingId(card.dataset.id) };
        card.onmouseleave = () => { video.pause(); video.currentTime = 0; setPlayingId(null) };
      }
    });
  }, [videos]);

  // Like button
  const handleLike = async (video) => {
    const updatedVideo = {...video, likes: (video.likes || 0) + 1}
    await fetch(`${API_URL}/api/videos`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(updatedVideo)
    })
    setVideos(videos.map(v => v.id === video.id? updatedVideo : v))
  }

  // Delete button
  const handleDelete = async (id) => {
    if(!confirm("Delete this video?")) return;
    await fetch(`${API_URL}/api/videos/${id}`, { method: 'DELETE' });
    setVideos(videos.filter(v => v.id!== id))
  }

  // Filter
  const filteredVideos = videos.filter(v => {
    const matchSearch = v.title.toLowerCase().includes(search.toLowerCase())
    const matchCategory = category === "ALL" || v.category === category
    return matchSearch && matchCategory
  })

  const categories = ["ALL", "CHURCH", "COMEDY", "MOVIE", "MUSIC"]

  return (
    <div className="bg-[#141414] min-h-screen text-white p-4">
      
      {/* Search + Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 sticky top-0 bg-[#141414] py-4 z-10">
        <input 
          type="text"
          placeholder="Search movies, sermons, comedy..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-gray-900 p-3 rounded w-full outline-none"
        />
        <select 
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-gray-900 p-3 rounded"
        >
          {categories.map(cat => <option key={cat}>{cat}</option>)}
        </select>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredVideos.map((movie) => (
          <div 
            key={movie.id} 
            data-id={movie.id}
            className="group rounded-lg overflow-hidden transition-transform duration-300 hover:scale-110 cursor-pointer bg-gray-900"
          >
            {movie.videoUrl? (
              <video
                muted
                loop
                playsInline
                poster={movie.posterUrl}
                className="w-full h-48 object-cover"
              >
                <source src={movie.videoUrl} type="video/mp4" />
              </video>
            ) : (
              <img src={movie.posterUrl} alt={movie.title} className="w-full h-48 object-cover" />
            )}

            <div className="p-2">
              <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{movie.category}</span>
              <h3 className="text-white font-bold text-sm mt-1">{movie.title}</h3>
              <p className="text-gray-400 text-xs">{movie.year} • ⭐ {movie.rating}</p>
              <p className="text-gray-400 text-xs truncate">{movie.description}</p>

              <div className="flex gap-2 mt-2">
                <button onClick={() => handleLike(movie)} className="bg-blue-600 px-2 py-1 text-xs rounded">
                  ❤️ {movie.likes || 0}
                </button>
                <button onClick={() => handleDelete(movie.id)} className="bg-red-600 px-2 py-1 text-xs rounded">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
