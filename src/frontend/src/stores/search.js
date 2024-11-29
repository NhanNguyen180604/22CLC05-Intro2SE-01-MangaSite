import { persistentAtom } from "@nanostores/persistent";

const $searchText = persistentAtom("search-text", "");
const $searchGenres = persistentAtom("search-genres", [], {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export { $searchGenres, $searchText };
