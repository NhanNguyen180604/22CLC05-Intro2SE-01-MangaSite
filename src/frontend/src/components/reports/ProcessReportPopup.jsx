import propTypes from "prop-types";
import { MdCheck, MdOutlineDelete } from "react-icons/md";
import { deleteReport, processReport } from "../../service/reportService.js";

const ProcessReportPopup = function ({ _id, updater, deleter }) {
  return (
    <div className="absolute inset-0 flex w-fit -translate-x-1/2 -translate-y-full flex-row items-center justify-center rounded-xl bg-dark-navy px-4 py-4">
      <button
        aria-label="Process or Unprocess"
        onClick={() => {
          processReport({ _id }).then((res) => {
            if (res != null) updater(_id, res.processed);
          });
        }}
      >
        <MdCheck className="size-5" />
      </button>

      <button
        aria-label="Delete"
        onClick={() => {
          deleteReport({ _id }).then((res) => {
            if (res) deleter(_id);
          });
        }}
      >
        <MdOutlineDelete className="size-5" />
      </button>
    </div>
  );
};

ProcessReportPopup.propTypes = {
  _id: propTypes.string,
  updater: propTypes.func,
  deleter: propTypes.func,
};

export default ProcessReportPopup;
