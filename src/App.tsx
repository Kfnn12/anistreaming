import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Search from "./pages/Search";
import AnimeDetails from "./pages/AnimeDetails";
import Watch from "./pages/Watch";
import Latest from "./pages/Latest";
import Trending from "./pages/Trending";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="search" element={<Search />} />
          <Route path="latest" element={<Latest />} />
          <Route path="trending" element={<Trending />} />
          <Route path="anime/:id" element={<AnimeDetails />} />
          <Route path="watch/:id" element={<Watch />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
