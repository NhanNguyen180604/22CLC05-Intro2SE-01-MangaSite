import { useEffect, useState } from "react";
import MangaSlide from "../../components/MangaSlide";
import { getMangas } from "../../service/mangaService";
import DesktopLogo from "../../components/main/DesktopLogo.jsx";
import DesktopNavigationBar from "../../components/main/DesktopNavigationBar.jsx";
import SearchBox from "../../components/search/SearchBox.jsx"
import MainLayout from "../../components/main/MainLayout.jsx";
import MobileNavigationBar from "../../components/main/MobileNavigationBar.jsx";
import styles from "./HomePage.module.css";
import { getUserNotifications } from "../../service/userService.js";

// temporary page, whoever does the homepage fix this
const HomePage = () => {
  const [mangas, setMangas] = useState([]);
  const [noti, setNoti] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const response = await getMangas(1, 10);
      if (response.status === 200) {
        setMangas(response.mangas.mangas);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const response = await getUserNotifications();
      console.log(response)
      setNoti(response)
    };

    fetchData();
  }, []);

  return (
    <>
      <MainLayout>
        <header className="flex w-full flex-row items-center justify-between">
          <DesktopLogo />
          <div className="flex w-full flex-row items-center gap-8 lg:w-fit">
              <SearchBox />
              <DesktopNavigationBar />
          </div>
        </header>

        <div className={styles.container}>
          <div className={styles.content}>
            <MangaSlide title="New mangas" mangas={mangas} />
            {/* <MangaSlide title="Top rated" mangas={mangas} /> */}
          </div>

          <div className={styles.notification}>
            <h4 className={styles.notificationHeader}>Notifications</h4>

            {noti ? (
              noti.map((noti) => {
                const createdAt = new Date(noti.createdAt);
                const date = createdAt.toLocaleDateString();
                const time = createdAt.toLocaleTimeString();
                return (
                  <div className={styles.notiBox} key={noti._id}>
                    <p className={styles.notiMessage}>{noti.message}</p>
                    <span className={styles.notiTime}>{`${date} ${time}`}</span>
                  </div>
                );
              })
            ) : (
              <p>Please login to see your notifications</p>
            )}
          </div>
        </div>

        <footer>
          <MobileNavigationBar />
        </footer>
      </MainLayout>
    </>
  );
};
export default HomePage;
