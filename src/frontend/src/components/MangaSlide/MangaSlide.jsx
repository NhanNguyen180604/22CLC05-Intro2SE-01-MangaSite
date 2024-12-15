import MangaPost from "../MangaPost";
import styles from "./MangaSlide.module.css"

// temporary component for homepage, fix this if you need to, or just delete it
const MangaCarousel = (props) => {
	return (
		<div className={styles.mainContainer}>
			<div className={styles.mangaListTitle}>{props.title}</div>
			<div className={styles.mangaListContainer}>
				{props.mangas && props.mangas.length ? (
					props.mangas.map(manga => (
						<MangaPost key={manga._id} manga={manga} />
					))
				) : (
					<div>Nothing here</div>
				)}
			</div>
		</div>
	)
}
export default MangaCarousel
