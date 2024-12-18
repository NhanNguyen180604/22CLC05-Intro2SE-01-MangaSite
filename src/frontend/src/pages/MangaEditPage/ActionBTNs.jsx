import styles from "./MangaEditPage.module.css";

export const ActionBTNs = ({ me, reset, submit, myClassName = 'desktopDisplay', navigate, mangaID, canSave, showDeleteMangaPopup }) => {
    return (
        <div className={`${styles.actionBTNs} ${styles[myClassName]}`}>
            {me.accountType !== 'admin' && (
                <button
                    className={styles.blueBTN}
                    onClick={(e) => submit(e)}
                    disabled={!canSave()}
                >
                    Save changes
                </button>
            )}

            <button
                className={styles.blueBTN}
                onClick={(e) => {
                    e.preventDefault();
                    navigate(`/mangas/${mangaID}/chapters/edit`);
                }}
            >
                Go to Chapters
            </button>

            {me.accountType !== 'admin' && (
                <button className={styles.discardBTN} onClick={reset}>
                    Discard changes
                </button>
            )}

            <button
                className={styles.deleteBTN}
                onClick={showDeleteMangaPopup}
            >
                Delete this manga
            </button>
        </div>
    );
};
