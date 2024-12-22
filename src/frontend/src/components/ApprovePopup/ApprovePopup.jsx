import Popup from "reactjs-popup";
import "./ApprovePopup.css";
import styles from "./ApprovePopup.module.css";
import { useState } from 'react';
import NotiPopup from "../NotiPopup";
import { sendApprovalRequests } from "../../service/userService.js";


const ReportPopup = ({ loggedIn}) => {
    const [showThis, setShowThis] = useState(false);
    const [showNoti, setShowNoti] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isInputFilled, setIsInputFilled] = useState(false);
    const [formValues, setFormValues] = useState({
        Reason: "",
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
            Reason:""
        });
    };

    // Check if any field is filled
    const checkIfInputFilled = (updatedValues) => {
        const hasText = updatedValues.Reason.trim().length > 0;
        setIsInputFilled(hasText);
    };

    const handleTextareaChange = (e) => {
        const { value } = e.target;
        const updatedValues = { Reason: value };
        setFormValues(updatedValues);
        checkIfInputFilled(updatedValues);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        // submit report
        const selectedReasons = Object.keys(formValues)
            .filter((key) => formValues[key] === true);

        if (formValues.Reason.trim() !== '') {
            selectedReasons.push(`Reason: ${formValues.Reason}`);
        }
        setLoading(true);
        const response = await sendApprovalRequests(selectedReasons[0]);
        if (response.status === 200) {
            setNotiDetails({
                success: true,
                message: "Successfully sent approval request!",
                details: ``
            });
        }
        else {
            setNotiDetails({
                success: false,
                message: "You have already sent approval request!",
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
            <div className="w-full max-w-xl p-1.5 rounded-xl text-xs bg-blue hover:bg-light-blue text-center cursor-pointer" onClick={onOpen}>Approval Request</div>

            <Popup
                open={showThis} modal
                onOpen={onOpen}
                onClose={onClose}
                closeOnDocumentClick
                closeOnEscapse
                lockScroll
                className='report-popup'
            >
                {loading ? <div className={styles.loading}>Sending request</div> : (
                    <form className={styles.reportForm}>
                        <div>Approval Request</div>
                        <textarea
                            placeholder="Why do you want to be an approved user?"
                            value={formValues.Reason}
                            onChange={handleTextareaChange}
                        ></textarea>

                        <div className={styles.btnContainer}>
                            <button
                                disabled={!isInputFilled}
                                onClick={(e) => onSubmit(e)}
                                className={styles.confirmBTN}
                            >
                                Send
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