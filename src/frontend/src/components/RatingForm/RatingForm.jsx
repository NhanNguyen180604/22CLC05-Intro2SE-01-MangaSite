import styles from './RatingForm.module.css';
import { FaStar } from 'react-icons/fa6';
import { useState, useEffect } from 'react';

const RatingForm = ({ ratings, setShowThis, setNotiFormDetails, setShowNotiForm }) => {
    const [rating, setRating] = useState(0);
    const ratingTerms = ['Bad', 'Ok', 'Mid', 'Good', 'Peak'];
    const [currentTerm, setCurrentTerm] = useState(null);
    useEffect(() => {
        setCurrentTerm(ratingTerms[rating - 1]);
    }, [rating]);

    const calAvgRating = (ratings) => {
        if (!ratings || ratings.length === 0)
            return 0;

        let result = ratings.reduce((accumulator, current) => accumulator + current.score, 0);
        result = (result / ratings.length);
        return result;
    }

    const onClickHandler = (e) => {
        e.preventDefault();
        // submit rating
        console.log(`You rated this ${rating} out of 5`);

        // api call here

        // set result popup details based on api call result
        if (true) {
            setNotiFormDetails({
                success: true,
                message: "Rating accepted!",
                details: `You rated this manga ${rating}/5 ${rating > 1 ? "stars" : "star"} (${currentTerm})`
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
        <form className={styles.ratingForm}>
            <div>Rate</div>
            <div className={styles.overallRating}>
                <span>Overall Rating:</span> <span className={styles.idkWhatToNameThis}>{calAvgRating(ratings)}<FaStar className={styles.activeStar}/></span><span className={styles.ratingCount}>({ratings.length.toLocaleString()} ratings)</span>
            </div>
            <div className={styles.ratingInput}>
                <div className={styles.starInputDiv}>
                    {[...Array(5)].map((star, index) => {
                        const currentRate = index + 1;
                        return (
                            <label
                                key={ratingTerms[index]}
                                className={styles.starInputLabel}
                            >
                                <input type='radio' name='rate' className={styles.starInputRadio}
                                    value={currentRate}
                                    onClick={() => setRating(currentRate)}
                                />

                                <FaStar className={currentRate <= rating ? styles.activeStar : styles.inactiveStar} />
                            </label>
                        )
                    })}
                </div>

                <div className={styles.starInputDiv}>{currentTerm ? currentTerm : 'Pick a rating'}</div>
            </div>
            <button type='submit' disabled={rating === 0}
                onClick={(e) => onClickHandler(e)}>
                Confirm Rating
            </button>
        </form>
    )
}
export default RatingForm