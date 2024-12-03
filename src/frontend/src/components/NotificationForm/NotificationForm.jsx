import styles from './Notification.module.css';
import { FaCheckCircle } from "react-icons/fa"
import { FaCircleExclamation } from "react-icons/fa6"

const NotificationForm = ({ message, details, success }) => {
    return (
        <div className={styles.notiContainer}>
            {success ? (
                <div className={styles.successIcon}><FaCheckCircle /></div>
            ) : (
                <div className={styles.failIcon}><FaCircleExclamation /></div>
            )}
            <div>{message}</div>
            <div>{details}</div>
        </div>
    )
}
export default NotificationForm