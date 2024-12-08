import axios from "axios";
import { API_URL, getErrorMessage } from "./service.js";
const API = API_URL + '/mangas/';

// get mangas
export const getMangas = async (page = 1, per_page = 20) => {
    try {
        const response = await axios.get(API, {
            params: {
                page: page,
                per_page: per_page,
            },
        })
        return { status: response.status, mangas: response.data }
    } catch (error) {
        return getErrorMessage(error);
    }
};

// get a manga by id
export const getMangaByID = async (id) => {
    try {
        const response = await axios.get(API + id)
        return { status: response.status, manga: response.data }
    } catch (error) {
        return getErrorMessage(error);
    }
};

export const getChapterList = async (mangaID, page = 1, per_page = 20, all = false) => {
    try {
        let route = '';
        if (all === true)
            route = API + mangaID + `/chapters?all=true`;
        else route = API + mangaID + `/chapters?page=${page}&per_page=${per_page}`;

        const response = await axios.get(route);
        return { status: response.status, chaptersInfo: response.data };
    } catch (error) {
        return getErrorMessage(error);
    }
};

export const getChapter = async (mangaID, chapterNumber) => {
    try {
        const response = await axios.get(API + mangaID + "/chapters/" + chapterNumber);
        return { status: response.status, chapter: response.data };
    } catch (error) {
        return getErrorMessage(error);
    }
};

export const getRatings = async (mangaID) => {
    try {
        const response = await axios.get(API + mangaID + `/ratings`);
        return { status: response.status, ratings: response.data };
    } catch (error) {
        return getErrorMessage(error);
    }
};

export const getOneRating = async (mangaID) => {
    const token = localStorage.getItem('token');
    if (!token)
        return {
            status: 401,
            message: 'You are not logged in',
        };

    try {
        const response = await axios.get(API + mangaID + '/ratings/one',
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return { status: response.status, rating: response.data };
    } catch (error) {
        return getErrorMessage(error);
    }
};

export const sendRating = async (mangaID, ratingScore) => {
    const token = localStorage.getItem('token');
    if (!token)
        return {
            status: 401,
            message: 'You are not logged in',
        };

    try {
        const response = await axios.post(API + mangaID + '/ratings',
            {
                score: ratingScore,

            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return { status: response.status, rating: response.data };
    } catch (error) {
        return getErrorMessage(error);
    }
};

// get cover images
export const getCovers = async (mangaID) => {
    try {
        const response = await axios.get(API + mangaID + `/covers`);
        return { status: response.status, covers: response.data }
    } catch (error) {
        return getErrorMessage(error);
    }
};

// get a manga's comments
export const getMangaComments = async (mangaID, page = 1, per_page = 20) => {
    try {
        const response = await axios.get(API + mangaID + `/comments?page=${page}&per_page=${per_page}`);
        return { status: response.status, comments: response.data }
    } catch (error) {
        return getErrorMessage(error);
    }
};

export const getChapterComments = async (mangaID, chapterNumber, page = 1, per_page = 20) => {
    try {
        const response = await axios.get(API + `${mangaID}/chapters/${chapterNumber}/comments?page=${page}&per_page=${per_page}`);
        return { status: response.status, comments: response.data }
    } catch (error) {
        return getErrorMessage(error);
    }
};

export const postComment = async (content, mangaID, chapterNumber = null, replyID = null) => {
    const token = localStorage.getItem('token');
    if (!token)
        return {
            status: 401,
            message: 'You are not logged in',
        };

    const data = {
        content: content,
    };
    if (chapterNumber)
        data.chapter = chapterNumber;
    if (replyID)
        data.replyTo = replyID;

    try {
        const response = await axios.post(API + mangaID + '/comments', data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return { status: response.status, comment: response.data };
    } catch (error) {
        return getErrorMessage(error);
    }
};