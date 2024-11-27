import { useEffect, useState } from "react";
import BlackLayer from "../../components/BlackLayer";
import MangaSlide from "../../components/MangaSlide";
import { getMangas } from "../../service/mangaService";

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
      <BlackLayer />
      <MangaSlide title="Trending" mangas={mangas} />
      <MangaSlide title="Top rated" mangas={mangas} />
    </>
  );
};
export default HomePage;
