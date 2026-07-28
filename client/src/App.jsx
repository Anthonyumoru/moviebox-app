import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Home from "./pages/Home";
import Upload from "./pages/Upload";

function App() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/movies`)
      .then((res) => res.json())
      .then((data) => setMovies(data))
      .catch((err) => console.log("Error:", err));
  }, []);

  return (
    <BrowserRouter>
      <nav className="bg-black text-white p-4 flex gap-4">
        <Link to="/">Home</Link>
        <Link to="/upload">Upload</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home movies={movies} />} />
        <Route path="/upload" element={<Upload />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
