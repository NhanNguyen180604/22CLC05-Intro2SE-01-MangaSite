import Popup from "reactjs-popup";
import './BlacklistWarningPopup.css';
import styles from './BlacklistWarningPopup.module.css';
import { FaCircleExclamation } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const BlacklistWarningPopup = ({ open, onClose }) => {
    const navigate = useNavigate();

    return (
        <Popup
            nested
            open={open}
            onClose={onClose}
            modal
            closeOnDocumentClick={false}
            closeOnEscapse={false}
            className='blacklist-warning-popup'
        >
            <div className={styles.notiContainer}>
                <div className={styles.failIcon}><FaCircleExclamation /></div>
                <div>This manga contains tags/authors in your blacklist</div>
                <div className={styles.btnContainer}>
                    <button
                        onClick={onClose}
                        className={styles.confirmBTN}
                    >
                        Continue
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className={styles.returnBTN}
                    >
                        Return
                    </button>
                </div>
            </div>
        </Popup>
    )
}
export default BlacklistWarningPopup