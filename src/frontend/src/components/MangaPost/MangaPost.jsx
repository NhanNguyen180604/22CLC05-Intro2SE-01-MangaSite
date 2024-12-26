import { useNavigate } from "react-router-dom";
import styles from './MangaPost.module.css'

function MangaPost({ manga }) {
    const { _id, name, cover, authors, categories } = manga
    const navigate = useNavigate();
    const mangaClickHandler = () => {
        navigate(`/mangas/${_id}`,);
    };

    return (
        <div
            className={styles.wrapper}
            onClick={mangaClickHandler}
        >
            <img
                className={styles.cover}
                src={cover}
            />
            <div className={styles.content}>
                <div className={styles.title}>{name}</div>
                <div className={styles.authors}>
                    {authors.map(author => author.name).join(', ')}
                </div>
                <div className={styles.categories}>
                    {categories.map(category => (
                        <span className={styles.category} key={category._id}>{category.name}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default MangaPost
