import propTypes from "prop-types";
import { MdReply } from "react-icons/md";

const ReportedChapter = function ({
  informant,
  description,
  chapter,
  processed,
}) {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex flex-row items-center gap-2">
        <MdReply color="white" className="size-6" />
        <span>Chapter reported by</span>
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
          src={
            chapter.manga.cover
              ? chapter.manga.cover
              : "https://placehold.co/320x440"
          }
          alt={`Cover of chapter ${chapter.title}`}
          className="h-[3.25rem] object-cover"
        />

        <div className="flex flex-col justify-between">
          <a
            href={`/mangas/${chapter.manga._id}/chapters/${chapter.number}`}
            className="flex flex-col items-start hover:underline"
          >
            <span className="text-xs font-semibold">
              Chapter #{chapter.number}
            </span>
            <span className="whitespace-break-spaces text-sm">
              {chapter.title}
            </span>
          </a>

          <p className="flex flex-row items-center gap-1 text-sm font-semibold">
            <span className="text-very-light-blue">from</span>
            <a href={`/mangas/${chapter.manga._id}`} className="underline">
              {chapter.manga.name}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

ReportedChapter.propTypes = {
  informant: propTypes.shape({
    _id: propTypes.string,
    name: propTypes.string,
    avatar: propTypes.shape({
      url: propTypes.string,
    }),
  }),
  chapter: propTypes.shape({
    number: propTypes.number,
    title: propTypes.string,
    manga: propTypes.shape({
      _id: propTypes.string,
      name: propTypes.string,
      cover: propTypes.string,
    }),
  }),
  description: propTypes.string,
  processed: propTypes.bool,
};

export default ReportedChapter;
