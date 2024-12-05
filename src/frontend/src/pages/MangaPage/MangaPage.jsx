import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { getMangaByID, getRatings, getChapterList } from "../../service/mangaService"
import { useParams } from "react-router-dom"
import { FaFlag, FaCommentAlt, FaBookmark } from "react-icons/fa"
import { FaGear } from "react-icons/fa6"
import styles from './MangaPage.module.css'
import TabComponents from "../../components/Tab"
const { Tab, TabPanel } = TabComponents;
import ChapterList from "../../components/ChapterList"
import CoverGallery from "../../components/CoverGallery"
import LibraryForm from "../../components/LibraryForm"
import ReportForm from "../../components/ReportForm"
import CommentForm from "../../components/CommentForm"
import StarRating from "../../components/StarRating"
import RatingForm from "../../components/RatingForm"
import NotificationForm from "../../components/NotificationForm"
import DesktopLogo from "../../components/main/DesktopLogo.jsx"
import DesktopNavigationBar from "../../components/main/DesktopNavigationBar.jsx"
import MainLayout from "../../components/main/MainLayout.jsx"
import MobileNavigationBar from "../../components/main/MobileNavigationBar.jsx"

const MangaPage = () => {
	const { id } = useParams();

	const [manga, setManga] = useState({});
	const [firstChapter, setFirstChapter] = useState(0);

	const [showLibaryForm, setShowLibraryForm] = useState(false);

	const [showReportForm, setShowReportForm] = useState(false);

	const [showCommentForm, setShowCommentForm] = useState(false);

	const [ratings, setRatings] = useState([]);
	const [showRatingForm, setShowRatingForm] = useState(false);

	const [showNotiForm, setShowNotiForm] = useState(false);
	const [notiFormDetails, setNotiFormDetails] = useState({
		success: false,
		message: '',
		details: '',
	});

	const [showMore, setShowMore] = useState(false);

	const navigate = useNavigate();

	const togglePopup = (setCallback, attribute) => {
		setCallback(!attribute);
		if (!attribute)
			document.body.classList.add(`${styles.noScroll}`);
		else document.body.classList.remove(`${styles.noScroll}`);
	}

	const handlePopupClick = (id, setCallback, attribute) => {
		if (id === 'popupContainer') {
			togglePopup(setCallback, attribute);
		}
	}

	useEffect(() => {
		const fetchData = async () => {
			const response = await getMangaByID(id);
			if (response.status === 200) {
				setManga(response.manga);

				const ratingResponse = await getRatings(id);
				if (ratingResponse.status === 200) {
					setRatings(ratingResponse.ratings);
				}
				else {
					console.log("Couldn't get ratings");
				}

				const chapterResponse = await getChapterList(id, 1, 1);
				if (chapterResponse.status === 200) {
					setFirstChapter(chapterResponse.chaptersInfo.chapters[0].number);
				}
				else {
					setFirstChapter(1);  //pray this number is correct
				}
			}
			else {
				console.log(response.message);
			}
		}

		fetchData()
	}, []);

	return (
		<MainLayout>
			<header className="flex w-full flex-row items-center justify-between">
				<DesktopLogo />
				<div className="flex w-full flex-row items-center gap-8 lg:w-fit">
					<DesktopNavigationBar />
				</div>
			</header>

			<div className={styles.mainContainer}>
				<div className={styles.leftColumnContainer}>
					<img src={manga.cover} />

					<div className={styles.actionBTNsContainer}>
						<FaBookmark onClick={() => togglePopup(setShowLibraryForm, showLibaryForm)}/>
						<FaFlag onClick={() => togglePopup(setShowReportForm, showReportForm)} />
						<FaCommentAlt onClick={() => togglePopup(setShowCommentForm, showCommentForm)} />
						<FaGear />
					</div>

					<div>
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
						onClick={(e) => navigate(`/mangas/${id}/chapters/${firstChapter}`)}
						className={styles.startReadingBTN}
					>
						Start Reading
					</button>
				</div>
				<div className={styles.rightColumnContainer}>
					<div className={styles.details}>
						<div>
							<h1>{manga.name}</h1>
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

						<div onClick={() => togglePopup(setShowRatingForm, showRatingForm)} className={styles.rating}>
							<StarRating ratings={ratings} />
						</div>

						<div className={`${styles.synopsis}`}>
							{manga.description}
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

				{showReportForm && <div className={styles.popupContainer}
					onClick={(e) => handlePopupClick(e.target.id, setShowReportForm, showReportForm)}
					id="popupContainer">
					<ReportForm
						setShowThis={setShowReportForm}
						setNotiFormDetails={setNotiFormDetails}
						setShowNotiForm={setShowNotiForm}
					/>
				</div>}

				{showRatingForm && <div className={styles.popupContainer}
					onClick={(e) => handlePopupClick(e.target.id, setShowRatingForm, showRatingForm)}
					id="popupContainer">
					<RatingForm
						ratings={ratings}
						setShowThis={setShowRatingForm}
						setNotiFormDetails={setNotiFormDetails}
						setShowNotiForm={setShowNotiForm}
					/>
				</div>}

				{showNotiForm && <div className={styles.popupContainer}
					onClick={(e) => handlePopupClick(e.target.id, setShowNotiForm, showNotiForm)}
					id="popupContainer">
					<NotificationForm
						message={notiFormDetails.message}
						details={notiFormDetails.details}
						success={notiFormDetails.success}
					/>
				</div>}

				{showCommentForm && <div className={styles.popupContainer}
					onClick={(e) => handlePopupClick(e.target.id, setShowCommentForm, showCommentForm)}
					id="popupContainer">
					<CommentForm
						setShowThis={setShowCommentForm}
						setNotiFormDetails={setNotiFormDetails}
						setShowNotiForm={setShowNotiForm}
					/>
				</div>}

				{showLibaryForm && <div className={styles.popupContainer}
					onClick={(e) => handlePopupClick(e.target.id, setShowLibraryForm, showLibaryForm)}
					id="popupContainer">
					<LibraryForm
						title={manga.name}
						setShowThis={setShowLibraryForm}
						setNotiFormDetails={setNotiFormDetails}
						setShowNotiForm={setShowNotiForm}
					/>
				</div>}
			</div>



			<footer>
				<MobileNavigationBar />
			</footer>
		</MainLayout>
	)
}
export default MangaPage