import propTypes from "prop-types";
import AuthorsSpread from "../search/AuthorsSpread.jsx";

const ReportedManga = function ({ manga, processed }) {
  return (
    <div
      className={`relative flex w-full flex-row items-center gap-6 rounded-xl bg-medium-navy p-4 ${processed ? "opacity-50" : ""}`}
    >
      <img
        src={manga.cover ? manga.cover : "https://placehold.co/320x440"}
        alt={`Cover of manga ${manga.name}`}
        className="h-[3.25rem] object-cover"
      />

      <div className="flex flex-col items-start">
        <a
          href={`/manga/${manga._id}`}
          className="font-semibold hover:underline"
        >
          {manga.name}
        </a>
        <p className="!lg:text-sm !text-xs font-semibold text-very-light-blue">
          <span className="text-light-blue">Authors: </span>
          <AuthorsSpread authors={manga.authors} />
        </p>
      </div>
    </div>
  );
};

ReportedManga.propTypes = {
  manga: propTypes.shape({
    _id: propTypes.string,
    name: propTypes.string,
    authors: propTypes.arrayOf(
      propTypes.shape({
        _id: propTypes.string,
        name: propTypes.string,
      }),
    ),
    cover: propTypes.string,
  }),
  processed: propTypes.bool,
};

export default ReportedManga;
