import { API_URL } from "./service.js";

/**
 * Fetches the API endpoint /users/me.
 *
 * @returns the me object, or null if there's an error or not logged in.
 */
export async function getMe() {
  const res = await fetch(API_URL + "/users/me", { method: "GET" });

  if (res.status == 401) return null;
  return await res.json();
}
