import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Upload from "./pages/Upload";

function App() {
  return (
    <BrowserRouter>
      <nav className="bg-black text-white p-4 flex gap-4">
        <Link to="/">Home</Link>
        <Link to="/upload">Upload</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
