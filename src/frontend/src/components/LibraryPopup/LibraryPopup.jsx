import Popup from "reactjs-popup";
import "./LibraryPopup.css";
import styles from "./LibraryPopup.module.css";
import { useState, useEffect } from 'react';
import { FaBookmark, FaChevronDown, FaChevronUp } from "react-icons/fa6";
import NotiPopup from "../NotiPopup";
import { useParams } from 'react-router-dom';
import { updateLibrary, deleteFromLibrary, getLibrary } from "../../service/userService.js";

const LibraryPopup = ({ loggedIn, title }) => {
    const [showThis, setShowThis] = useState(false);
    const [showNoti, setShowNoti] = useState(false);

    const { id } = useParams();
    const [loading, setLoading] = useState(true);

    const [expanded, setExpanded] = useState(false);
    const [selected, setSelected] = useState('none'); // will add fetching library later
    const [oldTab, setOldTab] = useState('none');

    const [notiDetails, setNotiDetails] = useState({
        success: false,
        message: '',
        details: '',
    });

    const onOpen = async () => {
        if (loggedIn === false) {
            setNotiDetails({
                success: false,
                message: 'You are not logged in!',
                details: 'Log in to use this feature',
            });
            setShowThis(false);
            setShowNoti(true);
        }
        else {
            setShowThis(true);
            await fetchMyLibrary();
        }
    };

    const fetchMyLibrary = async () => {
        const library = await getLibrary();
        if (!library)
            return;

        if (library.completed.find(e => e._id === id)) {
            setSelected('completed');
            setOldTab('completed');
        }
        else if (library.reading.find(e => e._id === id)) {
            setSelected('reading');
            setOldTab('reading');
        }
        else if (library.re_reading.find(e => e._id === id)) {
            setSelected('re_reading');
            setOldTab('re_reading');
        }
        else {
            setSelected('none');
            setOldTab('none');
        }
    };

    useEffect(() => {
        const initialize = async () => {
            if (loggedIn) {
                setLoading(true);
                await fetchMyLibrary();
                setLoading(false);
            }
        };

        initialize();
    }, []);

    const selectOption = (option) => {
        setSelected(option.toLowerCase());
        setExpanded(false);
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        // API call here
        let response;
        if (selected !== 'none')
            response = await updateLibrary(id, selected);
        else
            response = await deleteFromLibrary(id, oldTab);

        // set result popup details based on api call result
        if (response.status === 200) {
            setNotiDetails({
                success: true,
                message: "Successfully update library!",
                details: ``
            });
        }
        else {
            setNotiDetails({
                success: false,
                message: "Failed to update library",
                details: response.message,
            });
        }

        // show result popup
        setShowThis(false);
        setShowNoti(true);
    }

    return (
        <>
            <div className={styles.toggleBTN} onClick={onOpen}>
                <FaBookmark />
            </div>

            <Popup
                className="library-popup"
                open={showThis}
                modal
                onClose={() => setShowThis(false)}
                closeOnDocumentClick
                lockScroll
            >
                <form className={styles.libraryForm}>
                    <div className={styles.formTitle}>Add to library</div>
                    <div className={styles.formContentContainer}>
                        <div className={styles.mangaTitle}>{title}</div>
                        <label htmlFor="libraryTabs">Reading status</label>
                        <div id='libraryTabs' className={styles.selectForm}>
                            <div
                                onClick={() => setExpanded(prev => !prev)}
                                className={`${styles.selectPlaceholder} ${expanded ? styles.expandedPlaceholder : ""}`}
                            >
                                <div>{loading ? "Loading" : selected.charAt(0).toUpperCase() + selected.slice(1)}</div>
                                <div>{expanded ? <FaChevronUp /> : <FaChevronDown />}</div>
                            </div>
                            <div
                                onClick={() => { selectOption('None') }}
                                className={`
                                    ${styles.selectOption} 
                                    ${selected === 'none' ? styles.selectedOption : ""}
                                    ${!expanded ? styles.displayNone : ""}
                                `}
                            >
                                None
                            </div>
                            <div
                                onClick={() => { selectOption('Reading') }}
                                className={`
                                    ${styles.selectOption} 
                                    ${selected === 'reading' ? styles.selectedOption : ""}
                                    ${!expanded ? styles.displayNone : ""}
                                `}
                            >
                                Reading
                            </div>
                            <div
                                onClick={() => { selectOption('Re_reading') }}
                                className={`
                                    ${styles.selectOption} 
                                    ${selected === 're_reading' ? styles.selectedOption : ""}
                                    ${!expanded ? styles.displayNone : ""}
                                `}
                            >
                                Re_reading
                            </div>
                            <div
                                onClick={() => { selectOption('Completed') }}
                                className={`
                                    ${styles.selectOption} 
                                    ${selected === 'completed' ? styles.selectedOption : ""}
                                    ${!expanded ? styles.displayNone : ""}
                                `}
                            >
                                Completed
                            </div>
                        </div>
                        <div className={styles.btnContainer}>
                            <button
                                className={styles.confirmBTN}
                                onClick={(e) => onSubmit(e)} disabled={oldTab === selected}
                            >
                                Update
                            </button>
                            <button
                                className={styles.cancelBTN}
                                onClick={(e) => { e.preventDefault(); setShowThis(false); }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>
            </Popup>

            <NotiPopup
                open={showNoti}
                onClose={() => setShowNoti(false)}
                success={notiDetails.success}
                message={notiDetails.message}
                details={notiDetails.details}
            />
        </>
    );
}
export default LibraryPopup