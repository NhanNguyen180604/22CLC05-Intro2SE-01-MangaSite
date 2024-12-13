import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/main/MainLayout.jsx';
import MangaPageLayoutComponents from "../../components/MangaPageLayout";
const { MangaPageLayout, LeftColumnContainer, RightColumnContainer } = MangaPageLayoutComponents;
import DesktopLogo from '../../components/main/DesktopLogo.jsx';
import DesktopNavigationBar from '../../components/main/DesktopNavigationBar.jsx';
import styles from './EditChapterPage.module.css';
import { getMangaByID, getChapter, getChapterNumbers, updateChapter, deleteChapter } from '../../service/mangaService.js';
import { getMe } from '../../service/userService.js';
import NotiPopup from '../../components/NotiPopup';
import { FaPlus } from 'react-icons/fa';
import { FaCircleXmark } from 'react-icons/fa6';
import { closestCorners, DndContext, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, rectSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const EditChapterPage = () => {
    const { id, chapterNumber } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Loading');
    const [showNoti, setShowNoti] = useState(false);
    const [notiDetails, setNotiDetails] = useState({
        success: false,
        message: '',
        details: '',
    });

    const sensors = useSensors(
        useSensor(TouchSensor),
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    );

    const [mangaCover, setMangaCover] = useState('');

    const chapterNumbersRef = useRef(null);  // used to check for duplicate numbers
    const chapterRef = useRef(null);   // used to reset
    const [chapter, setChapter] = useState({  // we dont use chapter images in here
        title: 'Your chapter title',
        number: 0,
    });

    const [deletedImages, setDeletedImages] = useState([]);  // store publicID of images to be deleted
    // for images displaying and uploading
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

    // for warning
    const [showTitleMessage, setShowTitleMessage] = useState(false);
    const [titleMessage, setTitleMessage] = useState('');

    const handleInput = (e) => {
        let { value } = e.target;

        if (value.length === 0) {
            setTitleMessage('Title cannot be empty!');
            setShowTitleMessage(true);
        }
        else {
            { showTitleMessage && setShowTitleMessage(false) }
        }

        setChapter({
            ...chapter,
            title: value,
        });
    };

    const getImageIndex = (id) => {
        return images.findIndex(image => image.id === id);
    };
    const removeImage = (id) => {
        const foundImage = images[getImageIndex(id)];
        // only newly uploaded images have field objectURL
        if (foundImage.objectURL) {
            URL.revokeObjectURL(foundImage.objectURL);
        }
        // since this is not newly uploaded, it is an old image from our database
        // store the publicID to delete in the server
        else {
            setDeletedImages([
                ...deletedImages,
                foundImage.publicID,
            ]);
        }
        setImages(images.filter(image => image.id !== id));
    };
    const freeImage = () => {
        images.forEach(image => {
            if (image.objectURL)
                URL.revokeObjectURL(image.objectURL)
        });
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
        if (!me || (me.accountType !== 'admin' && (me && mangaResponse.status === 200 && mangaResponse.manga.uploader._id !== me._id))) {
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

        const chapterResponse = await getChapter(id, chapterNumber);
        if (chapterResponse.status === 404) {
            navigate('/notfound');
        }
        else if (chapterResponse.status !== 200) {
            setNotiDetails({
                success: false,
                message: 'Failed to fetch chapter, please try again',
                details: chapterResponse.message,
            });
            setShowNoti(true);
            setLoading(false);
            return;
        }

        const chapterNumbersResponse = await getChapterNumbers(id);
        if (chapterNumbersResponse.status !== 200) {
            setNotiDetails({
                success: false,
                message: 'Failed to fetch chapter numbers, please try again',
                details: chapterNumbersResponse.message,
            });
            setShowNoti(true);
            return;
        }

        chapterRef.current = chapterResponse.chapter;
        chapterRef.current.images = chapterRef.current.images.map(image => ({
            ...image,
            id: `image-page-${imageIDRef.current++}`,
        }));
        setChapter(chapterResponse.chapter);
        chapterNumbersRef.current = chapterNumbersResponse.numbers.filter(number => number !== chapterRef.current.number);
        setImages(chapterRef.current.images);

        setLoading(false);
    };

    useEffect(() => {
        initialize();
    }, []);

    const reset = async (e) => {
        e.preventDefault();

        setChapter(chapterRef.current);

        freeImage();
        setImages(chapterRef.current.images);
    };

    const removeChapter = async (e) => {
        e.preventDefault();
        setLoadingMessage('Deleting chapter');
        setLoading(true);

        const response = await deleteChapter(id, chapterNumber);
        if (response.status !== 200) {
            setNotiDetails({
                success: false,
                message: 'Failed to delete chapter',
                details: response.message,
            });
            setShowNoti(true);
            setLoading(false);
            return;
        }

        navigate(`/mangas/${id}/chapters/edit`);
    };

    const submit = async (e) => {
        e.preventDefault();
        setLoadingMessage('Updating chapter');
        setLoading(true);

        const formData = new FormData();
        if (chapterRef.current.title !== chapter.title)
            formData.append('title', chapter.title);
        if (chapterRef.current.number !== chapter.number)
            formData.append('number', chapter.number);

        const submittingImages = images.map((image, index) => ({
            ...image,
            index: index,
        }));

        submittingImages.forEach(image => {
            // if this is newly uploaded image
            if (image.objectURL) {
                formData.append('newImages', image.file);
                formData.append('newIndex', image.index);
            }
            // this is old image from our base
            else {
                formData.append('oldImages', JSON.stringify(image));
            }
        });

        deletedImages.forEach(image => formData.append('deleting', image));

        const response = await updateChapter(id, chapterNumber, formData);
        if (response.status !== 200) {
            setNotiDetails({
                success: false,
                message: 'Failed to update chapter',
                details: response.message,
            });
            setShowNoti(true);
            setLoading(false);
            return;
        }

        setLoading(false);
        navigate(`/mangas/${id}/chapters/edit`);
    };

    const canSubmit = () => {
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
                                canSubmit={canSubmit}
                                reset={reset}
                                removeChapter={removeChapter}
                            />
                        </LeftColumnContainer>
                        <RightColumnContainer>
                            <section className={`${styles.mySection}`}>
                                <label htmlFor='titleInput'>Chapter Title</label>
                                <input
                                    value={chapter.title}
                                    onChange={handleInput}
                                    type='text'
                                    id="titleInput"
                                    required
                                />
                                {showTitleMessage && <div className={styles.warningMsg}>{titleMessage}</div>}
                            </section>

                            <section className={`${styles.mySection}`}>
                                <label>Chapter Number</label>
                                <input
                                    value={chapter.number}
                                    readOnly
                                    required
                                />
                            </section>

                            <section className={`${styles.mySection} ${styles.pageSection}`}>
                                <h1>Pages</h1>
                                <div className={styles.pageListContainer}>
                                    <DndContext
                                        collisionDetection={closestCorners}
                                        onDragEnd={handleDragEnd}
                                        sensors={sensors}
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
                                canSubmit={canSubmit}
                                reset={reset}
                                removeChapter={removeChapter}
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
export default EditChapterPage;

const ActionBTNs = ({ reset, submit, removeChapter, myClassName = 'desktopDisplay', canSubmit }) => {
    return (
        <div className={`${styles.actionBTNs} ${styles[myClassName]}`}>
            <button
                className={styles.blueBTN}
                onClick={submit}
                disabled={!canSubmit()}
            >
                Update Chapter
            </button>

            <button className={styles.discardBTN} onClick={reset}>
                Reset
            </button>

            <button className={styles.deleteBTN} onClick={removeChapter}>
                Delete this Chapter
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
                <img src={image.url ? image.url : image.objectURL} />

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