import styles from "./MangaEditPage.module.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMangaByID, updateMangaInfo, deleteManga, getCovers, getDefaultCover, deleteCover } from "../../service/mangaService.js";
import { getMe } from "../../service/userService.js"
import { getAllAuthors, postNewAuthor } from "../../service/authorService.js";
import { getAllCategories } from "../../service/categoryService.js";
import DesktopLogo from "../../components/main/DesktopLogo.jsx";
import DesktopNavigationBar from "../../components/main/DesktopNavigationBar.jsx";
import MobileNavigationBar from "../../components/main/MobileNavigationBar.jsx";
import MainLayout from "../../components/main/MainLayout.jsx";
import MangaPageLayoutComponents from "../../components/MangaPageLayout";
const { MangaPageLayout, LeftColumnContainer, RightColumnContainer } = MangaPageLayoutComponents;
import TabComponents from "../../components/Tab"
const { Tab, TabPanel } = TabComponents;
import { FaPlus } from "react-icons/fa";
import DeletePopup from "../../components/DeletePopup";
import NotiPopup from "../../components/NotiPopup";
import CoverUploadPopup from "../../components/CoverUploadPopup";
import MySelect from "../../components/MySelect";
import { ActionBTNs } from "./ActionBTNs.jsx";

const MangaEditPage = () => {
    const [me, setMe] = useState({
        name: '',
        email: '',
        accountType: '',
    });
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState('Loading');
    const [showNoti, setShowNoti] = useState(false);
    const [notiDetails, setNotiDetails] = useState({
        success: false,
        message: '',
        details: '',
    });

    const mangaRef = useRef(null);  // use this to reset changes
    const [updatedManga, setUpdatedManga] = useState({
        _id: '',
        name: '',
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
        });

        if (field === 'name' && !value.length) {
            setShowNameWarning(true);
        }
        else {
            showNameWarning && setShowNameWarning(false);
        }
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
        });

        if (field === 'authors') {
            if (!values.length) {
                setShowAuthorWarning(true);
            }
            else {
                showAuthorWarning && setShowAuthorWarning(false);
            }
        }
        else if (field === 'categories') {
            if (!values.length) {
                setShowCateWarning(true);
            }
            else {
                showCateWarning && setShowCateWarning(false);
            }
        }
    };
    // reset all changes
    const reset = (e) => {
        e.preventDefault();
        setUpdatedManga(mangaRef.current);
    }

    // warning messages for invalid input cases
    const [showNameWarning, setShowNameWarning] = useState(false);
    const [showAuthorWarning, setShowAuthorWarning] = useState(false);
    const [showCateWarning, setShowCateWarning] = useState(false);

    // for updating cover images
    const [covers, setCovers] = useState([]);
    const defaultCoverRef = useRef(null);
    const [showCoverUploadPopup, setShowCoverUploadPopup] = useState(false);
    const [coverUploadPopupLoading, setCoverUploadPopupLoading] = useState(false);
    const [delPopupDetails, setDelPopupDetails] = useState({
        show: false,
        loading: false,
        onClose: () => { },
        message: '',
        callback: () => { },
    });

    const deleteCoverImg = async (delCoverNum) => {
        setDelPopupDetails({
            ...delPopupDetails,
            show: true,
            loading: true,
        });

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

        setDelPopupDetails({
            ...delPopupDetails,
            show: false,
            loading: false,
        });
        setShowNoti(true);
    };

    const authorsRef = useRef([]);
    const categoriesRef = useRef([]);
    const [newAuthor, setNewAuthor] = useState('');  // for posting new author
    const handleTextInput = (e) => {
        const { value } = e.target;
        setNewAuthor(value);
        if (authorPostingResult.length)
            setAuthorPostingResult('');
    };

    const [authorPostingResult, setAuthorPostingResult] = useState('');
    const [addAuthorSuccess, setAddAuthorSuccess] = useState(false);
    const submitNewAuthor = async (e) => {
        e.preventDefault();
        const response = await postNewAuthor(newAuthor);
        if (response.status === 200) {
            setAuthorPostingResult(`Author ${newAuthor} added`);
            setNewAuthor('');

            // add to author option
            authorsRef.current = [
                ...authorsRef.current,
                { label: response.author.name, value: response.author._id }
            ];
            setAddAuthorSuccess(true);
        }
        else {
            setAuthorPostingResult(`Failed to post new author. ${response.message}`);
            if (response.message === 'That author already exists.') {
                const authorResponse = await getAllAuthors();
                if (authorResponse?.status === 200) {
                    authorsRef.current = authorResponse.authors.map(author => {
                        return {
                            value: author._id,
                            label: author.name,
                        };
                    });
                }
                else {
                    console.log("Reload the page you noob");
                }
            }
            setAddAuthorSuccess(false);
        }
    };

    const navigate = useNavigate();

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

        const meResponse = await getMe();
        if (meResponse) {
            setMe(meResponse);
        }

        if (
            !meResponse ||
            (
                meResponse.accountType !== 'admin' &&
                (meResponse && mangaResponse.status === 200 && mangaResponse.manga.uploader._id !== meResponse._id)
            )
        ) {
            navigate('/401');
            return;
        }

        mangaRef.current = mangaResponse.manga;
        setUpdatedManga(mangaResponse.manga);

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
        setLoadingMessage("Updating manga's information");
        setLoading(true);
        const response = await updateMangaInfo(id, updatedManga);
        if (response.status === 200) {
            navigate(`/mangas/${id}`);
        }
        else {
            setNotiDetails({
                success: false,
                message: 'Failed to update the manga',
                details: response.message,
            });
            setShowNoti(true);
            setLoading(false);
        }
    };

    const canSave = () => {
        return updatedManga.name.length && updatedManga.authors.length && updatedManga.categories.length;
    };

    // real shiet
    const showDeleteMangaPopup = (e) => {
        e.preventDefault();
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
            message: "You are about to delete this manga.",
            callback: deleteMangaWrapper,
        });
    };

    const deleteMangaWrapper = async () => {
        setDelPopupDetails({
            ...delPopupDetails,
            loading: true,
            show: true,
        });

        const response = await deleteManga(id);
        setDelPopupDetails({
            ...delPopupDetails,
            loading: false,
            show: false,
        });

        if (response.status === 200) {
            navigate('/');
            return;
        }

        setNotiDetails({
            success: false,
            message: 'Failed to delete the manga',
            details: response.message,
        });
        setShowNoti(true);
    };

    return (
        <MainLayout>
            <header className="flex w-full flex-row items-center justify-between">
                <DesktopLogo />
                <div className="flex w-full flex-row items-center gap-8 lg:w-fit">
                    <DesktopNavigationBar />
                </div>
            </header>

            {loading ? <div className={styles.loadingContainer}>{loadingMessage}</div> :
                <MangaPageLayout tag='form'>
                    <LeftColumnContainer>
                        <img src={updatedManga.cover} className={styles.coverImg} />

                        <ActionBTNs
                            me={me}
                            reset={reset}
                            submit={submit}
                            mangaID={id}
                            navigate={navigate}
                            canSave={canSave}
                            showDeleteMangaPopup={showDeleteMangaPopup}
                        />
                    </LeftColumnContainer>
                    <RightColumnContainer>
                        <Tab>
                            <TabPanel title="General">
                                <section className={styles.mySection}>
                                    <h1>Title</h1>
                                    <textarea
                                        value={updatedManga.name}
                                        onChange={(e) => handleTextareaChange(e, 'name')}
                                        onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                                        disabled={me.accountType === 'admin'}
                                    ></textarea>
                                    {showNameWarning && <div className={styles.failMsg}>Manga's title cannot be empty</div>}
                                </section>

                                <section className={styles.mySection}>
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
                                        isDisabled={me.accountType === 'admin'}
                                    />
                                    {showAuthorWarning && <div className={styles.failMsg}>Must select at least 1 author</div>}
                                </section>

                                {me.accountType !== 'admin' && (
                                    <section className={styles.mySection}>
                                        <h1>Not finding your author? Post a new one</h1>
                                        <div className={styles.newAuthorInput}>
                                            <input
                                                type='text'
                                                onChange={handleTextInput}
                                                disabled={me.accountType === 'admin'}
                                            />
                                            <button
                                                onClick={submitNewAuthor}
                                                disabled={!newAuthor.length}
                                            >
                                                Post
                                            </button>
                                        </div>
                                        {authorPostingResult.length > 0 &&
                                            <div
                                                className={addAuthorSuccess ? styles.successMsg : styles.failMsg}
                                            >
                                                {authorPostingResult}
                                            </div>
                                        }
                                    </section>
                                )}

                                <section className={styles.mySection}>
                                    <h1>Synopsis</h1>
                                    <textarea
                                        value={updatedManga.description}
                                        onChange={(e) => handleTextareaChange(e, 'description')}
                                        disabled={me.accountType === 'admin'}
                                    ></textarea>
                                </section>

                                <section className={styles.mySection}>
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
                                        isDisabled={me.accountType === 'admin'}
                                    />
                                    {showCateWarning && <div className={styles.failMsg}>Must select at least 1 tag</div>}
                                </section>

                                <section className={styles.mySection}>
                                    <h1>Status</h1>
                                    <MySelect
                                        isMulti={false}
                                        onChange={(value) => setUpdatedManga({
                                            ...updatedManga,
                                            status: value.value,
                                        })}
                                        options={[
                                            {
                                                label: 'Completed', value: 'Completed'
                                            },
                                            {
                                                label: 'In progress', value: 'In progress'
                                            },
                                            {
                                                label: 'Suspended', value: 'Suspended'
                                            },
                                        ]}
                                        isLoading={loading}
                                        value={{ label: updatedManga.status, value: updatedManga.status }}
                                        isDisabled={me.accountType === 'admin'}
                                    />
                                </section>

                                <label className={styles.formControl}>
                                    <input
                                        type='checkbox'
                                        name='canComment'
                                        checked={updatedManga.canComment}
                                        onChange={handleCheckboxChange}
                                        disabled={me.accountType === 'admin'}
                                    />
                                    Allow Comments
                                </label>
                            </TabPanel>

                            <TabPanel title="Art">
                                <div className={styles.coverListContainer}>
                                    {covers.map(cover => (
                                        <div key={cover._id} className={styles.coverContainer}>
                                            <img src={cover.imageURL} className={styles.smolCover} />
                                            <div className={styles.coverNumber}>#{cover.number}</div>
                                            {me.accountType !== 'admin' && (
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
                                                        onClick={() => {
                                                            setDelPopupDetails({
                                                                show: true,
                                                                loading: false,
                                                                onClose: () => {
                                                                    setDelPopupDetails({
                                                                        ...delPopupDetails,
                                                                        show: false,
                                                                    });
                                                                },
                                                                message: 'You are about to delete this cover image.',
                                                                callback: () => deleteCoverImg(cover.number),
                                                            });
                                                        }}
                                                    >
                                                        Remove
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {me.accountType !== 'admin' && (
                                        <div
                                            className={`${styles.coverPlaceholder} ${!covers.length && styles['min-height-placeholder']}`}
                                            onClick={() => setShowCoverUploadPopup(true)}
                                        >
                                            <FaPlus />
                                        </div>
                                    )}
                                </div>
                            </TabPanel>
                        </Tab>

                        <ActionBTNs
                            me={me}
                            reset={reset}
                            submit={submit}
                            myClassName="mobileDisplay"
                            mangaID={id}
                            navigate={navigate}
                            canSave={canSave}
                            showDeleteMangaPopup={showDeleteMangaPopup}
                        />
                    </RightColumnContainer>

                    <DeletePopup
                        open={delPopupDetails.show}
                        onClose={delPopupDetails.onClose}
                        message={delPopupDetails.message}
                        callback={delPopupDetails.callback}
                        loading={delPopupDetails.loading}
                    />

                    {me.accountType !== 'admin' && (
                        <CoverUploadPopup
                            open={showCoverUploadPopup}
                            setShowThis={setShowCoverUploadPopup}
                            loading={coverUploadPopupLoading}
                            setLoading={setCoverUploadPopupLoading}
                            mangaID={id}
                            covers={covers}
                            setCovers={setCovers}
                            setNotiDetails={setNotiDetails}
                            setShowNoti={setShowNoti}
                        />
                    )}

                    <NotiPopup
                        open={showNoti}
                        onClose={() => setShowNoti(false)}
                        message={notiDetails.message}
                        details={notiDetails.details}
                        success={notiDetails.success}
                    />
                </MangaPageLayout>
            }

            <footer>
                <MobileNavigationBar />
            </footer>
        </MainLayout>
    )
}
export default MangaEditPage;