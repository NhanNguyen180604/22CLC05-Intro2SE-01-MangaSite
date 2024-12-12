import styles from './ChapterListEditPage.module.css';
import MainLayout from '../../components/main/MainLayout.jsx';
import DesktopLogo from '../../components/main/DesktopLogo.jsx';
import DesktopNavigationBar from '../../components/main/DesktopNavigationBar.jsx';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getChapterList } from '../../service/mangaService.js';
import { getMangaByID } from '../../service/mangaService.js';
import { getMe } from '../../service/userService.js';
import { FaPlus } from 'react-icons/fa6';
import NotiPopup from '../../components/NotiPopup';

const ChapterListEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showNoti, setShowNoti] = useState(false);
    const [notiDetails, setNotiDetails] = useState({
        success: false,
        message: '',
        details: '',
    });

    const [chapters, setChapters] = useState([]);

    const initialize = async () => {
        setLoading(true);

        const mangaResponse = await getMangaByID(id);

        if (mangaResponse.status === 200) {
            const me = await getMe();
            if (!me || (me.accountType !== 'admin' && (me && mangaResponse.manga.uploader._id !== me._id))) {
                setNotiDetails({
                    success: false,
                    message: 'You are not authorized',
                    details: 'Only the uploader or admin can edit this, returning to home in 5 seconds',
                });
                setShowNoti(true);
                setLoading(false);
                setTimeout(() => navigate('/'), 5000);
                return;
            }
        }
        else {
            // display error
            setNotiDetails({
                success: false,
                message: 'Failed to fetch manga, please try again',
                details: mangaResponse.message,
            });
            setShowNoti(true);
            setLoading(false);
            return;
        }

        const response = await getChapterList(id, 1, 20, true);
        if (response.status === 200) {
            setChapters(response.chaptersInfo.chapters);
        }
        else {
            console.log("Couldn't fetch chapters");
        }

        setLoading(false);
    };

    useEffect(() => {
        initialize();
    }, []);

    return (
        <MainLayout>
            <header className="flex w-full flex-row items-center justify-between">
                <DesktopLogo />
                <div className="flex w-full flex-row items-center gap-8 lg:w-fit">
                    <DesktopNavigationBar />
                </div>
            </header>

            {loading ? <div className={styles.loadingContainer}>Loading</div> : (
                <div className={styles.chapterListEditContainer}>
                    <div className={styles.actionBTNs}>
                        <button
                            onClick={() => navigate(`/mangas/${id}/edit`)}
                            className={styles.returnBTN}
                        >
                            Go Back to Manga Edit
                        </button>
                    </div>

                    <div className={styles.header}>
                        <div className={styles.title}>Pick a chapter to Edit</div>

                    </div>

                    <div className={styles.chapterBTNsContainer}>
                        {chapters.map(chapter => (
                            <div
                                onClick={() => navigate(`/mangas/${id}/${chapter.number}/edit`)}
                                key={chapter._id}
                                className={styles.chapterBTN}
                            >
                                <div>
                                    <div className={styles.chapterNum}>Chapter #{chapter.number}</div>
                                    <div className={styles.chapterTitle}>{chapter.title}</div>
                                    <div className={styles.chapterPageCount}>{chapter.images.length} page{chapter.images.length ? 's' : ''}</div>
                                </div>
                            </div>
                        ))}

                        <div
                            className={styles.addNewBTN}
                            onClick={() => navigate(`/mangas/${id}/chapters/new`)}
                        >
                            <FaPlus />Add a new chapter
                        </div>
                    </div>

                    <NotiPopup
                        open={showNoti}
                        onClose={() => setShowNoti(false)}
                        message={notiDetails.message}
                        details={notiDetails.details}
                        success={notiDetails.success}
                    />
                </div>
            )}

        </MainLayout>
    )
}
export default ChapterListEditPage;