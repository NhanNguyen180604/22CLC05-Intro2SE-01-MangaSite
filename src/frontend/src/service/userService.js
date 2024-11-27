import axios from "axios";
import { API_URL } from "./service";

export async function getMe() {
  const res = await axios.get(`${API_URL}/users/me`);
  return res.status != 401 ? { name: res.name, email: res.email } : null;
}
