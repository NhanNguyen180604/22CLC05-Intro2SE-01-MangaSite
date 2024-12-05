import styles from "./CommentForm.module.css"
import { useState, useEffect } from "react";
import { getMangaComments, getChapterComments } from "../../service/mangaService.js";
import { useParams } from "react-router-dom";
import { FaXmark } from "react-icons/fa6";

function CommentForm({ setShowThis, setNotiFormDetails, setShowNotiForm }) {
    const { id, chapterNumber } = useParams();

    const [comments, setComments] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const perPage = 2;

    const [isInputFilled, setIsInputFilled] = useState(false);

    const checkIfInputFilled = (e) => {
        const { value } = e.target;
        const hasText = value.trim().length > 0;
        setIsInputFilled(hasText);
    };

    const formatDate = (date) => {
        const localDate = new Date(date);
        return localDate.toLocaleString();
    };

    // load the next comment page
    const loadMore = (event) => {
        event.preventDefault();
        setPage(prev => prev + 1);
    }

    const fetchData = async (page = 1, per_page = 20) => {
        const response = !chapterNumber ? await getMangaComments(id, page, per_page) : await getChapterComments(id, chapterNumber, page, per_page);
        if (response.status === 200) {
            setTotalPages(response.comments.total_pages);

            const fetchedComments = response.comments.comments;
            // group reply comments
            let nonReplyingComments = fetchedComments.filter(comment => !comment.replyTo);
            nonReplyingComments = nonReplyingComments.map(comment => {
                const replyingComments = fetchedComments.filter(other_comment => other_comment.replyTo === comment._id);
                if (replyingComments.length)
                    comment.replies = replyingComments;
                return comment;
            });

            const newComments = nonReplyingComments.sort((a, b) => {
                return (new Date(b.createdAt)).getTime() - (new Date(a.createdAt)).getTime()
            });

            setComments(prev => [...prev, ...newComments]);
        }
    };

    // strict mode will make call this twice so it not a bug
    useEffect(() => {
        fetchData(page, perPage);
    }, [page]);

    const onSubmit = (e) => {
        e.preventDefault();

        // API call here


        // set result popup details based on api call result
        if (true) {
            setNotiFormDetails({
                success: true,
                message: "Successfully post comment!",
                details: ``
            });
        }
        else {
            setNotiFormDetails({
                success: false,
                message: "What fails (failed to send? not logged in?)",
                details: "Reason why failed"
            });
        }

        // show result popup
        setShowThis(false);
        setShowNotiForm(true);
    }

    return (
        <form className={styles.commentForm}>
            <div className={styles.formTitle}>
                <div>Comments</div>
                <button
                    onClick={() => {
                        setShowThis(false);
                        document.body.classList.remove(`noScrollY`);
                    }}
                >
                    <FaXmark />
                </button>
            </div>
            <div className={styles.commentList}>
                {comments.length ? comments.map((comment, index) => (
                    <div key={`comment-${index + 1}`}>
                        <div className={styles.commentContainer}>
                            <div className={styles.userInfo}>
                                <img src={comment.user.avatar.url} className={styles.userAvatar} />
                                <span>{comment.user.name}</span>
                            </div>
                            <div>{comment.content}</div>
                            <div className={styles.commentTime}>{formatDate(comment.createdAt)}</div>
                        </div>

                        {comment.replies && comment.replies.map((reply, replyIndex) => (
                            <div
                                key={`comment-${index + 1}-reply-${replyIndex + 1}`}
                                className={`${styles.commentContainer} ${styles.replyContainer}`}
                            >
                                <div className={styles.userInfo}>
                                    <img src={reply.user.avatar.url} className={styles.userAvatar} />
                                    <span>{reply.user.name}</span>
                                </div>
                                <div>{reply.content}</div>
                                <div className={styles.commentTime}>{formatDate(reply.createdAt)}</div>
                            </div>
                        ))}
                    </div>
                )) : (
                    <div>No comment</div>
                )}

                {page < totalPages && (
                    <div className={styles.showMore}>
                        <button className={styles.showMoreBTN} onClick={(e) => loadMore(e)}>Show more</button>
                    </div>
                )}
            </div>
            <div className={styles.commentInput}>
                <img src="..." className={styles.userAvatar} />
                <input
                    type='text'
                    placeholder="Comment..."
                    onChange={(e) => checkIfInputFilled(e)}
                />
                <button
                    onClick={(e) => onSubmit(e)}
                    disabled={!isInputFilled}
                >
                    Publish
                </button>
            </div>
        </form>
    );
}

export default CommentForm;