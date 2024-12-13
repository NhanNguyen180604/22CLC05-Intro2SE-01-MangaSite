import { useEffect, useState } from "react";
import MangaSlide from "../../components/MangaSlide";
import { getMangas } from "../../service/mangaService";
import DesktopLogo from "../../components/main/DesktopLogo.jsx";
import DesktopNavigationBar from "../../components/main/DesktopNavigationBar.jsx";
import MainLayout from "../../components/main/MainLayout.jsx";
import MobileNavigationBar from "../../components/main/MobileNavigationBar.jsx";

// temporary page, whoever does the homepage fix this
const HomePage = () => {
  const [mangas, setMangas] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const response = await getMangas(1, 20);
      if (response.status === 200) {
        setMangas(response.mangas.mangas);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <MainLayout>
        <header className="flex w-full flex-row items-center justify-between">
          <DesktopLogo />
          <DesktopNavigationBar />
        </header>

        <MangaSlide title="Trending" mangas={mangas} />
        <MangaSlide title="Top rated" mangas={mangas} />

        <footer>
          <MobileNavigationBar />
        </footer>
      </MainLayout>
    </>
  );
};
export default HomePage;
