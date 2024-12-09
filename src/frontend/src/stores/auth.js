import { persistentAtom } from "@nanostores/persistent";
import { API_URL } from "../service/service.js";

export const $token = persistentAtom("token", null);
export const $tokenTimestamp = persistentAtom("tokenTimestamp", null);

const EXPIRY_TIME = 60 * 60 * 1000; // one hour

/**
 * @returns True if the token is valid and not expired.
 */
export function isAuth() {
  try {
    const expiry = new Date($tokenTimestamp.get()).getTime() + EXPIRY_TIME;
    const cur = new Date();
    if (expiry < cur) return false;
    return $token.get() != null && $token.get() != "";
  } catch {
    return false;
  }
}

/**
 * Saves the authentication token into localStorage, and refresh timestamp.
 * @param {string} token the token
 */
export function saveAuth(token) {
  $token.set(token);
  $tokenTimestamp.set(new Date().getTime());
}

/**
 * Checks the clearance level of the token.
 *
 * - 0: Not logged in / Not authorized
 * - 1: User
 * - 2: Thief
 * - 3: Thief Chief
 */
export async function checkClearance() {
  if (!isAuth()) return 0;

  // Is there a better way to handle checking for clearance level?
  // We can't save this clearance anywhere visible to the user, or it's gonna be problematic.
  // We also can't just keep checking every request? Right?
  // SWR does handle revalidation, but IDK what it does under the hood, or it's saving somewhere.

  const res = await fetch(`${API_URL}/users/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${$token.get()}`,
    },
  });
  if (res.status == 401) return 0;

  const body = await res.json();
  switch (body.accountType) {
    case "user":
      return 1;
    case "approved":
      return 2;
    case "admin":
      return 3;
    default:
      return 0;
  }
}
