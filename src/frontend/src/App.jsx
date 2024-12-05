import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import MangaPage from "./pages/MangaPage";
import ChapterPage from "./pages/ChapterPage";
import SearchPage from "./pages/SearchPage.jsx";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/mangas/:id">
          <Route index element={<MangaPage />} />
          <Route path="chapters/:chapterNumber" element={<ChapterPage />} />
        </Route>
        <Route path="/search" element={<SearchPage />} />
      </Routes>
    </>
  );
}

export default App;
