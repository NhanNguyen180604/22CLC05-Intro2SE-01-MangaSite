import styles from './Notification.module.css';
import { FaCheckCircle } from "react-icons/fa"
import { FaCircleExclamation } from "react-icons/fa6"

const NotificationForm = ({ message, details, success }) => {
    return (
        <div className={styles.notiContainer}>
            {success ? <div style={{ color: "#a1f77c" }}><FaCheckCircle /></div> : <div style={{ color: "#dd6260" }}><FaCircleExclamation /></div>}
            <div>{message}</div>
            <div>{details}</div>
        </div>
    )
}
export default NotificationForm