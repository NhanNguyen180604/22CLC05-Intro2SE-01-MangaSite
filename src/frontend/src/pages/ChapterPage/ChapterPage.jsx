import styles from './ChapterPage.module.css';
import { useParams, useNavigate } from 'react-router-dom';
import { getChapter, getChapterList } from '../../service/mangaService.js';
import { getMe } from '../../service/userService.js';
import { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { FaCommentSlash } from "react-icons/fa";
import CommentPopup from '../../components/CommentPopup';

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

    const [me, setMe] = useState({
        loggedIn: false,
    });
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

    const initialize = async () => {
        await fetchData();
        setShowHeader(true);
        setShowFooter(true);
        window.scrollTo({
            top: 0,
        });
    };

    const fetchMe = async () => {
        const data = await getMe();
        if (data) {
            setMe(data);
        }
    };

    useEffect(() => {
        initialize();
    }, [id, chapterNumber]);

    useEffect(() => {
        fetchMe();
    }, []);

    const navigate = useNavigate();

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
                <div className={styles.commentBTN}>
                    {chapter.manga?.canComment ? (
                        <span><CommentPopup loggedIn={me.loggedIn} /></span>
                    ) : (
                        <span className={styles.disabledBTN}><FaCommentSlash /></span>
                    )}
                </div>
                <button
                    className={styles.menuBTN}
                    disabled={nextChapterNum === -1 ? true : false}
                    onClick={() => navigate(`/mangas/${id}/chapters/${nextChapterNum}`)}
                >
                    <div>Next</div>
                    <div><FaChevronRight /></div>
                </button>
            </div>
        </>
    )
}
export default ChapterPage