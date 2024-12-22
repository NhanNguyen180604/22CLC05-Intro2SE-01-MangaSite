import { API_URL, getErrorMessage } from './service.js';
import axios from 'axios';
const API = API_URL + '/authors';
import { $token } from "../stores/auth.js";

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

export const editAuthor = async (data) => {
  try {
    const token = $token.get();
    const res = await axios.put(`${API}/${data.id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.status !== 200) return null;

    return { status: 200, authors: res.data };
  } catch (err) {
    return err;
  }
};

export const deleteAuthor = async (id) => {
  try {
    const token = $token.get();
    const res = await axios.delete(`${API}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.status !== 200) return null;

    return { status: 200, authors: res.data };
  } catch (err) {
    return err;
  }
};

