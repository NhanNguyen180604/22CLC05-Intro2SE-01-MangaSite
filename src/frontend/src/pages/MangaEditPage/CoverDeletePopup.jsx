import Popup from "reactjs-popup";
import "./CoverDeletePopup.css";
import styles from "./CoverDeletePopup.module.css";

const CoverDeletePopup = ({ open, onClose, callback, loading }) => {
	return (
		<Popup
			open={open}
			onClose={onClose}
			modal
			lockScroll
			closeOnDocumentClick
			closeOnEscapse
			className='cover-delete-popup'
		>
			{loading ? <div className={styles.loadingMsg}>Deleting cover image</div> : (
				<div className={styles.coverDeleteContainer}>
					<div className={styles.message}>You are about to delete this cover image</div>
					<div className={styles.message}>This action cannot be undone</div>
					<div className={styles.btnContainer}>
						<button
							onClick={callback}
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
export default CoverDeletePopup;