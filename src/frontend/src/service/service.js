import axios from "axios";
import useSWR from "swr";

export const API_URL = "http://localhost:3000/api";

const fetcher = (url) => axios.get(url).then((res) => res.data);
export function useLocalSWR(url) {
  return useSWR(API_URL + url, fetcher);
}
