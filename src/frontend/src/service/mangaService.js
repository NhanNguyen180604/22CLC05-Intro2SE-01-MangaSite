import axios from "axios";
import { API_URL } from "./service.js";
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
        return {
            status: 500,
            message: "server is dead",
        }
    }
};

// get a manga by id
export const getMangaByID = async (id) => {
    try {
        const response = await axios.get(API + id)
        return { status: response.status, manga: response.data }
    } catch (error) {
        if (error.response) {
            return {
                status: error.response.status,
                message: error.response.data.message
            }
        }

        return {
            status: 500,
            message: "Something went wrong, and we have no idea"
        }
    }
};

export const getChapterList = async (mangaID, page = 1, per_page = 20) => {
    try {
        const response = await axios.get(API + mangaID + `/chapters?page=${page}&per_page=${per_page}`);
        return { status: response.status, chaptersInfo: response.data };
    } catch (error) {
        if (error.response) {
            return {
                status: error.response.status,
                message: error.response.data.message
            }
        }

        return {
            status: 500,
            message: "Something went wrong, and we have no idea"
        }
    }
};

export const getRatings = async (mangaID) => {
    try {
        const response = await axios.get(API + mangaID + `/ratings`);
        return { status: response.status, ratings: response.data };
    } catch (error) {
        if (error.response) {
            return {
                status: error.response.status,
                message: error.response.data.message
            }
        }

        return {
            status: 500,
            message: "Something went wrong, and we have no idea"
        }
    }
};

export const getChapter = async (mangaID, chapterNumber) => {
    try {
        const response = await axios.get(API + mangaID + "/chapter/" + chapterNumber + "?page=1&per_page=20");
        return { responseStatus: response.status, images: response.data.images, title: response.data.title };
    } catch (error) {

    }
};

// get cover images
export const getCovers = async (mangaID) => {
    try {
        const response = await axios.get(API + mangaID + `/covers`);
        return { status: response.status, covers: response.data }
    } catch (error) {
        return {
            status: 500,
            message: "server is dead",
        }
    }
};

// get a manga's comments
export const getMangaComments = async(mangaID, page = 1, per_page = 20) => {
    try {
        const response = await axios.get(API + mangaID + `/comments?page=${page}&per_page=${per_page}`);
        return { status: response.status, comments: response.data }
    } catch (error) {
        return {
            status: 500,
            message: "server is dead",
        }
    }
};