import styles from "./MangaEditPage.module.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMangaByID, updateMangaInfo, getCovers, getDefaultCover, deleteCover } from "../../service/mangaService";
import { getMe } from "../../service/userService.js"
import { getAllAuthors } from "../../service/authorService.js";
import { getAllCategories } from "../../service/categoryService.js";
import DesktopLogo from "../../components/main/DesktopLogo.jsx";
import DesktopNavigationBar from "../../components/main/DesktopNavigationBar.jsx";
import MainLayout from "../../components/main/MainLayout.jsx";
import TabComponents from "../../components/Tab"
const { Tab, TabPanel } = TabComponents;
import { FaPlus } from "react-icons/fa6";
import CoverDeletePopup from "../../components/CoverDeletePopup";
import NotiPopup from "../../components/NotiPopup";
import CoverUploadPopup from "../../components/CoverUploadPopup";
import MySelect from "../../components/MySelect";

const MangaEditPage = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [showNoti, setShowNoti] = useState(false);
    const [notiDetails, setNotiDetails] = useState({
        success: false,
        message: '',
        details: '',
    });

    const mangaRef = useRef(null);
    const [updatedManga, setUpdatedManga] = useState({
        _id: '',
        title: '',
        authors: [],
        categories: [],
        canComment: false,
        cover: '',
        description: '',
        overallRating: 0,
        status: '',
        uploader: null,
    });
    const handleTextareaChange = (e, field) => {
        const { value } = e.target;
        setUpdatedManga({
            ...updatedManga,
            [field]: value,
        })
    };
    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setUpdatedManga({
            ...updatedManga,
            [name]: checked,
        })
    };
    const handleSelectChange = (values, field) => {
        setUpdatedManga({
            ...updatedManga,
            [field]: values.map(value => {
                return {
                    _id: value.value,
                    name: value.label,
                };
            })
        })
    };

    const [covers, setCovers] = useState([]);
    const defaultCoverRef = useRef(null);
    const [showCoverUploadPopup, setShowCoverUploadPopup] = useState(false);
    const [showCoverDelPopup, setShowCoverDelPopup] = useState(false);
    const [delCoverNum, setDelCoverNum] = useState(-1);
    const [popupLoading, setPopupLoading] = useState(false);

    useEffect(() => {
        if (delCoverNum !== -1) {
            setShowCoverDelPopup(true);
        }
        else setShowCoverDelPopup(false);
    }, [delCoverNum]);

    const deleteCoverImg = async (e) => {
        setPopupLoading(true);
        e.preventDefault();

        const response = await deleteCover(id, delCoverNum);
        if (response.status === 200) {
            const deletedCover = covers.find(cover => cover.number === delCoverNum);
            setCovers(covers.filter(cover => cover.number !== delCoverNum));
            if (deletedCover.imageURL === mangaRef.current.cover && defaultCoverRef?.current) {
                mangaRef.current.cover === defaultCoverRef.current;
                setUpdatedManga({
                    ...updatedManga,
                    cover: defaultCoverRef.current,
                });
            }

            setNotiDetails({
                success: true,
                message: 'Successfully deleted the cover image',
                details: '',
            });
        }
        else {
            setNotiDetails({
                success: false,
                message: 'Failed to delete the cover image',
                details: response.message,
            });
        }

        setDelCoverNum(-1);
        setPopupLoading(false);
        setShowNoti(true);
    };

    // reset all changes
    const reset = (e) => {
        e.preventDefault();
        setUpdatedManga(mangaRef.current);
    }

    const authorsRef = useRef([]);
    const categoriesRef = useRef([]);

    const navigate = useNavigate();

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

            mangaRef.current = mangaResponse.manga;
            setUpdatedManga(mangaResponse.manga);
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

        const coverResponse = await getCovers(id);
        if (coverResponse.status === 200) {
            setCovers(coverResponse.covers);
        }

        const defaultCoverResponse = await getDefaultCover();
        if (defaultCoverResponse.status === 200) {
            defaultCoverRef.current = defaultCoverResponse.cover;
        }

        const authorResponse = await getAllAuthors();
        if (authorResponse?.status === 200) {
            authorsRef.current = authorResponse.authors.map(author => {
                return {
                    value: author._id,
                    label: author.name,
                };
            });
        }

        const categoryResponse = await getAllCategories();
        if (categoryResponse?.status === 200) {
            categoriesRef.current = categoryResponse.categories.map(category => {
                return {
                    value: category._id,
                    label: category.name,
                };
            });
        }
        else {
            console.log("Could not get category list");
        }

        setLoading(false);
    };

    useEffect(() => {
        initialize();
    }, []);

    const submit = async (e) => {
        e.preventDefault();
        const response = await updateMangaInfo(id, updatedManga);
        if (response.status === 200) {
            navigate(`/mangas/${id}`);
        }
        else {
            // create popup here, I'm lazy af
            console.log(response);
        }
    };

    return (
        <MainLayout>
            <header className="flex w-full flex-row items-center justify-between">
                <DesktopLogo />
                <div className="flex w-full flex-row items-center gap-8 lg:w-fit">
                    <DesktopNavigationBar />
                </div>
            </header>

            {loading ? <div>Loading</div> :
                <form className={styles.mangaEditContainer}>
                    <div className={styles.leftColumnContainer}>
                        <img src={updatedManga.cover} className={styles.coverImg} />

                        <ActionBTNs reset={reset} submit={submit} />
                    </div>

                    <div className={styles.rightColumnContainer}>
                        <Tab>
                            <TabPanel title="General">
                                <section>
                                    <h1>Title</h1>
                                    <textarea value={updatedManga.name} onChange={(e) => handleTextareaChange(e, 'name')}></textarea>
                                </section>

                                <section>
                                    <h1>Authors</h1>
                                    <MySelect
                                        options={authorsRef.current}
                                        onChange={(values) => handleSelectChange(values, 'authors')}
                                        isLoading={loading}
                                        value={updatedManga.authors.map(author => {
                                            return {
                                                label: author.name,
                                                value: author._id,
                                            };
                                        })}
                                    />
                                </section>

                                <section>
                                    <h1>Synopsis</h1>
                                    <textarea value={updatedManga.description} onChange={(e) => handleTextareaChange(e, 'description')}></textarea>
                                </section>

                                <section>
                                    <h1>Tags</h1>
                                    <MySelect
                                        onChange={(values) => handleSelectChange(values, 'categories')}
                                        options={categoriesRef.current}
                                        value={updatedManga.categories.map(category => {
                                            return {
                                                label: category.name,
                                                value: category._id,
                                            };
                                        })}
                                        isLoading={loading}
                                    />
                                </section>

                                <label className={styles.formControl}>
                                    <input type='checkbox' name='canComment' checked={updatedManga.canComment} onChange={handleCheckboxChange} />
                                    Allow Comments
                                </label>
                            </TabPanel>

                            <TabPanel title="Art">
                                <div className={styles.coverListContainer}>
                                    {covers.map(cover => (
                                        <div key={cover._id} className={styles.coverContainer}>
                                            <img src={cover.imageURL} className={styles.smolCover} />
                                            <div className={styles.coverBTNs}>
                                                <div
                                                    onClick={() => setUpdatedManga({
                                                        ...updatedManga,
                                                        cover: cover.imageURL,
                                                    })}
                                                >
                                                    Set as thumbnail
                                                </div>
                                                <div
                                                    onClick={() => setDelCoverNum(cover.number)}
                                                >
                                                    Remove
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div
                                        className={styles.coverPlaceholder}
                                        onClick={() => setShowCoverUploadPopup(true)}
                                    >
                                        <FaPlus />
                                    </div>
                                </div>
                            </TabPanel>
                        </Tab>

                        <ActionBTNs reset={reset} submit={submit} myClassName="mobileDisplay" />
                    </div>

                    <CoverDeletePopup
                        open={showCoverDelPopup}
                        onClose={() => setDelCoverNum(-1)}
                        message='You are about to delete this cover image. This action cannot be undone.'
                        callback={deleteCoverImg}
                        loading={popupLoading}
                    />

                    <CoverUploadPopup
                        open={showCoverUploadPopup}
                        setShowThis={setShowCoverUploadPopup}
                        loading={popupLoading}
                        setLoading={setPopupLoading}
                        mangaID={id}
                        covers={covers}
                        setCovers={setCovers}
                        setNotiDetails={setNotiDetails}
                        setShowNoti={setShowNoti}
                    />

                    <NotiPopup
                        open={showNoti}
                        onClose={() => setShowNoti(false)}
                        message={notiDetails.message}
                        details={notiDetails.details}
                        success={notiDetails.success}
                    />
                </form>
            }

        </MainLayout>
    )
}
export default MangaEditPage;

const ActionBTNs = ({ reset, submit, myClassName = 'desktopDisplay' }) => {
    return (
        <div className={`${styles.actionBTNs} ${styles[myClassName]}`}>
            <button className={styles.blueBTN} onClick={(e) => submit(e)}>
                Save changes
            </button>
            <button className={styles.blueBTN}>
                Go to Chapters
            </button>
            <button className={styles.discardBTN} onClick={reset}>
                Discard changes
            </button>
            <button className={styles.deleteBTN}>
                Delete this manga
            </button>
        </div>
    );
};
