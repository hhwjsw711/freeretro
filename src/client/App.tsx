import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { Board } from "./pages/Board";
import { About } from "./pages/About";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/retro/:retroId" element={<Board />} />
      </Routes>
    </BrowserRouter>
  );
}
