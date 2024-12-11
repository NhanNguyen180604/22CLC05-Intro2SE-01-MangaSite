import Popup from "reactjs-popup";
import "./CoverUploadPopup.css";
import styles from "./CoverUploadPopup.module.css";
import { useState } from "react";
import { uploadCover } from "../../service/mangaService.js";

const CoverUploadPopup = ({ open, setShowThis, loading, setLoading, mangaID, covers, setCovers, setNotiDetails, setShowNoti }) => {
    const [image, setImage] = useState(null);

    const [number, setNumber] = useState(0);
    const [showWarning, setShowWarning] = useState(false);  //warning about duplicate cover number
    const [warningMessage, setWarningMessage] = useState('');
    const handleNumberChange = (e) => {
        let { value } = e.target;
        value = parseInt(value);
        setNumber(value);

        // check if there are duplicate in number
        if (covers.find(cover => cover.number === value)) {
            setWarningMessage(`Cover number ${value} already exist!`);
            setShowWarning(true);
        }
        else {
            showWarning && setShowWarning(false);
        }
    };

    const handleUpload = (e) => {
        const uploadedFile = e.target.files[0];
        setImage(uploadedFile);
    };

    const onOpen = () => {
        setNumber(covers[covers.length - 1].number + 1);
    };

    const onClose = () => {
        setShowThis(false);
        setShowWarning(false);
        setWarningMessage('');
        URL.revokeObjectURL(image);
        setImage(null);
    };

    const submit = async (e) => {
        setLoading(true);

        e.preventDefault();
        const formData = new FormData();
        formData.append('number', number);
        formData.append('image', image);
        const response = await uploadCover(mangaID, formData);

        if (response.status === 200) {
            setNotiDetails({
                success: true,
                message: 'Uploaded cover image successfully',
                details: '',
            });

            setCovers([
                ...covers,
                response.cover,
            ].sort((a, b) => a.number - b.number));
        }
        else {
            setNotiDetails({
                success: false,
                message: 'Failed to upload cover image',
                details: response.message,
            });
        }

        setLoading(false);
        onClose();
        setShowNoti(true);
    };

    return (
        <Popup
            className="cover-upload-popup"
            open={open}
            onOpen={onOpen}
            onClose={onClose}
            modal
            lockScroll
            closeOnDocumentClick={!loading}
            closeOnEscapse={!loading}
        >
            {loading ? <div className={styles.loadingMsg}>Uploading</div> : (
                <form className={styles.coverUploadContainer}>
                    <div className={styles.header}>Upload a new cover</div>

                    <div className={styles.inputContainer}>
                        <label htmlFor="inputCoverNumber">
                            Enter cover number
                        </label>
                        <input
                            id="inputCoverNumber"
                            type='number'
                            value={number}
                            name='number'
                            onChange={handleNumberChange}
                            min={1}
                        />
                    </div>

                    <div className={styles.inputContainer}>
                        <label htmlFor="singleCoverUpload" className={styles.uploadLabel}>
                            Upload image
                        </label>
                        <label>File size limit is 30MB</label>
                        <input
                            className={styles.hidden}
                            type='file'
                            accept=".png, .jpeg, .jpg"
                            onChange={handleUpload}
                            name="image"
                            id="singleCoverUpload"
                        />
                        {showWarning && <div className={styles.warningMsg}>{warningMessage}</div>}
                    </div>

                    <div className={styles.preview}>
                        {image && <img src={URL.createObjectURL(image)} />}
                    </div>

                    <div className={styles.btnContainer}>
                        <button
                            className={styles.confirmBTN}
                            disabled={showWarning || !image}
                            onClick={submit}
                        >
                            Post
                        </button>
                        <button
                            className={styles.cancelBTN}
                            onClick={(e) => { e.preventDefault(); onClose(); }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </Popup>
    )
}
export default CoverUploadPopup;