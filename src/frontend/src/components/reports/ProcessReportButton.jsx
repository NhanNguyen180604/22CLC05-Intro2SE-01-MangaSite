import propTypes from "prop-types";
import { useState } from "react";
import { MdMoreHoriz } from "react-icons/md";
import ProcessReportPopup from "./ProcessReportPopup.jsx";

const ProcessReportButton = function ({ _id, processed, updater, deleter }) {
  const [popup, setPopup] = useState(false);

  return (
    <div className="absolute right-1 top-1">
      {popup && (
        <ProcessReportPopup _id={_id} updater={updater} deleter={deleter} />
      )}

      <button
        className="disabled:cursor-wait disabled:opacity-50"
        aria-label={processed ? "Unprocess" : "Process"}
        onClick={() => {
          setPopup(!popup);
        }}
      >
        <MdMoreHoriz className="size-5" />
      </button>
    </div>
  );
};

ProcessReportButton.propTypes = {
  _id: propTypes.string,
  processed: propTypes.bool,
  updater: propTypes.func,
  deleter: propTypes.func,
};

export default ProcessReportButton;
