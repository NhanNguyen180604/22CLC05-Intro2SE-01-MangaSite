import { useEffect, useState } from "react";
import { search } from "../../service/searchService.js";
import MangaResultBox from "./MangaResultBox.jsx";

function SearchQueryLoading() {
  return (
    <div className="grid grid-cols-1 gap-6 py-8 lg:grid-cols-4 lg:gap-8">
      {[...Array(4)].map((_, idx) => (
        <div
          className="size-full min-h-[11rem] min-w-[7rem] animate-pulse bg-slate-500"
          key={`search-loading-${idx}`}
        ></div>
      ))}
    </div>
  );
}

function SearchQueryError() {
  return (
    <section className="flex min-h-64 flex-col items-center justify-center py-8 lg:py-12">
      <p className="text-2xl font-semibold">
        There was an error handling this request.
      </p>
    </section>
  );
}

function SearchQueryEmpty() {
  return (
    <section className="flex min-h-64 flex-col items-center justify-center py-8 lg:py-12">
      <img
        src="/assets/book_character_cry.png"
        alt="A torn book crying"
        className="h-64 object-contain"
      />
      <p className="text-2xl font-semibold">There{"'"}s nothing here</p>
    </section>
  );
}

export default function SearchQueryDisplay() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // For pagination, basically load only the first few ones, until the user requests for more.
  const [mangas, setMangas] = useState([]);

  useEffect(() => {
    setLoading(true);
    search().then((res) => {
      setData(res);
      if (res != null) {
        setMangas([...mangas, ...res.mangas]);
      }
      setLoading(false);
    });
  }, []); // Shut up ESLINT This is meant to run ONCE.

  if (loading) return <SearchQueryLoading />;
  if (!data) return <SearchQueryError />;
  return (
    <div className="flex flex-col gap-5 py-6 lg:py-8">
      <p className="text-sm lg:text-base">
        Found {data.total.toLocaleString()} publications and chapters.
      </p>

      {mangas.length == 0 ? (
        <SearchQueryEmpty />
      ) : (
        <section className="mt-3 grid grid-cols-1 gap-6 p-8 lg:grid-cols-4 lg:gap-8 lg:p-0 lg:py-10">
          {mangas.map((manga) => (
            <MangaResultBox manga={manga} key={`manga-${manga._id}`} />
          ))}
        </section>
      )}
    </div>
  );
}
