import styles from './EditChapterPage.module.css';

export const ActionBTNs = ({ me, reset, submit, showDeletePopup, myClassName = 'desktopDisplay', canSubmit }) => {
    return (
        <div className={`${styles.actionBTNs} ${styles[myClassName]}`}>
            {me.accountType !== 'admin' && (
                <>
                    <button
                        className={styles.blueBTN}
                        onClick={submit}
                        disabled={!canSubmit()}
                    >
                        Update Chapter
                    </button>

                    <button className={styles.discardBTN} onClick={reset}>
                        Reset
                    </button>
                </>
            )}

            <button className={styles.deleteBTN} onClick={showDeletePopup}>
                Delete this Chapter
            </button>
        </div>
    );
};
