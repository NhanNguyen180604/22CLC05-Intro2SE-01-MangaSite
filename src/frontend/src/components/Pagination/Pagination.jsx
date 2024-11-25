import { useEffect, useState } from "react"
import styles from './Pagination.module.css';

const Pagination = ({ currentPage, totalPages, callback }) => {
    const [page, setPage] = useState(1);
    useEffect(() => {
        setPage(currentPage);
    }, []);

    const loadPage = (new_page) => {
        if (new_page === page || new_page > totalPages || new_page === 0)
            return;

        setPage(new_page);
        callback(new_page);
    };

    return (
        <div className={styles.paginationContainer}>
            <button
                disabled={page === 1}
                onClick={() => { loadPage(page - 1) }}
            >
                Previous
            </button>

            {[...Array(totalPages)].map((_, index) => (
                <button
                    key={`page-${index + 1}`}
                    disabled={page === index + 1}
                    onClick={() => { loadPage(index + 1) }}
                >
                    {index + 1}
                </button>
            ))}

            <button
                disabled={page === totalPages}
                onClick={() => { loadPage(page + 1) }}
            >
                Next
            </button>
        </div>
    )
}
export default Pagination