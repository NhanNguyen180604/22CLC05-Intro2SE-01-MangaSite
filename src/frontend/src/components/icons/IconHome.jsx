import propTypes from "prop-types";

function IconHome({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -960 960 960"
      aria-hidden="true"
      className={className}
    >
      <path d="M229.06-189.06h133.06v-248.82h235.76v248.82h133.06v-376.49L480-753.72 229.06-565.5v376.44ZM153.3-113.3v-490.13L480-848.53l326.86 245.08v490.15H525.07v-251.77h-90.14v251.77H153.3ZM480-471.68Z" />
    </svg>
  );
}

IconHome.propTypes = {
  className: propTypes.string,
};

export default IconHome;