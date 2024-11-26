import styles from "./ChapterList.module.css";
import { useState, useEffect } from 'react';
import { getChapterList } from "../../service/mangaService"
import Pagination from "../Pagination";

const ChapterList = ({ mangaID }) => {
    const [chapters, setChapters] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalChapters, setTotalChapters] = useState(0);
    const [showMore, setShowMore] = useState(false);
    const per_page = 2;

    const togglePagination = () => {
        setShowMore(!showMore);
    };

    useEffect(() => {
        const fetchData = async () => {
            const response = await getChapterList(mangaID, page, per_page);
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
                    <div>All {totalChapters} {totalChapters.length > 1 ? "Chapters" : "Chapter"}</div>

                    {!showMore ? (
                        <>
                            <div className={styles.chapterList}>
                                {chapters.length > 0 && (
                                    chapters.slice(0, 4).map(chapter => (
                                        <div key={chapter._id} className={styles.chapterContainer}>
                                            <div><b>{`Chapter #${chapter.number}`}</b></div>
                                            <div>{chapter.title}</div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className={styles.togglePagination}>
                                <button onClick={(e) => togglePagination()}>Load more</button>
                            </div>
                        </>
                    ) : (
                        <>
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

                            {totalPages > 1 &&
                                <Pagination currentPage={page} totalPages={totalPages} callback={setPage} />
                            }

                            <div className={styles.togglePagination}>
                                <button onClick={(e) => togglePagination()}>Show less</button>
                            </div>
                        </>
                    )}
                </>
            ) : (
                <>
                    <div>No Chapter</div>
                </>
            )}



        </div>
    )
}
export default ChapterList