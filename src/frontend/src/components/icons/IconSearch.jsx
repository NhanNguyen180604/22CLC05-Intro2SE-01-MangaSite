import propTypes from "prop-types";

function IconSearch({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M26.375 28.568L17.611 19.817C16.957 20.3375 16.1927 20.7466 15.318 21.0444C14.4434 21.3424 13.5029 21.4914 12.4967 21.4914C9.99047 21.4914 7.86725 20.6206 6.12702 18.879C4.38658 17.1375 3.51636 15.0297 3.51636 12.5557C3.51636 10.0815 4.38714 7.97358 6.12869 6.23202C7.87025 4.49047 9.9818 3.61969 12.4634 3.61969C14.9449 3.61969 17.0527 4.49047 18.7867 6.23202C20.5209 7.97358 21.388 10.0826 21.388 12.559C21.388 13.5448 21.2429 14.469 20.9527 15.3317C20.6625 16.1944 20.242 16.9877 19.6914 17.7117L28.4837 26.4657L26.375 28.568ZM12.4787 18.553C14.1471 18.553 15.5595 17.9694 16.7157 16.802C17.8717 15.6345 18.4497 14.219 18.4497 12.5557C18.4497 10.8921 17.871 9.47669 16.7137 8.30936C15.5564 7.1418 14.1447 6.55802 12.4787 6.55802C10.8005 6.55802 9.37691 7.1418 8.20802 8.30936C7.03914 9.47669 6.45469 10.8921 6.45469 12.5557C6.45469 14.219 7.03847 15.6345 8.20602 16.802C9.3738 17.9694 10.798 18.553 12.4787 18.553Z" />
    </svg>
  );
}

IconSearch.propTypes = {
  className: propTypes.string,
};

export default IconSearch;