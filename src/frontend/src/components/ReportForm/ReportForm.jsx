import styles from "./ReportForm.module.css"
import { useState } from "react";

function ReportForm({ setShowThis, setNotiFormDetails, setShowNotiForm }) {
    const [isInputFilled, setIsInputFilled] = useState(false);
    const [formValues, setFormValues] = useState({
        Plagiarism: false,
        "Inappropriate-Content": false,
        "Unauthorized-Repost": false,
        "Wrong-Tags": false,
        otherReason: "",
    });

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

    const onSubmit = (e) => {
        e.preventDefault();
        // submit report
        const selectedReasons = Object.keys(formValues)
            .filter((key) => formValues[key] === true);

        if (formValues.otherReason.trim() !== '') {
            selectedReasons.push(formValues.otherReason);
        }

        const description = selectedReasons.join('\n');
        // API call here
        console.log(description);

        // set result popup details based on api call result
        if (true) {
            setNotiFormDetails({
                success: true,
                message: "Successfully sent report!",
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

            <button type='submit'
                disabled={!isInputFilled}
                onClick={(e) => onSubmit(e)}>
                Confirm Report
            </button>
        </form>
    );
}

export default ReportForm;