import styles from "./LibraryForm.module.css"
import { useState, useEffect } from "react";
import { getMangaComments } from "../../service/mangaService.js";
import { useParams } from "react-router-dom";
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

function LibraryForm({ title, setShowThis, setNotiFormDetails, setShowNotiForm }) {
    const { id } = useParams();

    const [expanded, setExpanded] = useState(false);
    const [selected, setSelected] = useState('None'); // will add fetching library later

    const selectOption = (option) => {
        setSelected(option);
        setExpanded(false);
    };

    const onSubmit = (e) => {
        e.preventDefault();

        // API call here


        // set result popup details based on api call result
        if (true) {
            setNotiFormDetails({
                success: true,
                message: "Successfully update library!",
                details: ``
            });
        }
        else {
            setNotiFormDetails({
                success: false,
                message: "What fails (failed to send? not logged in?)",
                details: "Reason why failed"
            });
        }

        // show result popup
        setShowThis(false);
        setShowNotiForm(true);
    }

    return (
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
                        <div>{selected}</div>
                        <div>{expanded ? <FaChevronUp /> : <FaChevronDown />}</div>
                    </div>
                    <div
                        onClick={() => { selectOption('None') }}
                        className={`
                            ${styles.selectOption} 
                            ${selected === 'None' ? styles.selectedOption : ""}
                            ${!expanded ? styles.displayNone : ""}
                        `}
                    >
                        None
                    </div>
                    <div
                        onClick={() => { selectOption('Reading') }}
                        className={`
                            ${styles.selectOption} 
                            ${selected === 'Reading' ? styles.selectedOption : ""}
                            ${!expanded ? styles.displayNone : ""}
                        `}
                    >
                        Reading
                    </div>
                    <div
                        onClick={() => { selectOption('Re-reading') }}
                        className={`
                            ${styles.selectOption} 
                            ${selected === 'Re-reading' ? styles.selectedOption : ""}
                            ${!expanded ? styles.displayNone : ""}
                        `}
                    >
                        Re-reading
                    </div>
                    <div
                        onClick={() => { selectOption('Completed') }}
                        className={`
                            ${styles.selectOption} 
                            ${selected === 'Completed' ? styles.selectedOption : ""}
                            ${!expanded ? styles.displayNone : ""}
                        `}
                    >
                        Completed
                    </div>
                </div>
                <div className={styles.btnContainer}>
                    <button onClick={(e) => onSubmit(e)}>Update</button>
                    <button onClick={(e) => { e.preventDefault(); setShowThis(false); }}>Cancel</button>
                </div>
            </div>
        </form>
    );
}

export default LibraryForm;