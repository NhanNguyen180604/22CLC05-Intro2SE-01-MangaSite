import styles from './PublishPage.module.css';
import DesktopLogo from "../../components/main/DesktopLogo.jsx";
import DesktopNavigationBar from "../../components/main/DesktopNavigationBar.jsx";
import MainLayout from "../../components/main/MainLayout.jsx";
import MobileNavigationBar from "../../components/main/MobileNavigationBar.jsx";
import { FaPlus } from 'react-icons/fa6';
import { checkClearance } from '../../stores/auth.js';
import { getMe } from '../../service/userService.js';
import { getMangaByUploader } from '../../service/mangaService.js';
import NotiPopup from '../../components/NotiPopup';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const PublishPage = () => {
    const navigate = useNavigate();
    const [me, setMe] = useState({
        loggedIn: false,
    });
    const [mangas, setMangas] = useState([]);
    const [page, setPage] = useState(1);
    const perPage = 2;
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    const [showNoti, setShowNoti] = useState(false);
    const [notiDetails, setNotiDetails] = useState({
        success: false,
        message: '',
        details: '',
    });

    const fetchData = async (local_page = 1, per_page = 20) => {
        const fetchManga = async (me) => {
            const mangaResponse = await getMangaByUploader(me._id, local_page, per_page);
            if (mangaResponse.status === 200) {
                setTotalPages(mangaResponse.mangas.total_pages);
                setMangas([...mangas, ...mangaResponse.mangas.mangas]);
            }
            else {
                setNotiDetails({
                    success: false,
                    message: 'Failed to fetch data',
                    details: mangaResponse.message,
                });
                setShowNoti(true);
            }
        }

        if (await checkClearance() !== 2) {
            navigate('/401');
        }

        if (me.loggedIn === false) {
            const meResponse = await getMe();
            if (meResponse) {
                setMe(meResponse);
                await fetchManga(meResponse);
            }
            else {
                setNotiDetails({
                    success: false,
                    message: 'Failed to fetch data',
                    details: '',
                });
                setShowNoti(true);
            }
        }
        else {
            await fetchManga(me);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchData(page, perPage);
    }, [page]);

    const loadMore = () => {
        if (page > totalPages)
            return;

        setPage(prev => prev + 1);
    };

    return (
        <MainLayout>
            <header className="flex w-full flex-row items-center justify-between">
                <DesktopLogo />
                <div className="flex w-full flex-row items-center gap-8 lg:w-fit">
                    <DesktopNavigationBar />
                </div>
            </header>

            {loading ? <div className={styles.loadingContainer}>Loading</div> : (
                <div className={styles.publishMainContainer}>
                    <h1 className={styles.title}>Let your ideas fly</h1>

                    <div className={styles.columnTitle}>Add a new chapter to your existing works?</div>
                    <div className={`${styles.columnTitle} ${styles.desktopDisplay}`}>Or create a new release?</div>

                    <div className={styles.leftColumnContainer}>
                        <div className={styles.mangaGrid}>
                            {mangas.map(manga => (
                                <div
                                    className={styles.mangaContainer}
                                    key={manga._id}
                                    onClick={() => navigate(`/mangas/${manga._id}/edit`)}
                                >
                                    <img src={manga.cover} className={styles.mangaCover} />
                                    <div className={styles.mangaName}>{manga.name}</div>
                                </div>
                            ))}
                        </div>

                        {page < totalPages && (
                            <div className={styles.loadMoreBTNContainer}>
                                <button onClick={loadMore}>Load more</button>
                            </div>
                        )}

                    </div>

                    <div className={`${styles.columnTitle} ${styles.mobileDisplay}`}>Or create a new release?</div>
                    <div className={styles.rightColumnContainer}>
                        <button
                            className={styles.placeHolder}
                            onClick={() => navigate(`/mangas/new`)}
                        >
                            <FaPlus />
                        </button>
                    </div>
                </div>
            )}

            <NotiPopup
                open={showNoti}
                onClose={() => setShowNoti(false)}
                success={notiDetails.success}
                message={notiDetails.message}
                details={notiDetails.details}
            />

            <footer>
                <MobileNavigationBar />
            </footer>
        </MainLayout>
    )
}
export default PublishPage;