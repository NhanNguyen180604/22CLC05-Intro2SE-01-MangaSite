import Popup from "reactjs-popup";
import NotiPopup from "../NotiPopup/NotiPopup.jsx";
import "./CommentPopup.css";
import styles from "./CommentPopup.module.css";
import { FaComment } from "react-icons/fa";
import { useState, useEffect } from "react";
import { getMangaComments, getChapterComments } from "../../service/mangaService.js";
import { useParams } from "react-router-dom";
import { FaXmark } from "react-icons/fa6";
import { getMe } from "../../service/userService.js";
import { postComment } from "../../service/mangaService.js";
import { sendReport } from "../../service/reportService.js";

const CommentPopup = ({ loggedIn }) => {
    const [showThis, setShowThis] = useState(false);
    const [showNoti, setShowNoti] = useState(false);
    const [notiDetails, setNotiDetails] = useState({
        success: false,
        message: '',
        details: '',
    });

    const onOpen = async () => {
        if (loggedIn === false) {
            setNotiDetails({
                success: false,
                message: 'You are not logged in!',
                details: 'Log in to use this feature',
            });
            setShowThis(false);
            setShowNoti(true);
        }
        else {
            setShowThis(true);
        }
    };

    const { id, chapterNumber } = useParams();

    const [me, setMe] = useState({
        loggedIn: false,
        avatar: {
            url: '',
        },
        accountType: 'user',
        email: '',
        name: '',
        _id: '',
    });

    const [comments, setComments] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(100);
    const perPage = 10;

    const [isInputFilled, setIsInputFilled] = useState(false);
    const [commentInput, setCommentInput] = useState('');

    const [replying, setReplying] = useState({
        _id: '',
        name: '',
        content: '',
    });
    const resetReplying = () => {
        setReplying({
            _id: '',
            name: '',
            content: '',
        });
    };

    const checkIfInputFilled = (e) => {
        const { value } = e.target;
        setCommentInput(value);
        const hasText = value.trim().length > 0;
        setIsInputFilled(hasText);
    };

    const checkKeyDown = (e) => {
        if (e.key === 'Enter' && isInputFilled)
            onSubmit(e);
    }

    // load the next comment page
    const loadMore = (event) => {
        event.preventDefault();
        if (page < totalPages)
            setPage(prev => prev + 1);
    }

    const fetchData = async (local_page = 1, per_page = 20) => {
        if (local_page === 0)
            local_page = 1;  // idk why, someone finds this bug for me

        const response = !chapterNumber ? await getMangaComments(id, local_page, per_page) : await getChapterComments(id, chapterNumber, local_page, per_page);

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

            // sort by time
            let newComments = nonReplyingComments.sort((a, b) => {
                return (new Date(b.createdAt)).getTime() - (new Date(a.createdAt)).getTime()
            });
            newComments = newComments.filter(comment => !comments.some(currentComment => currentComment._id === comment._id));
            setComments([...comments, ...newComments]);
        }
    };

    useEffect(() => {
        const initialize = async () => {
            const getMeResponse = await getMe();
            if (getMeResponse) {
                setMe(getMeResponse);
            }
        }

        if (loggedIn !== false)
            initialize();
    }, []);

    useEffect(() => {
        fetchData(page, perPage);
    }, [page]);

    const onSubmit = async (e) => {
        e.preventDefault();

        // API call here
        const response = await postComment(commentInput, id, chapterNumber, replying._id.length ? replying._id : null);
        // set result popup details based on api call result
        if (response.status === 200) {
            const newComment = response.comment;
            newComment.user = me; // to get avatar

            let newComments = [];

            if (!replying._id.length) { // not a replying comment
                newComments = [response.comment, ...comments];
                setComments(newComments);
            }
            else {
                newComments = comments.map(comment => {
                    const newComment = { ...comment };
                    if (comment.replies)
                        newComment.replies = [...comment.replies];
                    if (comment._id === response.comment.replyTo._id) {
                        if (!newComment.replies)
                            newComment.replies = [];
                        newComment.replies?.push(response.comment);
                    }
                    return newComment;
                });
                setComments(newComments);
            }

            // prevent pagination from foaking up
            setPage(Math.floor(newComments.length / perPage));
        }
        else {
            setNotiDetails({
                success: false,
                message: "Failed to post comment",
                details: response.message,
            });
            setShowNoti(true);
        }

        // reset replying
        resetReplying();
        setCommentInput('');
    }

    return (
        <>
            <div className={styles.toggleBTN} onClick={onOpen}>
                <FaComment />
            </div>

            <Popup
                open={showThis} modal
                onClose={() => setShowThis(false)}
                closeOnDocumentClick
                closeOnEscapse
                lockScroll
                className="comment-popup"
            >
                <>
                    <form className={styles.commentForm}>
                        <div className={styles.formTitle}>
                            <div>Comments</div>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    setShowThis(false);
                                }}
                            >
                                <FaXmark />
                            </button>
                        </div>

                        <div className={styles.commentList}>
                            {comments.length ? comments.map((comment) => (
                                <div key={comment._id}>
                                    <CommentContainer
                                        key={comment._id}
                                        commentObj={comment}
                                        setReplying={setReplying}
                                    />

                                    {comment.replies && comment.replies.map((reply) => (
                                        <CommentContainer
                                            key={reply._id}
                                            commentObj={reply}
                                            setReplying={setReplying}
                                            isReply={true}
                                        />
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

                        <div className={styles.commentInputWrapper}>

                            <div className={`${styles.replyInfo} ${replying._id === '' ? styles.hidden : ''}`}>
                                <div>Replying {replying.name}: {replying.content.slice(0, 20) + (replying.content.length > 20 ? '...' : '')}</div>
                                <button onClick={(e) => { e.preventDefault(); resetReplying(); }}><FaXmark /></button>
                            </div>
                            <div className={styles.commentInput}>
                                <img src={me.avatar?.url || 'https://placehold.co/50x50?text=User+Avatar'} className={styles.userAvatar} />
                                <input
                                    type='text'
                                    placeholder="Comment..."
                                    onChange={(e) => checkIfInputFilled(e)}
                                    onKeyDown={(e) => checkKeyDown(e)}
                                    value={commentInput}
                                />
                                <button
                                    onClick={(e) => onSubmit(e)}
                                    disabled={!isInputFilled}
                                >
                                    Publish
                                </button>
                            </div>
                        </div>
                    </form>
                </>
            </Popup>

            <NotiPopup
                open={showNoti}
                onClose={() => setShowNoti(false)}
                success={notiDetails.success}
                message={notiDetails.message}
                details={notiDetails.details}
            />
        </>
    );
}
export default CommentPopup

const CommentContainer = ({ commentObj, setReplying, isReply = false }) => {
    const [show, setShow] = useState(false);

    const formatDate = (date) => {
        const localDate = new Date(date);
        return localDate.toLocaleString();
    };

    const submitReport = async (reason) => {
        setShow(false);
        const response = await sendReport('comment', commentObj._id, reason);
    }

    return (
        <div className={styles.commentWrapper}>
            <div className={`${styles.commentContainer} ${isReply && styles.replyContainer}`}>
                <div className={styles.userInfo}>
                    <img src={commentObj.user?.avatar?.url || 'https://placehold.co/50x50?text=User+Avatar'} className={styles.userAvatar} />
                    <span>{commentObj.user.name}</span>
                </div>
                <div>{commentObj.content}</div>
                <div className={styles.commentTime}>{formatDate(commentObj.createdAt)}</div>
            </div>

            <div className={styles.commentActionBTNs}>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        setReplying({
                            _id: commentObj.replyTo ? commentObj.replyTo : commentObj._id,  // I'm a fraud
                            name: commentObj.user.name,
                            content: commentObj.content,
                        });
                    }}
                >
                    Reply
                </button>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        setShow(!show);
                    }}
                >
                    Report
                </button>

                {show && (
                    <div className={styles.reportReasons}>
                        <div onClick={() => submitReport('Hate speech')}>Hate speech</div>
                        <div onClick={() => submitReport('Hate speech')}>Harassment</div>
                        <div onClick={() => submitReport('Hate speech')}>Spam</div>
                    </div>
                )}
            </div>
        </div>
    );
};