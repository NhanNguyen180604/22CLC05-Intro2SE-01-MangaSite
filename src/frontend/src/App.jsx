import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import MangaPage from "./pages/MangaPage";
import SearchPage from "./pages/SearchPage.jsx";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/mangas/:id">
          <Route index element={<MangaPage />} />
        </Route>
        <Route path="/search" element={<SearchPage />} />
      </Routes>
    </>
  );
}

export default App;
