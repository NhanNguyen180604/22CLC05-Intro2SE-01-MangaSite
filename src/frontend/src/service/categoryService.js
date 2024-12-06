import { API_URL } from "./service.js";

/**
 * Retrieves all categories through a fetch. This only reads a page of 30 tags,
 * it doesn't read everything. There aren't that many anyway.
 */
export async function getCategories() {
  const res = await fetch(API_URL + "/categories?page=1&per_page=30");

  if (res.status != 200) return null;
  return await res.json().then((json) => json.categories);
}
