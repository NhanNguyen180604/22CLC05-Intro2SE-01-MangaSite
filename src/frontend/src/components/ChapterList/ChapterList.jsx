import styles from "./ChapterList.module.css";
import { useState, useEffect } from 'react';
import { getChapterList } from "../../service/mangaService.js"
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa'

const ChapterList = ({ mangaID }) => {
    const [chapters, setChapters] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalChapters, setTotalChapters] = useState(0);
    const perPage = 4;

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
                                    <div key={chapter._id} className={styles.chapterContainer}>
                                        <div><b>{`Chapter #${chapter.number}`}</b></div>
                                        <div>{chapter.title}</div>
                                    </div>
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

    const loadPage = (new_page) => {
        if (new_page === currentPage || new_page > totalPages || new_page === 0)
            return;

        callback(new_page);
    };

    return (
        <>
            <div className={styles.paginationContainer}>
                {/* change page buttons */}

                <button onClick={() => loadPage(currentPage - 1)}>
                    <FaAngleLeft />
                </button>

                <div>
                    {[...Array(totalPages)].map((_, index) => (
                        <label
                            key={`page-button-${index + 1}`}
                            className={(index + 1) === currentPage ? styles.activeLabel : ""}
                        >
                            <input
                                type="radio"
                                name="page-button"
                                defaultChecked={index + 1 === currentPage}
                                onClick={() => loadPage(index + 1)}
                            />
                            {`${index * perPage + 1} - ${Math.min((index + 1) * perPage, total)}`}
                        </label>
                    ))}
                </div>

                <button onClick={() => loadPage(currentPage + 1)}>
                    <FaAngleRight />
                </button>
            </div>

            {children}
        </>

    )
}

export default ChapterList