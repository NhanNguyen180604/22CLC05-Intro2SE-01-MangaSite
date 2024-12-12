import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import MangaPage from "./pages/MangaPage";
import MangaEditPage from "./pages/MangaEditPage";
import ChapterListEditPage from "./pages/ChapterListEditPage";
import AddChapterPage from "./pages/AddChapterPage";
import ChapterPage from "./pages/ChapterPage";
import SearchPage from "./pages/SearchPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import useToken from "./service/useToken.js";

function App() {
  const { token, setToken } = useToken();

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/mangas/:id">
          <Route index element={<MangaPage />} />
          <Route path="chapters/:chapterNumber" element={<ChapterPage />} />
          <Route path="edit" element={<MangaEditPage />} />
          <Route path="chapters/edit" element={<ChapterListEditPage />} />
          <Route path="chapters/new" element={<AddChapterPage />} />
        </Route>
        <Route path="/search" element={<SearchPage />} />
        <Route path="/login" element={<LoginPage setToken={setToken} />} />
        <Route path='/register' element={<RegisterPage />} />
      </Routes>
    </>
  );
}

export default App;
