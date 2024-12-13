import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/main/MainLayout.jsx';
import MangaPageLayoutComponents from "../../components/MangaPageLayout";
const { MangaPageLayout, LeftColumnContainer, RightColumnContainer } = MangaPageLayoutComponents;
import DesktopLogo from '../../components/main/DesktopLogo.jsx';
import DesktopNavigationBar from '../../components/main/DesktopNavigationBar.jsx';
import styles from './AddChapterPage.module.css';
import { getMangaByID, getChapterNumbers, uploadChapter } from '../../service/mangaService.js';
import { getMe } from '../../service/userService.js';
import NotiPopup from '../../components/NotiPopup';
import { FaPlus } from 'react-icons/fa';
import { FaCircleXmark } from 'react-icons/fa6';
import { closestCorners, DndContext } from '@dnd-kit/core';
import { arrayMove, rectSortingStrategy, SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const AddChapterPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Loading');
    const [showNoti, setShowNoti] = useState(false);
    const [notiDetails, setNotiDetails] = useState({
        success: false,
        message: '',
        details: '',
    });

    const [mangaCover, setMangaCover] = useState('');

    const chapterNumbersRef = useRef(null);
    const [chapter, setChapter] = useState({
        title: 'Your chapter title',
        number: 0,
    });

    const [showNumberMessage, setShowNumberMessage] = useState(false);
    const [numberMessage, setNumberMessage] = useState('');
    const [showTitleMessage, setShowTitleMessage] = useState(false);
    const [titleMessage, setTitleMessage] = useState('');

    const handleInput = (e, field) => {
        let { value } = e.target;

        if (field === 'number') {
            value = parseFloat(value);

            if (isNaN(value)) {
                setNumberMessage(`Invalid chapter number!`);
                setShowNumberMessage(true);
            }
            else if (chapterNumbersRef.current.find(element => element === value)) {
                setNumberMessage(`Chapter #${value} already exists!`);
                setShowNumberMessage(true);
            }
            else {
                { showNumberMessage && setShowNumberMessage(false) }
            }
        }
        else {
            if (value.length === 0) {
                setTitleMessage('Title cannot be empty!');
                setShowTitleMessage(true);
            }
            else {
                { showTitleMessage && setShowTitleMessage(false) }
            }
        }
        setChapter({
            ...chapter,
            [field]: value,
        });
    };

    // for images upload
    const [images, setImages] = useState([]);
    const imageIDRef = useRef(0);
    const handleUploadPages = (e) => {
        const newPages = Array.from(e.target.files);
        const newObjectURLs = newPages.map(page => URL.createObjectURL(page));
        const newImages = newPages.map((page, index) => {
            return {
                file: page,
                objectURL: newObjectURLs[index],
                id: `new-page-${imageIDRef.current++}`,
            };
        });

        setImages([
            ...images,
            ...newImages,
        ]);
    };
    const getImageIndex = (id) => {
        return images.findIndex(image => image.id === id);
    };
    const removeImage = (id) => {
        const foundImage = images[getImageIndex(id)];
        URL.revokeObjectURL(foundImage.objectURL);
        setImages(images.filter(image => image.id !== id));
    };
    const freeImage = () => {
        images.forEach(image => URL.revokeObjectURL(image.objectURL));
    }
    const handleDragEnd = (e) => {
        const { active, over } = e;

        if (active.id === over.id)
            return;

        setImages((prev) => {
            const originalIndex = getImageIndex(active.id);
            const newPosIndex = getImageIndex(over.id);
            return arrayMove(prev, originalIndex, newPosIndex);
        })
    };

    const initialize = async () => {
        setLoading(true);

        const mangaResponse = await getMangaByID(id);
        if (mangaResponse.status !== 200) {
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

        const me = await getMe();
        if (!me || (me && mangaResponse.status === 200 && mangaResponse.manga.uploader._id !== me._id)) {
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

        setMangaCover(mangaResponse.manga.cover);

        const chapterNumbersResponse = await getChapterNumbers(id);
        if (chapterNumbersResponse.status === 200) {
            const latestChapterNum = chapterNumbersResponse.numbers[chapterNumbersResponse.numbers.length - 1];
            chapterNumbersRef.current = chapterNumbersResponse.numbers;
            setChapter({
                ...chapter,
                number: latestChapterNum + 1,
            });
        }

        setLoading(false);
    };

    useEffect(() => {
        initialize();
    }, []);

    const reset = async (e) => {
        e.preventDefault();

        setChapter({
            title: 'Your chapter title',
            number: chapterNumbersRef.current[chapterNumbersRef.current.length - 1] + 1,
        });

        freeImage();
        setImages([]);
    };

    const submit = async (e) => {
        e.preventDefault();
        setLoadingMessage('Posting chapter');
        setLoading(true);

        const formData = new FormData();
        formData.append('title', chapter.title);
        formData.append('number', chapter.number);
        images.forEach(image => formData.append('images', image.file));

        const response = await uploadChapter(id, formData);
        if (response.status === 200) {
            navigate(`/mangas/${id}/chapters/${chapter.number}`);
        }
        else {
            setNotiDetails({
                success: false,
                message: 'Failed to upload chapter',
                details: response.message,
            });
            setShowNoti(true);
        }

        freeImage();
        setLoading(false);
    };

    const canPost = () => {
        return chapter.title.length
            && !chapterNumbersRef.current?.find(element => element === chapter.number)
            && !isNaN(chapter.number)
            && images.length;
    };

    return (
        <MainLayout>
            <header className="flex w-full flex-row items-center justify-between">
                <DesktopLogo />
                <div className="flex w-full flex-row items-center gap-8 lg:w-fit">
                    <DesktopNavigationBar />
                </div>
            </header>

            {loading ? <div className={styles.loadingContainer}>{loadingMessage}</div> : (
                <>
                    <div className={styles.returnBTNContainer}>
                        <button
                            onClick={() => navigate(`/mangas/${id}/chapters/edit`)}
                            className={styles.returnBTN}
                        >
                            Go Back to All Chapters
                        </button>
                    </div>

                    <MangaPageLayout tag='form'>
                        <LeftColumnContainer>
                            <img src={mangaCover} className={styles.coverImg} />

                            <ActionBTNs
                                submit={submit}
                                canPost={canPost}
                                reset={reset}
                            />
                        </LeftColumnContainer>
                        <RightColumnContainer>
                            <section className={`${styles.mySection}`}>
                                <label htmlFor='titleInput'>Chapter Title</label>
                                <input
                                    value={chapter.title}
                                    onChange={(e) => handleInput(e, 'title')}
                                    type='text'
                                    id="titleInput"
                                    required
                                />
                                {showTitleMessage && <div className={styles.warningMsg}>{titleMessage}</div>}
                            </section>

                            <section className={`${styles.mySection}`}>
                                <label htmlFor='numberInput'>Chapter Number</label>
                                <input
                                    value={chapter.number}
                                    onChange={(e) => handleInput(e, 'number')}
                                    type='number'
                                    step='any'
                                    min={0}
                                    id="numberInput"
                                    required
                                />
                                {showNumberMessage && <div className={styles.warningMsg}>{numberMessage}</div>}
                            </section>

                            <section className={`${styles.mySection} ${styles.pageSection}`}>
                                <h1>Pages</h1>
                                <div className={styles.pageListContainer}>
                                    <DndContext
                                        collisionDetection={closestCorners}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <SortableContext
                                            items={images}
                                            strategy={rectSortingStrategy}
                                        >
                                            {images.map(image => (
                                                <SortableItem
                                                    image={image}
                                                    key={image.id}
                                                    removeImage={removeImage}
                                                />
                                            ))}
                                        </SortableContext>
                                    </DndContext>

                                    <label
                                        className={styles.pagePlaceholder}
                                        htmlFor="pageInput"
                                    >
                                        <FaPlus />
                                    </label>
                                    <input
                                        className={styles.hidden}
                                        id="pageInput"
                                        type='file'
                                        accept='.png, .jpeg, .jpg, .webp'
                                        multiple
                                        onChange={handleUploadPages}
                                        onClick={(e) => { e.target.value = null; }}
                                    />
                                </div>

                            </section>

                            <ActionBTNs
                                submit={submit}
                                canPost={canPost}
                                reset={reset}
                                myClassName='mobileDisplay'
                            />
                        </RightColumnContainer>

                        <NotiPopup
                            open={showNoti}
                            onClose={() => setShowNoti(false)}
                            message={notiDetails.message}
                            details={notiDetails.details}
                            success={notiDetails.success}
                        />
                    </MangaPageLayout>
                </>
            )}
        </MainLayout>
    )
}
export default AddChapterPage;

const ActionBTNs = ({ reset, submit, myClassName = 'desktopDisplay', canPost }) => {
    return (
        <div className={`${styles.actionBTNs} ${styles[myClassName]}`}>
            <button
                className={styles.blueBTN}
                onClick={submit}
                disabled={!canPost()}
            >
                Post new chapter
            </button>

            <button className={styles.discardBTN} onClick={reset}>
                Reset
            </button>
        </div>
    );
};

const SortableItem = ({ image, removeImage }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: image.id });

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    };

    return (
        <div className={styles.pageContainer}>
            <div
                ref={setNodeRef}
                {...attributes}
                {...listeners}
                style={style}
                className={styles.noTouchAction}
            >
                <img src={image.objectURL} />

            </div>
            <button
                className={styles.removePageBTN}
                onClick={(e) => {
                    e.preventDefault();
                    removeImage(image.id);
                }}
            >
                <FaCircleXmark />
            </button>
        </div>
    );
};