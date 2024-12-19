import Popup from "reactjs-popup";
import './CoverViewPopup.css';
import styles from './CoverViewPopup.module.css';

const CoverViewPopup = ({ image }) => {
    return (
        <Popup
            modal
            trigger={
                <img src={image} className={styles.preview} />
            }
            className="cover-view-popup"
        >
            <img src={image} className={styles.imgFluid} />
        </Popup>
    )
}
export default CoverViewPopup