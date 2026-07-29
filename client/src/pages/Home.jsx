import { useState } from "react";

export default function Home({ movies }) {
  const [playingId, setPlayingId] = useState(null);

  return (
    <div className="bg-[#141414] min-h-screen">
      
      {/* MOVIES GRID */}
      <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {movies.map((movie) => (
          <div 
            key={movie.id}
            className="rounded-lg overflow-hidden transition-transform duration-300 hover:scale-110 cursor-pointer bg-gray-900"
            onMouseEnter={() => movie.videoUrl && setPlayingId(movie.id)}
            onMouseLeave={() => setPlayingId(null)}
          >
            
            {/* IF MOVIE HAS VIDEO URL, SHOW VIDEO. ELSE SHOW POSTER */}
            {movie.videoUrl? (
              <video
                muted
                loop
                playsInline
                poster={movie.poster}
                className="w-full h-48 object-cover"
              >
                <source src={movie.videoUrl} type="video/mp4" />
              </video>
            ) : (
              <img 
                src={movie.poster} 
                alt={movie.title} 
                className="w-full h-48 object-cover"
              />
            )}

            <div className="p-2">
              <h3 className="text-white font-bold text-sm">{movie.title}</h3>
              <p className="text-gray-400 text-xs">{movie.year} • ⭐{movie.rating}</p>
            </div>

            {/* SCRIPT TO PLAY/PAUSE ON HOVER */}
            <script dangerouslySetInnerHTML={{
              __html: `
                const cards = document.querySelectorAll('.group');
              `
            }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Auto play/pause with useEffect
import { useEffect } from "react";
export default function Home({ movies }) {
  useEffect(() => {
    const handleHover = () => {
      document.querySelectorAll("video").forEach(video => {
        const parent = video.closest('.rounded-lg');
        parent.onmouseenter = () => video.play();
        parent.onmouseleave = () => { video.pause(); video.currentTime = 0; }
      });
    }
    handleHover();
  }, [movies]);

  return (
    <div className="bg-[#141414] min-h-screen">
      <div className="p-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {movies.map((movie) => (
          <div 
            key={movie.id}
            className="rounded-lg overflow-hidden transition-transform duration-300 hover:scale-110 cursor-pointer bg-gray-900 group"
          >
            {movie.videoUrl? (
              <video
                muted
                loop
                playsInline
                poster={movie.poster}
                className="w-full h-48 object-cover"
              >
                <source src={movie.videoUrl} type="video/mp4" />
              </video>
            ) : (
              <img 
                src={movie.poster} 
                alt={movie.title} 
                className="w-full h-48 object-cover"
              />
            )}

            <div className="p-2">
              <h3 className="text-white font-bold text-sm">{movie.title}</h3>
              <p className="text-gray-400 text-xs">{movie.year} • ⭐{movie.rating}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
