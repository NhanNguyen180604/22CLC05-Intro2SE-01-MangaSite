import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { getMangaByID, getChapterList } from "../../service/mangaService";
import { getMe } from "../../service/userService.js"
import { useParams } from "react-router-dom"
import { FaGear } from "react-icons/fa6"
import { FaCommentSlash } from "react-icons/fa";
import styles from './MangaPage.module.css'
import TabComponents from "../../components/Tab"
const { Tab, TabPanel } = TabComponents;
import ChapterList from "../../components/ChapterList"
import CoverGallery from "../../components/CoverGallery"
import DesktopLogo from "../../components/main/DesktopLogo.jsx"
import DesktopNavigationBar from "../../components/main/DesktopNavigationBar.jsx"
import MainLayout from "../../components/main/MainLayout.jsx"
import MobileNavigationBar from "../../components/main/MobileNavigationBar.jsx"
import SearchBox from "../../components/search/SearchBox.jsx"
import RatingPopup from "../../components/RatingPopup"
import LibraryPopup from "../../components/LibraryPopup"
import ReportPopup from "../../components/ReportPopup"
import CommentPopup from "../../components/CommentPopup"

const MangaPage = () => {
	const { id } = useParams();
	const [loading, setLoading] = useState(true);

	const [me, setMe] = useState({
		avatar: '',
		accountType: 'user',
		email: '',
		name: '',
		_id: '',
		loggedIn: false,
	});
	const [manga, setManga] = useState({
		_id: '',
		name: '',
		authors: [],
		categories: [],
		canComment: false,
		cover: '',
		description: '',
		overallRating: 0,
		status: '',
		uploader: null,
	});
	const [firstChapter, setFirstChapter] = useState(-1);

	const navigate = useNavigate();

	useEffect(() => {
		setLoading(true);
		const fetchData = async () => {
			const response = await getMangaByID(id);
			if (response.status === 200) {
				setManga(response.manga);

				const chapterResponse = await getChapterList(id, 1, 1);
				if (chapterResponse.status === 200 && chapterResponse.chaptersInfo.chapters.length) {
					setFirstChapter(chapterResponse.chaptersInfo.chapters[0].number);
				}
			}
			else {
				console.log(response.message);
			}

			const getMeResponse = await getMe();
			if (getMeResponse)
				setMe(getMeResponse);

			setLoading(false);
		}

		fetchData()
	}, []);

	return (
		<MainLayout>
			<header className="flex w-full flex-row items-center justify-between">
				<DesktopLogo />
				<div className="flex w-full flex-row items-center gap-8 lg:w-fit">
					<SearchBox />
					<DesktopNavigationBar />
				</div>
			</header>

			{loading ? <MangaPageLoading /> : (
				<div className={styles.mainContainer}>
					<div className={styles.leftColumnContainer}>
						<img src={manga.cover} className={styles.coverImg} />

						<Details manga={manga} mobile={true} />

						<div className={styles.mobileDisplay}>
							<RatingPopup mangaID={id} loggedIn={me.loggedIn} />
						</div>

						<div className={`${styles.synopsis} ${styles.mobileDisplay}`}>
							{manga.description.split('\n').map((paragraph, index) => (
								<div key={index}>{paragraph}</div>
							))}
						</div>

						<div className={`${styles.actionBTNsContainer} ${styles['flex-margin-bot-20']}`}>
							<span><LibraryPopup title={manga.name} loggedIn={me.loggedIn} /></span>
							<span><ReportPopup reportField='manga' reportedId={id} loggedIn={me.loggedIn} /></span>
							{manga.canComment ? (
								<span><CommentPopup loggedIn={me.loggedIn} /></span>
							) : (
								<span className={styles.disabledBTN}><FaCommentSlash /></span>
							)}
							{manga.uploader?._id === me?._id &&
								<span
									className={styles.editBTN}
									onClick={() => navigate(`/mangas/${id}/edit`)}
								>
									<FaGear />
								</span>
							}
						</div>

						<div className={`${styles['flex-margin-bot-20']} ${styles.genreList}`}>
							{manga.categories && manga.categories.length > 0 && (
								manga.categories.map(category => (
									// onclick filter search by this category
									<button
										key={category._id}
										onClick={() => navigate(`/search?includeCategories=${category._id}`)}
									>
										{category.name}
									</button>
								))
							)}
						</div>

						{/* on click, redirect to the latest page in reading history, or chapter 1 if is guest */}
						<button
							onClick={() => navigate(`/mangas/${id}/chapters/${firstChapter}`)}
							className={styles.startReadingBTN}
							disabled={firstChapter === -1}
						>
							Start Reading
						</button>
					</div>
					<div className={styles.rightColumnContainer}>
						<div className={styles.detailsContainer}>
							<Details manga={manga} />

							<div className={styles.desktopDisplay}>
								<RatingPopup mangaID={id} loggedIn={me.loggedIn} />
							</div>

							<div className={`${styles.synopsis} ${styles.desktopDisplay}`}>
								{manga.description.split('\n').map((paragraph, index) => (
									<div key={index}>{paragraph}</div>
								))}
							</div>
						</div>

						<Tab>
							<TabPanel title='Chapters'>
								<ChapterList mangaID={id} />
							</TabPanel>
							<TabPanel title='Art'>
								<CoverGallery id={id} />
							</TabPanel>
						</Tab>

					</div>
				</div>
			)
			}

			<footer>
				<MobileNavigationBar />
			</footer>
		</MainLayout >
	)
}

const Details = ({ manga, mobile = false }) => {
	return (
		<div className={mobile ? styles.mobileDisplay : styles.desktopDisplay}>
			<div className={styles.details}>
				<h1 className={styles.mangaTitle}>{manga.name}</h1>
				<div className={`${styles.authorName} ${styles.hoverableName}`}>
					{manga.authors &&
						manga.authors.map((author, index) => (
							// onclick filter search by this author
							<Link
								key={author._id}
								to={`/search?includeAuthors=${author._id}`}
							>
								{author.name}
								{index < manga.authors.length - 1 && ',\u00A0'}
							</Link>
						))
					}
				</div>
				<div>Status: {manga.status}</div>
				<div>Upload by: {'\u00A0'}
					<Link to={`/user/${manga.uploader?._id}`}
						className={styles.hoverableName}
					>
						{manga.uploader?.name}
					</Link>
				</div>
			</div>
		</div>
	);
}

const MangaPageLoading = () => {
	return <div>Loading</div>
}

export default MangaPage