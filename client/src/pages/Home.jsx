export default function Home({ movies }) {
  return (
    <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
      {movies.length === 0 ? (
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
  );
}
