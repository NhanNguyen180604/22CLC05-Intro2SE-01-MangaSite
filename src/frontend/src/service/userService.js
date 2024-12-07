/**
 * Fetches the API endpoint /users/me.
 *
 * @returns the me object, or null if there's an error or not logged in.
 */
import axios from "axios";
import { API_URL } from "./service.js";
const API = API_URL + '/users/';

// get mangas
export const postLogin = async (email, password) => {
    try {
        const response = await axios.post(API + 'login',{
              email: email,
              password: password
          },
        )
        return {token: response.data}
    } catch (error) {
        return getErrorMessage(error);
    }
};

export const postRegister = async (email, username, password) => {
    try {
        const response = await axios.post(API + 'register',{
              email: email,
              name: username,
              password: password
          },
        )
        return {user: response.data}
    } catch (error) {
        return getErrorMessage(error);
    }
};

export async function getMe() {
  const res = await fetch(API_URL + "/users/me", { method: "GET" });

  if (res.status == 401) return null;
  return await res.json();
}

const getErrorMessage = (error) => {
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
