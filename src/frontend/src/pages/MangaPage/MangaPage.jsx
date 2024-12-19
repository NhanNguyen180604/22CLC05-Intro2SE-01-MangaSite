import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { getMangaByID, getChapterList, getReadingHistory } from "../../service/mangaService";
import { getMe, getBlacklist } from "../../service/userService.js"
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
import MangaPageLayoutComponents from "../../components/MangaPageLayout"
const { MangaPageLayout, LeftColumnContainer, RightColumnContainer } = MangaPageLayoutComponents;
import MobileNavigationBar from "../../components/main/MobileNavigationBar.jsx"
import SearchBox from "../../components/search/SearchBox.jsx"
import RatingPopup from "../../components/RatingPopup"
import LibraryPopup from "../../components/LibraryPopup"
import ReportPopup from "../../components/ReportPopup"
import CommentPopup from "../../components/CommentPopup"
import BlacklistWarningPopup from "../../components/BlacklistWarningPopup";

const MangaPage = () => {
	const { id } = useParams();
	const [loading, setLoading] = useState(true);
	const [showWarning, setShowWarning] = useState(false);

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
	const [history, setHistory] = useState({
		_id: '',
		user: '',
		chapters: [],
	});

	const navigate = useNavigate();

	const fetchData = async () => {
		setLoading(true);

		const getMeResponse = await getMe();
		if (getMeResponse) {
			setMe(getMeResponse);
		}

		const response = await getMangaByID(id);

		if (response.status === 200) {
			setManga(response.manga);

			const chapterListResponse = await getChapterList(id, 1, 1, true);
			let tempChapterList = chapterListResponse.chaptersInfo.chapters;
			if (chapterListResponse.status === 200 && tempChapterList.length) {
				setFirstChapter(tempChapterList[0].number);
			}

			if (getMeResponse) {
				// get reading history of user if logged in
				const historyResponse = await getReadingHistory(id);
				if (historyResponse.status === 200 && historyResponse.history) {
					const fetchedHistory = historyResponse.history;
					setHistory(fetchedHistory);
					if (fetchedHistory.chapters.length) {
						const tempChapter = tempChapterList.find(element => element._id === fetchedHistory.chapters[fetchedHistory.chapters.length - 1]);
						if (tempChapter)
							setFirstChapter(tempChapter.number);
					}
				}

				// get blacklist of user if logged in
				const blacklist = await getBlacklist();
				if (blacklist) {
					// check if this manga has categories/authors in the blacklist
					if (
						blacklist.authors.some(author => response.manga.authors.some(mangaAuthor => mangaAuthor._id === author._id)) ||
						blacklist.categories.some(category => response.manga.categories.some(mangaCategory => mangaCategory._id === category._id))
					) {
						setShowWarning(true);
					}
				}
			}
		}
		else if (response.status === 404) {
			navigate('/404');
		}
		else {
			setNotiDetails({
				success: false,
				message: "Something went wrong, please try again",
				details: response.message,
			});
			setShowNoti(true);
		}

		setLoading(false);
	}

	useEffect(() => {
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
				<MangaPageLayout>
					<LeftColumnContainer>
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
							{(manga.uploader?._id === me?._id || me.accountType === 'admin') &&
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
							{history.chapters.length ? `Continue at chapter #${firstChapter}` : 'Start Reading'}
						</button>
					</LeftColumnContainer>

					<RightColumnContainer>
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
								<ChapterList mangaID={id} history={history} />
							</TabPanel>
							<TabPanel title='Art'>
								<CoverGallery id={id} />
							</TabPanel>
						</Tab>
					</RightColumnContainer>

					<BlacklistWarningPopup open={showWarning} onClose={() => setShowWarning(false)} />
				</MangaPageLayout>
			)}

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
				<div className={`${styles.authorName}`}>
					{manga.authors &&
						manga.authors.map((author, index) => (
							// onclick filter search by this author
							<Link
								className={styles.hoverableName}
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
	return <div className={styles.loadingContainer}>Loading</div>
}

export default MangaPage