import propTypes from "prop-types";

/**
 * The MongoDB's author model populated by aggregation.
 */
const typeAuthor = propTypes.shape({
  _id: propTypes.string,
  name: propTypes.string,
});

const AuthorsSpread = function ({ authors }) {
  if (!authors || authors.length == 0)
    return <span className="text-red">No one?</span>;
  return authors.map((author, idx) => (
    <span className="text-very-light-blue" key={`author-${author._id}`}>
      {author.name}
      {idx != authors.length - 1 && <span className="text-white">{", "}</span>}
    </span>
  ));
};

AuthorsSpread.propTypes = {
  authors: propTypes.arrayOf(typeAuthor),
};

export default AuthorsSpread;
