import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { Board } from "./pages/Board";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/retro/:retroId" element={<Board />} />
      </Routes>
    </BrowserRouter>
  );
}
