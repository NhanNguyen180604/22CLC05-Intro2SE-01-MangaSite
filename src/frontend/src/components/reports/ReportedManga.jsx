import propTypes from "prop-types";
import { MdReply } from "react-icons/md";
import AuthorsSpread from "../search/AuthorsSpread.jsx";

const ReportedManga = function ({ informant, description, manga, processed }) {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex flex-row items-center gap-2">
        <MdReply color="white" className="size-6" />
        <span>Manga reported by</span>
        <a
          href={`/user/${informant._id}`}
          className="flex flex-row items-center gap-2 hover:underline"
        >
          <img
            src={informant.avatar.url}
            alt={`Avatar of ${informant.name}`}
            className="size-6 rounded-full object-cover"
          />
          <span className="font-semibold">{informant.name}</span>
        </a>
      </div>

      <div className="flex w-full flex-row items-center">
        <span className="font-semibold">Reason</span>: {description}
      </div>

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
    </div>
  );
};

ReportedManga.propTypes = {
  informant: propTypes.shape({
    _id: propTypes.string,
    name: propTypes.string,
    avatar: propTypes.shape({
      url: propTypes.string,
    }),
  }),
  description: propTypes.string,
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
