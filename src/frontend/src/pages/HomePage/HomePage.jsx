import { getMangas } from "../../api/mangaService"
import { useEffect, useState } from "react"
import MangaSlide from "../../components/MangaSlide";
import styles from './HomePage.module.css';

// temporary page, whoever does the homepage fix this
const HomePage = () => {
	const [mangas, setMangas] = useState([]);
	useEffect(() => {
		const fetchData = async () => {
			const response = await getMangas(1, 20);
			if (response.status === 200) {
				setMangas(response.mangas.mangas);
			}
		}

		fetchData();
	}, [])

	return (
		<>
			<MangaSlide title="Trending" mangas={mangas} />
			<MangaSlide title="Top rated" mangas={mangas} />
		</>
	)
}
export default HomePage