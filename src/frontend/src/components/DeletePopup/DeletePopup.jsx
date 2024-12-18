import Popup from "reactjs-popup";
import "./DeletePopup.css";
import styles from "./DeletePopup.module.css";

const DeletePopup = ({ open, onClose, callback, loading, message }) => {
	return (
		<Popup
			open={open}
			onClose={onClose}
			modal
			closeOnDocumentClick={!loading}
			closeOnEscapse={!loading}
			className='delete-popup'
		>
			{loading ? <div className={styles.loadingMsg}>Deleting...</div> : (
				<div className={styles.coverDeleteContainer}>
					<div className={styles.message}>{message}</div>
					<div className={styles.message}>This action cannot be undone</div>
					<div className={styles.btnContainer}>
						<button
							onClick={(e) => {
								e.preventDefault();
								callback();
							}}
							className={styles.confirmBTN}
						>
							Confirm
						</button>

						<button
							onClick={(e) => { e.preventDefault(); onClose(); }}
							className={styles.cancelBTN}
						>
							Cancel
						</button>
					</div>
				</div>
			)}
		</Popup>
	);
}
export default DeletePopup;