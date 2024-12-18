import styles from "./AddMangaPage.module.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getDefaultCover, uploadManga } from "../../service/mangaService.js";
import { checkClearance } from "../../stores/auth.js";
import { getAllAuthors, postNewAuthor } from "../../service/authorService.js";
import { getAllCategories } from "../../service/categoryService.js";
import DesktopLogo from "../../components/main/DesktopLogo.jsx";
import DesktopNavigationBar from "../../components/main/DesktopNavigationBar.jsx";
import MainLayout from "../../components/main/MainLayout.jsx";
import MangaPageLayoutComponents from "../../components/MangaPageLayout";
const { MangaPageLayout, LeftColumnContainer, RightColumnContainer } = MangaPageLayoutComponents;
import NotiPopup from "../../components/NotiPopup";
import MySelect from "../../components/MySelect";

const MangaEditPage = () => {
    const [loading, setLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState('Loading');
    const [showNoti, setShowNoti] = useState(false);
    const [notiDetails, setNotiDetails] = useState({
        success: false,
        message: '',
        details: '',
    });

    const [manga, setManga] = useState({
        name: '',
        authors: [],
        categories: [],
        canComment: false,
        description: '',
        overallRating: 0,
        status: '',
        cover: {
            file: null,
            objectURL: null,
        }
    });

    const handleTextareaChange = (e, field) => {
        const { value } = e.target;
        setManga({
            ...manga,
            [field]: value,
        });

        if (field === 'name' && !value.length) {
            setShowNameWarning(true);
        }
        else if (showNameWarning && field === 'name') {
            setShowNameWarning(false);
        }
    };
    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setManga({
            ...manga,
            [name]: checked,
        })
    };
    const handleSelectChange = (values, field) => {
        setManga({
            ...manga,
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
    const handleUploadCover = (e) => {
        if (manga.cover.objectURL)
            URL.revokeObjectURL(manga.cover.objectURL);

        const uploadedFile = e.target.files[0];
        if (uploadedFile.size > 30 * 1000 * 1000) {
            setNotiDetails({
                success: false,
                message: "The file should not exceed 30MB",
                details: '',
            });
            setShowNoti(true);
            return;
        }

        setManga({
            ...manga,
            cover: {
                file: uploadedFile,
                objectURL: URL.createObjectURL(uploadedFile),
            },
        });
    };
    const removeThumbnail = (e) => {
        URL.revokeObjectURL(manga.cover.objectURL);
        setManga({
            ...manga,
            cover: {
                file: null,
                objectURL: null,
            },
        });
    }

    // reset all changes
    const reset = (e) => {
        e.preventDefault();

        if (manga.cover.objectURL)
            URL.revokeObjectURL(manga.cover.objectURL);

        setManga({
            name: '',
            authors: [],
            categories: [],
            canComment: false,
            description: '',
            overallRating: 0,
            status: '',
            cover: {
                file: null,
                objectURL: null,
            }
        });
    }

    // warning messages for invalid input cases
    const [showNameWarning, setShowNameWarning] = useState(false);
    const [showAuthorWarning, setShowAuthorWarning] = useState(false);
    const [showCateWarning, setShowCateWarning] = useState(false);

    // for updating cover images
    const defaultCoverRef = useRef(null);

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

        if (await checkClearance() !== 2) {
            navigate('/401');
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
        else {
            console.log("Could not get author list");
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
        setLoadingMessage('Uploading manga');
        setLoading(true);
        const formData = new FormData();
        if (manga.cover.file) {
            formData.append('cover', manga.cover.file);
        }

        for (const [key, value] of Object.entries(manga)) {
            if (key !== 'cover') {
                if (key === 'authors' || key === 'categories') {
                    value.map(element => {
                        formData.append(key, element._id);
                    });
                }
                else formData.append(key, value);
            }
        }

        const response = await uploadManga(formData);
        if (response.status === 200) {
            navigate(`/mangas/${response.manga._id}`);
        }
        else if (response.status === 400) {
            setNotiDetails({
                success: false,
                message: "Failed to upload manga",
                details: response.message,
            });
            setShowNoti(true);
            setLoading(false);
        }
    };

    const canSave = () => {
        return manga.name.length && manga.authors.length && manga.categories.length && manga.status.length;
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
                        <div className={styles.coverImgContainer}>
                            <img
                                src={manga.cover.objectURL || defaultCoverRef.current}
                                alt={manga.cover.objectURL ? 'Your uploaded thumbnail' : 'Default thumbnail'}
                            />
                            {!manga.cover.objectURL ? (
                                <div className={styles.coverBTNs}>
                                    <label htmlFor="coverUploadInput">
                                        Upload thumbnail
                                    </label>
                                </div>
                            ) : (
                                <div className={styles.coverBTNs}>
                                    <label htmlFor="coverUploadInput">
                                        Change thumbnail
                                    </label>
                                    <label onClick={() => removeThumbnail()}>
                                        Remove thumbnail
                                    </label>
                                </div>
                            )}

                            <input
                                type='file'
                                accept=".png, .jpeg, .jpg"
                                style={{ display: 'none' }}
                                id="coverUploadInput"
                                onChange={handleUploadCover}
                                onClick={(e) => { e.target.value = null; }}
                            />
                        </div>

                        <ActionBTNs
                            reset={reset}
                            submit={submit}
                            canSave={canSave}
                        />
                    </LeftColumnContainer>
                    <RightColumnContainer>
                        <section className={styles.mySection}>
                            <h1>Title</h1>
                            <textarea
                                value={manga.name}
                                onChange={(e) => handleTextareaChange(e, 'name')}
                                onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                            ></textarea>
                            {showNameWarning && <div className={styles.failMsg}>Manga's title cannot be empty</div>}
                        </section>

                        <section className={styles.mySection}>
                            <h1>Authors</h1>
                            <MySelect
                                options={authorsRef.current}
                                onChange={(values) => handleSelectChange(values, 'authors')}
                                isLoading={loading}
                                value={manga.authors.map(author => {
                                    return {
                                        label: author.name,
                                        value: author._id,
                                    };
                                })}
                            />
                            {showAuthorWarning && <div className={styles.failMsg}>Must select at least 1 author</div>}
                        </section>

                        <section className={styles.mySection}>
                            <h1>Not finding your author? Post a new one</h1>
                            <div className={styles.newAuthorInput}>
                                <input
                                    type='text'
                                    onChange={handleTextInput}
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

                        <section className={styles.mySection}>
                            <h1>Synopsis</h1>
                            <textarea value={manga.description} onChange={(e) => handleTextareaChange(e, 'description')}></textarea>
                        </section>

                        <section className={styles.mySection}>
                            <h1>Tags</h1>
                            <MySelect
                                onChange={(values) => handleSelectChange(values, 'categories')}
                                options={categoriesRef.current}
                                value={manga.categories.map(category => {
                                    return {
                                        label: category.name,
                                        value: category._id,
                                    };
                                })}
                                isLoading={loading}
                            />
                            {showCateWarning && <div className={styles.failMsg}>Must select at least 1 tag</div>}
                        </section>

                        <section className={styles.mySection}>
                            <h1>Status</h1>
                            <MySelect
                                isMulti={false}
                                onChange={(value) => setManga({
                                    ...manga,
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
                            />
                        </section>


                        <label className={styles.formControl}>
                            <input type='checkbox' name='canComment' checked={manga.canComment} onChange={handleCheckboxChange} />
                            Allow Comments
                        </label>

                        <ActionBTNs
                            reset={reset}
                            submit={submit}
                            myClassName="mobileDisplay"
                            canSave={canSave}
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
            }

        </MainLayout>
    )
}
export default MangaEditPage;

const ActionBTNs = ({ reset, submit, myClassName = 'desktopDisplay', canSave }) => {
    return (
        <div className={`${styles.actionBTNs} ${styles[myClassName]}`}>
            <button
                className={styles.blueBTN}
                onClick={(e) => submit(e)}
                disabled={!canSave()}
            >
                Post
            </button>

            <button className={styles.discardBTN} onClick={reset}>
                Reset
            </button>
        </div>
    );
};
