import propTypes from "prop-types";
import AuthorsSpread from "./AuthorsSpread.jsx";

/*
 * THIS IS WHAT YOU HAVE TO DO TO APPEASE ESLINT WITHOUT TYPESCRIPT
 *
 * WHY DID YOU PUT ESLINT AND USE UNTYPED JAVASCRIPT ANYWAYYYYY
 *
 * TYPESCRIPT ALONE WOULD GIVE AUTO COMPLETION AND ERROR CHECKING
 * ES LINT ONLY GIVES ERROR CHECKING, THERE IS NO AUTO COMPLETION
 * WHY
 *
 * WHY IS THERE A NUMBER "42" NEXT TO ERRORS COUNT THIS IS MADNESS
 * I CAN'T STAND IT IF IT'S NOT A GREEN TICK WITH THE NUMBER "0"
 * I'M GOING INSANE
 *
 * Do you know what is written on the React's website ITSELF?
 * These docs are old and won’t be updated. Go to react.dev for the new React docs.
 * PropTypes aren’t commonly used in modern React. Use TypeScript for static type checking.
 */

/**
 * The MongoDB's author model populated by aggregation.
 */
const typeAuthor = propTypes.shape({
  _id: propTypes.string,
  name: propTypes.string,
});

/**
 * The MongoDB's category model populated by aggregation.
 */
const typeCategory = propTypes.shape({
  _id: propTypes.string,
  name: propTypes.string,
});

const MangaResultBox = function ({ manga }) {
  // console.log(manga);
  return (
    <a
      href={`/mangas/${manga._id}`}
      className="flex size-full flex-row justify-between gap-5 rounded-xl p-6 duration-200 hover:scale-105 hover:bg-medium-navy lg:flex-col lg:justify-start"
    >
      <div className="min-h-[11rem] min-w-[7rem]">
        <img
          src={manga.cover}
          alt={`The cover for the manga "${manga.name}"`}
          className="object-cover"
        />
      </div>

      <div className="flex flex-col justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="font-semibold lg:text-xl">{manga.name}</h2>
          <p className="text-xs lg:text-sm">
            <span className="font-semibold text-light-blue">Authors</span>
            {": "}
            <AuthorsSpread authors={manga.authors} />
          </p>
        </div>

        <div className="flex flex-row flex-wrap items-center justify-start gap-2 text-xxs font-semibold text-black lg:text-sm">
          {manga.categories.map((category) => (
            <span
              className="flex h-4 cursor-pointer items-center justify-center rounded-full bg-very-light-blue px-2 py-0.5 duration-200 hover:bg-sky-blue lg:h-fit"
              key={`${manga._id}-${category._id}`}
            >
              {category.name}
            </span>
          ))}
        </div>
      </div>
    </a>
  );
};

MangaResultBox.propTypes = {
  manga: propTypes.shape({
    _id: propTypes.string,
    name: propTypes.string,
    authors: propTypes.arrayOf(typeAuthor),
    categories: propTypes.arrayOf(typeCategory),
    cover: propTypes.string,
    description: propTypes.string,
    status: propTypes.string,
  }),
};

export default MangaResultBox;
