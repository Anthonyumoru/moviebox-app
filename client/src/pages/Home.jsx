export default function Home({ movies }) {
  return (
    <div>
      
      {/* 1. NETFLIX STYLE VIDEO ROW - ADD THIS */}
      <div className="mb-8 px-4">
        <h2 className="text-white text-2xl font-bold mb-4">Student Tools Demo</h2>
        <div className="w-[300px] rounded-lg overflow-hidden transition-transform duration-300 hover:scale-110 cursor-pointer bg-gray-900">
          <video 
            muted 
            loop 
            playsInline
            poster="https://res.cloudinary.com/dqje0mde5/video/upload/so_1,w_400,h_225,c_fill/student-tools-demo.mp4_qc3t7r.jpg"
            onMouseOver={(e) => e.target.play()} 
            onMouseOut={(e) => {e.target.pause(); e.target.currentTime=0}}
            className="w-full"
          >
            <source src="https://res.cloudinary.com/dqje0mde5/video/upload/v1785317685/student-tools-demo.mp4_qc3t7r.mp4" type="video/mp4" />
          </video>
          <p className="text-gray-400 text-sm p-2">See how Student Tools works</p>
        </div>
      </div>

      {/* 2. YOUR EXISTING MOVIES GRID */}
      <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {movies.length === 0? (
          <p className="text-white">Loading movies...</p>
        ) : (
          movies.map((movie) => (
            <div key={movie._id} className="bg-gray-800 p-3 rounded">
              <h2 className="text-white font-bold">{movie.title}</h2>
              <p className="text-gray-400 text-sm">{movie.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
