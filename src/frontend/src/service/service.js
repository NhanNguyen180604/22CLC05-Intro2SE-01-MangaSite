import axios from "axios";
import useSWR from "swr";

export const API_URL = "http://localhost:3000/api";

const fetcher = (url) => axios.get(url).then((res) => res.data);

export function useLocalSWR(url) {
  return useSWR(API_URL + url, fetcher);
}

/**
 * Redirects to a page.
 * @param {string} url
 */
export function redirect(url) {
  window.location.href = url;
}

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