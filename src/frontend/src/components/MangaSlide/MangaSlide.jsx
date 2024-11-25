import styles from "./MangaSlide.module.css"
import { useNavigate } from "react-router-dom";

// temporary component for homepage, fix this if you need to, or just delete it
const MangaCarousel = (props) => {
	const navigate = useNavigate();
	const mangaClickHandler = (id) => {
		navigate(`/mangas/${id}`, );
	};

	return (
		<>
			<div className={styles.mainContainer}>
				<div className={styles.mangaListTitle}>{props.title}</div>
				<ul className={styles.mangaListContainer}>
					{props.mangas && props.mangas.length ? (
						props.mangas.map(manga => (
							<li key={manga._id} onClick={() => mangaClickHandler(manga._id)}>
								<img src={manga.cover} />
								<div>{manga.name}</div>
							</li>
						))
					) : (
						<div>Nothing here</div>
					)}
				</ul>
			</div>
		</>
	)
}
export default MangaCarousel