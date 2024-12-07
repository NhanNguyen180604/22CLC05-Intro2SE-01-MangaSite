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
  return { name: "luna", email: "luna@example.com" };

  // const res = await axios.get(API_URL + "/users/me");
  // return res.status != 200
  //   ? null
  //   : { name: res.data.name, email: res.data.email };
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
