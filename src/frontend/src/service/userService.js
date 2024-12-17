/**
 * Fetches the API endpoint /users/me.
 *
 * @returns the me object, or null if there's an error or not logged in.
 */
import axios from "axios";
import { $token } from "../stores/auth.js";
import { API_URL } from "./service.js";
import { waitFor } from "@testing-library/react";
const API = API_URL + '/users/';

// get mangas
export const postLogin = async (email, password) => {
    try {
        const response = await axios.post(API + 'login', {
            email: email,
            password: password
        },
        )
        return { token: response.data }
    } catch (error) {
        return getErrorMessage(error);
    }
};

export const postRegister = async (email, username, password) => {
    try {
        const response = await axios.post(API + 'register', {
            email: email,
            name: username,
            password: password
        },
        )
        return { user: response.data }
    } catch (error) {
        return getErrorMessage(error);
    }
};

export async function getMe() {
  const token = $token.get();
    if (!token)
        return null;
    const res = await fetch(API + "me", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (res.status == 401) return null;
    return await res.json();
}

export async function putMe(email, name){
    const token = localStorage.getItem('token');
    if (!token)
        return null;
    const res = await axios.put(API + "me", 
        {
            email,
            name
        },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    if (res.status == 401) return null;
    return await res.data;
}

export const changeAvatar = async (avatar) => {
    const token = localStorage.getItem('token');
    if (!token)
        return null;
    const res = await axios.put(API + "avatar", 
        avatar,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    if (res.status == 401) return null;
    return await res.data;
}

export const getBlacklist = async () => {
    const token = localStorage.getItem('token');
    if (!token)
        return null;
    const res = await axios.get(API + "blacklist", 
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    if (res.status !== 200) return null;
    return await res.data;
}

export const putBlacklist = async (blacklist) => {
    const token = localStorage.getItem('token');
    if (!token)
        return null;
    const res = await axios.put(API + "blacklist",
        {blacklist}, 
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    if (res.status !== 200) return null;
    return await res.data;
}

export const getLibrary = async () => {
    const token = localStorage.getItem('token');
    if (!token)
        return null;

    const res = await fetch(API + "/library", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (res.status !== 200) return null;
    return await res.json();
};

export const updateLibrary = async (mangaID, tab) => {
    const token = localStorage.getItem('token');
    if (!token)
        return {
            status: 401,
            message: 'You are not logged in',
        };

    try {
        const response = await axios.put(API + 'library/' + tab,
            {
                id: mangaID,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return { status: response.status, updatedTab: response.data };
    }
    catch (err) {
        return getErrorMessage(err);
    }
};

export const deleteFromLibrary = async (mangaID, tab) => {
    const token = localStorage.getItem('token');
    if (!token)
        return {
            status: 401,
            message: 'You are not logged in',
        };

    try {
        const response = await axios.delete(API + `library/${tab}/${mangaID}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return { status: response.status, updatedTab: response.data };
    }
    catch (err) {
        return getErrorMessage(err);
    }
};

export const getErrorMessage = (error) => {
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

export async function getUserNotifications() {
  const token = $token.get();
    if (!token)
        return null;
    const res = await fetch(API + "notifications", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (res.status == 401) return null;
    return await res.json();
}

export async function readUserNoti(id) {
    const token = $token.get()
    if (!token)
        return null
    const res = await fetch(`${API}notifications/${id}/read`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    if (res.status == 401) return null;
    return await res.json();
}
