import { API_URL, getErrorMessage } from './service.js';
import axios from 'axios';
const API = API_URL + '/authors';

export const getAllAuthors = async () => {
    try {
        const res = await axios.get(API + '?all=true');
        if (res.status !== 200)
            return null;

        return { status: res.status, authors: res.data };
    }
    catch (err) {
        return null;
    }
};

export const postNewAuthor = async (name) => {
    const token = localStorage.getItem('token');
    if (!token)
        return {
            status: 401,
            message: 'You are not logged in',
        };

    try {
        const data = {
            name: name,
        };
        const res = await axios.post(API, data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return { status: res.status, author: res.data };
    }
    catch (error) {
        return getErrorMessage(error);
    }
};