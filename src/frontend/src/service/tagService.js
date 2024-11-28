import axios from "axios";
import { API_URL } from "./service.js";

export async function getAllTags() {
  const res = await axios.get(API_URL + "/categories?page=1&per_page=20");
  return res.status != 200 ? null : res.data.categories.map((it) => it.name);
}
