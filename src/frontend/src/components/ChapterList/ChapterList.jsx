import styles from "./ChapterList.module.css";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from 'react';
import { getChapterList, getReadingHistory } from "../../service/mangaService.js"
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa'

const ChapterList = ({ mangaID }) => {
    const [chapters, setChapters] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalChapters, setTotalChapters] = useState(0);
    const perPage = 4;
    const [history, setHistory] = useState({
        _id: '',
        user: '',
        chapters: [],
    });

    useEffect(() => {
        const fetchData = async () => {
            const response = await getChapterList(mangaID, page, perPage);
            if (response.status === 200) {
                setChapters(response.chaptersInfo.chapters);
                setPage(response.chaptersInfo.page);
                setTotalPages(response.chaptersInfo.total_pages);
                setTotalChapters(response.chaptersInfo.total);
            }
            else {
                console.log("Couldn't get chapter list");
                console.log(response);
            }

            const historyResponse = await getReadingHistory(mangaID);
            if (historyResponse.status === 200) {
                setHistory(historyResponse.history);
            }
            else {
                // console.log("Couldn't fetch reading history");
                // console.log(historyResponse);
            }
        };

        fetchData();
    }, [page]);

    return (
        <div className={styles.chapterListContainer}>
            {chapters.length > 0 ? (
                <>
                    <div>All {totalChapters} {totalChapters > 1 ? "Chapters" : "Chapter"}</div>
                    <Pagination currentPage={page} perPage={perPage} totalPages={totalPages} total={totalChapters} callback={setPage}>
                        <div className={styles.chapterList}>
                            {chapters.length > 0 && (
                                chapters.map(chapter => (
                                    <Link
                                        key={chapter._id}
                                        className={`${styles.chapterContainer} ${!history.chapters?.includes(chapter._id) ? '' : styles.readLabel}`}
                                        to={`/mangas/${mangaID}/chapters/${chapter.number}`}
                                    >
                                        <div><b>{`Chapter #${chapter.number}`}</b></div>
                                        <div>{chapter.title}</div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </Pagination>
                </>
            ) : (
                <>
                    <div>No Chapter</div>
                </>
            )}
        </div>
    )
}

const Pagination = ({ currentPage, perPage, totalPages, total, callback, children }) => {
    const pageRefs = useRef([]);

    const loadPage = (new_page) => {
        if (new_page === currentPage || new_page > totalPages || new_page === 0)
            return;

        callback(new_page);
    };

    const scrollToPage = (page) => {
        if (pageRefs.current[page - 1]) {
            pageRefs.current[page - 1].scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            });
            loadPage(page);
        }
    };

    return (
        <>
            <div className={styles.paginationContainer}>
                {/* change page buttons */}

                <button onClick={() => scrollToPage(currentPage - 1)}>
                    <FaAngleLeft />
                </button>

                <div>
                    {[...Array(totalPages)].map((_, index) => (
                        <label
                            key={`page-button-${index + 1}`}
                            className={(index + 1) === currentPage ? styles.activeLabel : ""}
                            ref={(el) => (pageRefs.current[index] = el)}
                        >
                            <input
                                type="radio"
                                name="page-button"
                                defaultChecked={index + 1 === currentPage}
                                onClick={() => scrollToPage(index + 1)}
                            />
                            {`${index * perPage + 1} - ${Math.min((index + 1) * perPage, total)}`}
                        </label>
                    ))}
                </div>

                <button onClick={() => scrollToPage(currentPage + 1)}>
                    <FaAngleRight />
                </button>
            </div>

            {children}
        </>
    )
}

export default ChapterList