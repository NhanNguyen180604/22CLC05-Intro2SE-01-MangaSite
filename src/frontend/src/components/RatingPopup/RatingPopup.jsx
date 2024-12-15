import Popup from "reactjs-popup";
import 'reactjs-popup/dist/index.css';
import './RatingPopup.css';
import styles from './RatingForm.module.css';
import { FaStar } from 'react-icons/fa6';
import { useState, useEffect } from 'react';
import { getRatings, sendRating, getOneRating } from '../../service/mangaService.js';
import NotiPopup from "../NotiPopup";
import StarRating from "../StarRating";

const RatingPopup = ({ loggedIn, mangaID }) => {
    const [showThis, setShowThis] = useState(false);
    const [showNoti, setShowNoti] = useState(false);

    const [currentRating, setCurrentRating] = useState(0);
    const [ratings, setRatings] = useState([]);
    const ratingTerms = ['Bad', 'Ok', 'Mid', 'Good', 'Peak'];
    const [currentTerm, setCurrentTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [myRating, setMyRating] = useState(0);   // previous rating on this manga

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
            await fetchMyRating();
        }
    };

    const fetchRatings = async () => {
        const ratingResponse = await getRatings(mangaID);
        if (ratingResponse.status === 200) {
            setRatings(ratingResponse.ratings);
        }
        else {
            console.log("Couldn't get ratings");
        }
    };

    const fetchMyRating = async () => {
        const response = await getOneRating(mangaID);
        if (response.status === 200)
            setMyRating(response.rating.score);
    };

    const initialize = async () => {
        setLoading(true);
        setLoadingMessage('Loading');
        await fetchRatings();
        if (loggedIn)
            await fetchMyRating();
        setCurrentTerm(ratingTerms[currentRating - 1]);
        setLoading(false);
    }

    useEffect(() => {
        initialize();
    }, []);

    const calAvgRating = (ratings) => {
        if (!ratings || ratings.length === 0)
            return 0;

        let result = ratings.reduce((accumulator, current) => accumulator + current.score, 0);
        result = (result / ratings.length);
        result = Math.floor(result * 100) / 100;
        return result;
    }

    const onClickHandler = async (e) => {
        e.preventDefault();

        // api call here, submit rating
        setLoading(true);
        setLoadingMessage('Sending response')
        const response = await sendRating(mangaID, currentRating);
        setLoading(false);

        // set result popup details based on api call result
        if (response.status === 200) {
            setNotiDetails({
                success: true,
                message: "Rating accepted!",
                details: `You rated this manga ${currentRating}/5 ${currentRating > 1 ? "stars" : "star"} (${currentTerm})`
            });
        }
        else {
            setNotiDetails({
                success: false,
                message: "Failed to send rating!",
                details: response.message,
            });
        }

        setShowThis(false);
        setShowNoti(true);
        await fetchRatings();
        await fetchMyRating();
    }

    return (
        <>
            <div className={styles.toggleBTN} onClick={onOpen}>
                <StarRating ratings={ratings} />
            </div>

            {loading && loadingMessage === 'Sending response' ? (
                <Popup modal open={true} className="rating-popup">
                    <span className={styles.loading}>{loadingMessage}</span>
                </Popup>
            ) : (
                <>
                    <Popup
                        open={showThis} modal
                        onClose={() => setShowThis(false)}
                        closeOnDocumentClick
                        closeOnEscapse
                        lockScroll
                        className="rating-popup"
                    >
                        <form className={styles.ratingForm}>
                            <div>Rate</div>
                            <div>
                                <div className={styles.overallRating}>
                                    <span>Overall Rating:</span> <span className={styles.idkWhatToNameThis}>{calAvgRating(ratings)}<FaStar className={styles.activeStar} /></span><span className={styles['white-50-opac']}>({ratings.length.toLocaleString()} ratings)</span>
                                </div>
                                {myRating > 0 && (
                                    <div className={styles['white-50-opac']}>
                                        Your previous rating: {myRating}
                                    </div>
                                )}
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
                                                    onClick={() => {
                                                        setCurrentRating(currentRate);
                                                        setCurrentTerm(ratingTerms[index]);
                                                    }}
                                                />

                                                <FaStar className={currentRate <= currentRating ? styles.activeStar : styles.inactiveStar} />
                                            </label>
                                        )
                                    })}
                                </div>

                                <div className={styles.starInputDiv}>{currentTerm ? currentTerm : 'Pick a rating'}</div>
                            </div>
                            <div className={styles.btnContainer}>
                                <button
                                    disabled={currentRating === 0}
                                    onClick={(e) => onClickHandler(e)}
                                    className={styles.confirmBTN}
                                >
                                    Confirm
                                </button>
                                <button
                                    onClick={(e) => { e.preventDefault(); setShowThis(false); }}
                                    className={styles.cancelBTN}
                                >
                                    Cancel
                                </button>
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
            )}
        </>
    )
}
export default RatingPopup