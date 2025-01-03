import { Route, Routes } from "react-router-dom";
import AddChapterPage from "./pages/AddChapterPage";
import AddMangaPage from "./pages/AddMangaPage";
import AdminPage from "./pages/AdminPage.jsx";
import ChapterListEditPage from "./pages/ChapterListEditPage";
import ChapterPage from "./pages/ChapterPage";
import EditChapterPage from "./pages/EditChapterPage";
import HomePage from "./pages/HomePage";
import LibraryPage from "./pages/LibraryPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import MangaEditPage from "./pages/MangaEditPage";
import MangaPage from "./pages/MangaPage";
import MyProfilePage from "./pages/MyProfilePage.jsx";
import PublishPage from "./pages/PublishPage";
import RegisterPage from "./pages/RegisterPage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import Page401 from "./pages/status/401.jsx";
import Page404 from "./pages/status/404.jsx";
import useToken from "./service/useToken.js";
import ProfilePage from "./pages/ProfilePage.jsx";

function App() {
  const { token, setToken } = useToken();

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/mangas/new" element={<AddMangaPage />} />
        <Route path="/mangas/:id">
          <Route index element={<MangaPage />} />
          <Route path="edit" element={<MangaEditPage />} />
          <Route path="chapters/:chapterNumber" element={<ChapterPage />} />
          <Route
            path="chapters/:chapterNumber/edit"
            element={<EditChapterPage />}
          />
          <Route path="chapters/edit" element={<ChapterListEditPage />} />
          <Route path="chapters/new" element={<AddChapterPage />} />
        </Route>
        <Route path="/publish" element={<PublishPage />} />
        <Route path="/user">
          <Route path="login" element={<LoginPage setToken={setToken} />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="me" element={<MyProfilePage />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path=":id" element={<ProfilePage/>} />
        </Route>
        <Route path="/search" element={<SearchPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/settings" element={<SettingsPage />} />

        <Route path="/401" element={<Page401 />} />
        <Route path="/*" element={<Page404 />} />
      </Routes>
    </>
  );
}

export default App;
