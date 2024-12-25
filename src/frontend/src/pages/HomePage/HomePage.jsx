import { useEffect, useState } from "react";
import MangaSlide from "../../components/MangaSlide";
import { getMangas } from "../../service/mangaService";
import DesktopLogo from "../../components/main/DesktopLogo.jsx";
import DesktopNavigationBar from "../../components/main/DesktopNavigationBar.jsx";
import SearchBox from "../../components/search/SearchBox.jsx";
import MainLayout from "../../components/main/MainLayout.jsx";
import MobileNavigationBar from "../../components/main/MobileNavigationBar.jsx";
import styles from "./HomePage.module.css";
import {
  getUserNotifications,
  readUserNoti,
} from "../../service/userService.js";

// temporary page, whoever does the homepage fix this
const HomePage = () => {
  const [ratingMangas, setRaingMangas] = useState([]);
  const [updatedMangas, setUpdatedMangas] = useState([]);
  const [noti, setNoti] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await getMangas(1, 15, 'top-rating');
      if (response.status === 200) {
        setRaingMangas(response.mangas.mangas);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const response = await getMangas(1, 15, 'recently-updated');
      if (response.status === 200) {
        setUpdatedMangas(response.mangas.mangas);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const response = await getUserNotifications();
      setNoti(response)
    };

    fetchData();
  }, []);

  const readNoti = async (id) => {
    await readUserNoti(id);
    setNoti(
      noti.map((noti) => (noti._id === id ? { ...noti, read: true } : noti)),
    );
  };

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
            <MangaSlide title="Recently updated" mangas={updatedMangas} />
            <MangaSlide title="Top rated" mangas={ratingMangas} />
          </div>

          <div className={styles.notification}>
            <h4 className={styles.notificationHeader}>Notifications</h4>

            {noti ? (
              noti.length ? (
                noti.map((noti) => {
                  const createdAt = new Date(noti.createdAt);
                  const date = createdAt.toLocaleDateString();
                  const time = createdAt.toLocaleTimeString();
                  return (
                    <div
                      className={`${styles.notiBox} ${noti.read ? styles.read : ""}`}
                      key={noti._id}
                      onClick={() => !noti.read && readNoti(noti._id)}
                    >
                      <p className={styles.notiMessage}>{noti.message}</p>
                      <span className={styles.notiTime}>{`${date} ${time}`}</span>
                      {!noti.read && (
                        <div className={styles.notiUnreadMark}></div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p>You have no notifications</p>
              )
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
