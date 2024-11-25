import styles from "./StarRating.module.css";

const StarRating = ({ ratings }) => {
    const calAvgRating = (ratings) => {
        if (ratings.length === 0){
            return 0;
        }
        
        let result = ratings.reduce((accumulator, current) => accumulator + current.score, 0);
        result = Math.ceil(((result / ratings.length) / 5 * 100));
        return result;
    }

    return (
        <div className={styles.container}>
            {/* https://stackoverflow.com/questions/49343074/css-for-star-ratings-via-fontawesome */}
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css" rel="stylesheet" />
            <span className={styles.score}>
                <div className={styles.scoreWrap}>
                    <span className={styles.starsActive} style={{ width: `${calAvgRating(ratings)}%` }}>
                        <i className="fa fa-star" aria-hidden="true"></i>
                        <i className="fa fa-star" aria-hidden="true"></i>
                        <i className="fa fa-star" aria-hidden="true"></i>
                        <i className="fa fa-star" aria-hidden="true"></i>
                        <i className="fa fa-star" aria-hidden="true"></i>
                    </span>
                    <span className={styles.starsInactive}>
                        <i className="fa fa-star-o" aria-hidden="true"></i>
                        <i className="fa fa-star-o" aria-hidden="true"></i>
                        <i className="fa fa-star-o" aria-hidden="true"></i>
                        <i className="fa fa-star-o" aria-hidden="true"></i>
                        <i className="fa fa-star-o" aria-hidden="true"></i>
                    </span>
                </div >
            </span >
            <div className={styles.ratingCount}>({ratings.length.toLocaleString()})</div>
        </div>
    )
}
export default StarRating