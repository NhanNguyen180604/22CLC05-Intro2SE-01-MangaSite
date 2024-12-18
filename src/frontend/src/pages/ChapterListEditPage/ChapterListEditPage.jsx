import styles from './ChapterListEditPage.module.css';
import MainLayout from '../../components/main/MainLayout.jsx';
import DesktopLogo from '../../components/main/DesktopLogo.jsx';
import DesktopNavigationBar from '../../components/main/DesktopNavigationBar.jsx';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getChapterList, deleteChapter } from '../../service/mangaService.js';
import { getMangaByID } from '../../service/mangaService.js';
import { getMe } from '../../service/userService.js';
import { FaPlus, FaXmark } from 'react-icons/fa6';
import NotiPopup from '../../components/NotiPopup';
import DeletePopup from '../../components/DeletePopup';

const ChapterListEditPage = () => {
    const [me, setMe] = useState({
        name: '',
        email: '',
        accountType: '',
    });
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [showNoti, setShowNoti] = useState(false);
    const [notiDetails, setNotiDetails] = useState({
        success: false,
        message: '',
        details: '',
    });

    const [chapters, setChapters] = useState([]);

    const [delPopupDetails, setDelPopupDetails] = useState({
        show: false,
        loading: false,
        onClose: () => { },
        message: '',
        callback: () => { },
    });

    const showDeletePopup = (chapterNumber) => {
        setDelPopupDetails({
            show: true,
            loading: false,
            onClose: () => {
                setDelPopupDetails({
                    ...delPopupDetails,
                    show: false,
                    loading: false,
                });
            },
            message: `You are about to delete chapter #${chapterNumber}.`,
            callback: () => removeChapter(chapterNumber),
        });
    };

    const removeChapter = async (chapterNumber) => {
        setDelPopupDetails({
            ...delPopupDetails,
            loading: true,
            show: true,
        });

        const response = await deleteChapter(id, chapterNumber);

        setDelPopupDetails({
            ...delPopupDetails,
            loading: false,
            show: false,
        });

        if (response.status !== 200) {
            setNotiDetails({
                success: false,
                message: 'Failed to delete chapter',
                details: response.message,
            });
            setShowNoti(true);
            return;
        }

        setChapters(chapters.filter(chapter => chapter.number !== chapterNumber));
    };

    const fetchChapterList = async () => {
        const response = await getChapterList(id, 1, 20, true);
        if (response.status === 200) {
            setChapters(response.chaptersInfo.chapters);
        }
        else {
            setNotiDetails({
                success: false,
                message: 'Failed to fetch chapter list',
                details: response.message,
            });
        }
    }

    const initialize = async () => {
        setLoading(true);

        const mangaResponse = await getMangaByID(id);

        if (mangaResponse.status === 200) {
            const meResponse = await getMe();
            if (!meResponse || (meResponse.accountType !== 'admin' && (meResponse && mangaResponse.manga.uploader._id !== meResponse._id))) {
                navigate('/401');
                return;
            }
            setMe(meResponse);
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

        await fetchChapterList();

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
                        {chapters.length ? (
                            <>
                                {chapters.map(chapter => (
                                    <div
                                        key={chapter._id}
                                        className={styles.chapterBTN}
                                    >
                                        <div
                                            className={styles.chapterBTNInner}
                                            onClick={() => navigate(`/mangas/${id}/chapters/${chapter.number}/edit`)}
                                        >
                                            <div>
                                                <div className={styles.chapterNum}>Chapter #{chapter.number}</div>
                                                <div className={styles.chapterTitle}>{chapter.title}</div>
                                                <div className={styles.chapterPageCount}>{chapter.images.length} page{chapter.images.length ? 's' : ''}</div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => showDeletePopup(chapter.number)}
                                            className={styles.deleteChapterBTN}
                                        >
                                            <FaXmark />
                                        </button>
                                    </div>
                                ))
                                }
                            </>
                        ) : (
                            <div>No chapter</div>
                        )}


                        {me.accountType !== 'admin' && (
                            <div
                                className={styles.addNewBTN}
                                onClick={() => navigate(`/mangas/${id}/chapters/new`)}
                            >
                                <FaPlus />Add a new chapter
                            </div>
                        )}
                    </div>

                    <NotiPopup
                        open={showNoti}
                        onClose={() => setShowNoti(false)}
                        message={notiDetails.message}
                        details={notiDetails.details}
                        success={notiDetails.success}
                    />

                    <DeletePopup
                        open={delPopupDetails.show}
                        onClose={delPopupDetails.onClose}
                        message={delPopupDetails.message}
                        callback={delPopupDetails.callback}
                        loading={delPopupDetails.loading}
                    />
                </div>
            )}

        </MainLayout>
    )
}
export default ChapterListEditPage;