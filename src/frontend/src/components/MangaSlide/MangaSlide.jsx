import MangaPost from "../MangaPost";
import styles from "./MangaSlide.module.css"
import { Swiper, SwiperSlide } from "swiper/react";
import 'swiper/css';
import { Pagination, Mousewheel, Autoplay } from "swiper/modules";
import 'swiper/css/pagination';
import './mySwiper.css'

const MangaSlide = ({ title, mangas }) => {
	return (
		<div className={styles.mainContainer}>
			<div className={styles.mangaListTitle}>{title}</div>
			{mangas.length ? (
				<Swiper
					direction="horizontal"
					spaceBetween={20}
					slidesPerView={3}
					pagination={{
						clickable: true,
					}}
					mousewheel={{
						enabled: true,
						forceToAxis: true,
					}}
					autoplay={{
						delay: 5000,
						pauseOnMouseEnter: true,
					}}
					modules={[Pagination, Mousewheel, Autoplay]}
					loop={mangas.length > 3}
				>
					{mangas.map(manga => (
						<SwiperSlide key={manga._id}>
							<MangaPost manga={manga} />
						</SwiperSlide>
					))}
				</Swiper>
			) : (
				<div>Nothing here</div>
			)}
		</div>
	)
}
export default MangaSlide
