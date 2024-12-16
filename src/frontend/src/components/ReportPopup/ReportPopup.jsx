import Popup from "reactjs-popup";
import "./ReportPopup.css";
import styles from "./ReportPopup.module.css";
import { useState } from 'react';
import { FaFlag } from "react-icons/fa"
import NotiPopup from "../NotiPopup";
import { sendReport } from "../../service/reportService.js";


const ReportPopup = ({ loggedIn, reportField, reportedId }) => {
    const [showThis, setShowThis] = useState(false);
    const [showNoti, setShowNoti] = useState(false);

    const [loading, setLoading] = useState(true);
    const [isInputFilled, setIsInputFilled] = useState(false);
    const [formValues, setFormValues] = useState({
        Plagiarism: false,
        "Inappropriate-Content": false,
        "Unauthorized-Repost": false,
        "Wrong-Tags": false,
        otherReason: "",
    });

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
        else setShowThis(true);
    };

    const onClose = () => {
        reset();
        setShowThis(false);
    };

    const reset = () => {
        setFormValues({
            Plagiarism: false,
            "Inappropriate-Content": false,
            "Unauthorized-Repost": false,
            "Wrong-Tags": false,
            otherReason: "",
        });
    };

    // Check if any field is filled
    const checkIfInputFilled = (updatedValues) => {
        const hasCheckboxChecked = Object.values(updatedValues).slice(0, 4).some(Boolean); // Check checkboxes
        const hasText = updatedValues.otherReason.trim().length > 0; // Check textarea
        setIsInputFilled(hasCheckboxChecked || hasText);
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        const updatedValues = { ...formValues, [name]: checked };
        setFormValues(updatedValues);
        checkIfInputFilled(updatedValues);
    };

    const handleTextareaChange = (e) => {
        const { value } = e.target;
        const updatedValues = { ...formValues, otherReason: value };
        setFormValues(updatedValues);
        checkIfInputFilled(updatedValues);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        // submit report
        const selectedReasons = Object.keys(formValues)
            .filter((key) => formValues[key] === true);

        if (formValues.otherReason.trim() !== '') {
            selectedReasons.push(`Other reason: ${formValues.otherReason}`);
        }

        const description = selectedReasons.join('\n');
        // API call here
        setLoading(true);
        const response = await sendReport(reportField, reportedId, description);
        console.log(response);

        // set result popup details based on api call result
        if (response.status === 200) {
            setNotiDetails({
                success: true,
                message: "Successfully sent report!",
                details: ``
            });
        }
        else {
            setNotiDetails({
                success: false,
                message: "Failed to send report!",
                details: response.message,
            });
        }

        setLoading(false);

        // show result popup
        onClose();
        setShowNoti(true);
    }

    return (
        <>
            <div className={styles.toggleBTN} onClick={onOpen}>
                <FaFlag />
            </div>

            <Popup
                open={showThis} modal
                onOpen={onOpen}
                onClose={onClose}
                closeOnDocumentClick
                closeOnEscapse
                lockScroll
                className='report-popup'
            >
                {loading ? <div className={styles.loading}>Sending report</div> : (
                    <form className={styles.reportForm}>
                        <div>Report</div>

                        <div>
                            <label className={styles.formControl}>
                                <input
                                    type='checkbox'
                                    name='Plagiarism'
                                    checked={formValues.Plagiarism}
                                    onChange={handleCheckboxChange}
                                />
                                Plagiarism
                            </label>
                            <label className={styles.formControl}>
                                <input
                                    type='checkbox'
                                    name='Inappropriate-Content'
                                    checked={formValues["Inappropriate-Content"]}
                                    onChange={handleCheckboxChange}
                                />
                                Inappropriate Content
                            </label>
                            <label className={styles.formControl}>
                                <input
                                    type='checkbox'
                                    name='Unauthorized-Repost'
                                    checked={formValues["Unauthorized-Repost"]}
                                    onChange={handleCheckboxChange}
                                />
                                Unauthorized Repost
                            </label>
                            <label className={styles.formControl}>
                                <input
                                    type='checkbox'
                                    name='Wrong-Tags'
                                    checked={formValues["Wrong-Tags"]}
                                    onChange={handleCheckboxChange}
                                />
                                Wrong Tags
                            </label>
                        </div>

                        <textarea
                            placeholder="Other reasons"
                            value={formValues.otherReason}
                            onChange={handleTextareaChange}
                        ></textarea>

                        <div className={styles.btnContainer}>
                            <button
                                disabled={!isInputFilled}
                                onClick={(e) => onSubmit(e)}
                                className={styles.confirmBTN}
                            >
                                Confirm Report
                            </button>
                            <button
                                onClick={(e) => { e.preventDefault(); onClose(); }}
                                className={styles.cancelBTN}
                            >
                                Cancel
                            </button>
                        </div>

                    </form>
                )}
            </Popup>

            <NotiPopup
                open={showNoti}
                onClose={() => setShowNoti(false)}
                success={notiDetails.success}
                message={notiDetails.message}
                details={notiDetails.details}
            />
        </>
    )
}
export default ReportPopup;