import { Route, Routes } from "react-router-dom";
import ChapterPage from "./pages/ChapterPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage.jsx";
import MangaPage from "./pages/MangaPage";
import RegisterPage from "./pages/RegisterPage.jsx";
import ReportManagementPage from "./pages/ReportMgrPage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import Page401 from "./pages/status/401.jsx";
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
        </Route>
        <Route path="/search" element={<SearchPage />} />
        <Route path="/login" element={<LoginPage setToken={setToken} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reports" element={<ReportManagementPage />} />

        <Route path="/401" element={<Page401 />} />
      </Routes>
    </>
  );
}

export default App;
