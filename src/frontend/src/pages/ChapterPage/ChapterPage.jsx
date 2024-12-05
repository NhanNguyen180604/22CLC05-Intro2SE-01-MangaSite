import styles from './ChapterPage.module.css';
import { useParams, useNavigate } from 'react-router-dom';
import { getChapter, getChapterList } from '../../service/mangaService.js';
import { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { FaMessage } from 'react-icons/fa6';
import CommentForm from '../../components/CommentForm';
import NotificationForm from '../../components/NotificationForm';

const ChapterPage = () => {
    const [showHeader, setShowHeader] = useState(true);
    const [showFooter, setShowFooter] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    const handleScroll = () => {
        const currentScrollY = window.scrollY;
        const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;

        if (currentScrollY >= maxScrollY - 70) {
            setShowFooter(true);
        }
        else {
            if (currentScrollY > lastScrollY) {
                setShowHeader(false);
                setShowFooter(false);
            }
            else {
                setShowHeader(true);
                setShowFooter(true);
            }
        }

        setLastScrollY(currentScrollY);
    };

    const handleClick = () => {
        setShowHeader(prev => {
            if (showHeader !== showFooter)
                return showHeader || showFooter;
            return !prev;
        });
        setShowFooter(prev => {
            if (showHeader !== showFooter)
                return showHeader || showFooter;
            return !prev;
        });
    };

    useEffect(() => {
        // Add listener
        window.addEventListener('scroll', handleScroll);
        document.addEventListener('click', handleClick); 
        return () => {
            // Clean up listener when unmount
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('click', handleClick); 
        };
    }, [lastScrollY]);


    const { id, chapterNumber } = useParams();
    const [chapter, setChapter] = useState({
        _id: null,
        manga: null,
        number: 0,
        images: [],
        title: '',
    });

    const [nextChapterNum, setNextChapterNum] = useState(-1);
    const [prevChapterNum, setPrevChapterNum] = useState(-1);

    useEffect(() => {
        setShowHeader(true);
        setShowFooter(true);

        const fetchData = async () => {
            const response = await getChapter(id, chapterNumber);
            if (response.status === 200) {
                setChapter(response.chapter);

                // reset
                setShowHeader(true);
                setShowFooter(true);
                setNextChapterNum(-1);
                setPrevChapterNum(-1);
                const chapterListResponse = await getChapterList(id, 1, 20, true);
                if (chapterListResponse.status === 200) {
                    const chapters = chapterListResponse.chaptersInfo.chapters;
                    const index = chapters.findIndex(obj => obj.number === response.chapter.number);
                    if (index < chapters.length - 1) {
                        setNextChapterNum(chapters[index + 1].number);
                    }
                    if (index > 0) {
                        setPrevChapterNum(chapters[index - 1].number);
                    }
                }
                else {
                    console.log("Couldn't fetch chapterList, status code: " + chapterListResponse.status);
                    console.err(chapterListResponse.message);
                }
            }
            else {
                console.log('Server is dead, and we dont know why');
            }
        };

        fetchData();

        window.scrollTo({
            top: 0,
        });
    }, [id, chapterNumber]);


    const navigate = useNavigate();


    const [showNotiForm, setShowNotiForm] = useState(false);
    const [notiFormDetails, setNotiFormDetails] = useState({
        success: false,
        message: '',
        details: '',
    });
    const [showCommentForm, setShowCommentForm] = useState(false);

    const togglePopup = (setCallback, attribute) => {
        setCallback(!attribute);
        if (!attribute)
            document.body.classList.add(`noScrollY`);
        else document.body.classList.remove(`noScrollY`);
    }

    const handlePopupClick = (id, setCallback, attribute) => {
        if (id === 'popupContainer') {
            togglePopup(setCallback, attribute);
        }
    }

    return (
        <>
            <div className={`${styles.topBar} ${!showHeader ? styles.hiddenTop : ''}`}>
                <button
                    onClick={() => navigate(`/mangas/${id}`)}
                    className={styles.returnBTN}
                >
                    <FaChevronLeft />
                </button>
                <div className={styles.chapterTitle}>
                    <div>{chapter.manga?.name}</div>
                    <div>Chapter {chapter.number}: {chapter.title}</div>
                </div>
            </div>

            <div className={styles.budgetLayout}>
                <div className={styles.imgContainer}>
                    {chapter.images.length && chapter.images.map((image, index) => (
                        <img src={image} key={`chapter-${chapter._id}-image-${index + 1}`} loading="lazy" />
                    ))}
                </div>
            </div>


            <div className={`${styles.bottomBar} ${!showFooter ? styles.hiddenBottom : ''}`}>
                <button
                    className={styles.menuBTN}
                    disabled={prevChapterNum === -1 ? true : false}
                    onClick={() => navigate(`/mangas/${id}/chapters/${prevChapterNum}`)}
                >
                    <div><FaChevronLeft /></div>
                    <div>Previous</div>
                </button>
                <button
                    className={`${styles.menuBTN}`}
                    onClick={() => togglePopup(setShowCommentForm, showCommentForm)}
                >
                    <div><FaMessage /></div>
                    <div>Comments</div>
                </button>
                <button
                    className={styles.menuBTN}
                    disabled={nextChapterNum === -1 ? true : false}
                    onClick={() => navigate(`/mangas/${id}/chapters/${nextChapterNum}`)}
                >
                    <div>Next</div>
                    <div><FaChevronRight /></div>
                </button>
            </div>

            {showCommentForm && <div className={styles.popupContainer}
                onClick={(e) => handlePopupClick(e.target.id, setShowCommentForm, showCommentForm)}
                id="popupContainer">
                <CommentForm
                    setShowThis={setShowCommentForm}
                    setNotiFormDetails={setNotiFormDetails}
                    setShowNotiForm={setShowNotiForm}
                />
            </div>}

            {showNotiForm && <div className={styles.popupContainer}
                onClick={(e) => handlePopupClick(e.target.id, setShowNotiForm, showNotiForm)}
                id="popupContainer">
                <NotificationForm
                    message={notiFormDetails.message}
                    details={notiFormDetails.details}
                    success={notiFormDetails.success}
                />
            </div>}
        </>
    )
}
export default ChapterPage