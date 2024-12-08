import Popup from "reactjs-popup"
import './NotiPopup.css'
import styles from './NotiPopup.module.css'
import { FaCheckCircle } from "react-icons/fa"
import { FaCircleExclamation } from "react-icons/fa6"

const NotiPopup = ({ open, onClose, success, message, details }) => {
    return (
        <Popup
            nested
            open={open}
            onClose={onClose}
            modal
            lockScroll
            closeOnDocumentClick
            closeOnEscapse
            className='noti-popup'
        >
            <div className={styles.notiContainer}>
                {success ? (
                    <div className={styles.successIcon}><FaCheckCircle /></div>
                ) : (
                    <div className={styles.failIcon}><FaCircleExclamation /></div>
                )}
                <div>{message}</div>
                <div>{details}</div>
                <button
                    onClick={onClose}
                    className={styles.confirmBTN}
                >
                    Confirm
                </button>
            </div>
        </Popup>
    )
}
export default NotiPopup