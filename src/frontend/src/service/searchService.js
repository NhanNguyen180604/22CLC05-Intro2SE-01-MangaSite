import { $token } from "../stores/auth.js";
import { $searchGenres, $searchText } from "../stores/search.js";
import { API_URL } from "./service.js";

/**
 * Runs a search with the available data within nanostores.
 *
 * Returns an object { page, per_page, total, total_pages, mangas }.
 */
export async function search() {
  const query = $searchText.get();
  const includedCategories = $searchGenres.get();

  // Forge the URI. Using URL should encode the query on its own.
  const uri = new URL(API_URL + "/search");
  uri.searchParams.append("q", query);
  uri.searchParams.append("include_categories", includedCategories.join(","));

  const res = await fetch(uri, {
    method: "GET",
    headers: { Authorization: `Bearer ${$token.get()}` },
  });

  if (res.status == 200) return await res.json();
  return null; // Error.
}
