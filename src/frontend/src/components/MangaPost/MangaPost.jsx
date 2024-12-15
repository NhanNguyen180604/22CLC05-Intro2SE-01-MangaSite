import { useNavigate } from "react-router-dom";
import styles from './MangaPost.module.css'

function MangaPost({_id, name, cover, authors}) {
	const navigate = useNavigate();
	const mangaClickHandler = () => {
		navigate(`/mangas/${_id}`, );
	};

    return (
        <div className={styles.wrapper}>
            <img
                className={styles.cover}
                src={cover}
                onClick={mangaClickHandler}
            />
            <div className={styles.content}>
                <div className={styles.title}>{name}</div>
                <div className={styles.authors}>
                    {/* {authors.map(author => author.name).join(', ')} */}
                    {JSON.stringify(authors)}
                </div>
            </div>
        </div>
    );
}

export default MangaPost
