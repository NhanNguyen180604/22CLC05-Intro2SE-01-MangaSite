import { API_URL } from './service.js';
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