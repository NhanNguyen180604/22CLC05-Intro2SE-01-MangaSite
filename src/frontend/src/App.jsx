import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import MangaPage from "./pages/MangaPage";
import MangaEditPage from "./pages/MangaEditPage";
import ChapterPage from "./pages/ChapterPage";
import SearchPage from "./pages/SearchPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import useToken from "./service/useToken.js";
import MyProfilePage from "./pages/MyProfilePage.jsx";

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
        </Route>
        <Route path="/user">
          <Route path="login" element={<LoginPage setToken={setToken} />} />
          <Route path='register' element={<RegisterPage />} />
          <Route path="me" element={<MyProfilePage/>} />
        </Route>
        <Route path="/search" element={<SearchPage />} />
      </Routes>
    </>
  );
}

export default App;
