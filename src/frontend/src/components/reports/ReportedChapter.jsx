import propTypes from "prop-types";

const ReportedChapter = function ({ chapter, processed }) {
  return (
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
  );
};

ReportedChapter.propTypes = {
  chapter: propTypes.shape({
    number: propTypes.number,
    title: propTypes.string,
    manga: propTypes.shape({
      _id: propTypes.string,
      name: propTypes.string,
      cover: propTypes.string,
    }),
  }),
  processed: propTypes.bool,
};

export default ReportedChapter;
