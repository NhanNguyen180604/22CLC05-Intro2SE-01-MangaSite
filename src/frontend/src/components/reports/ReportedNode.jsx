import propTypes from "prop-types";
import { MdReply } from "react-icons/md";
import ProcessReportButton from "./ProcessReportButton.jsx";
import ReportedChapter from "./ReportedChapter.jsx";
import ReportedComment from "./ReportedComment.jsx";
import ReportedManga from "./ReportedManga.jsx";

const ReportedNode = function ({ report, updater, deleter }) {
  function isComment() {
    return report.comment.content != undefined;
  }

  function isChapter() {
    return report.chapter.title != undefined;
  }

  return (
    <div className="relative flex w-full flex-col gap-2">
      <ProcessReportButton
        _id={report._id}
        processed={report.processed}
        updater={updater}
        deleter={deleter}
      />

      <div className="flex flex-row items-center gap-2">
        <MdReply color="white" className="size-6" />
        <span>
          {isComment() ? "Comment" : isChapter() ? "Chapter" : "Manga"} reported
          by
        </span>
        <a
          href={`/user/${report.informant._id}`}
          className="flex flex-row items-center gap-2 hover:underline"
        >
          <img
            src={report.informant.avatar?.url}
            alt={`Avatar of ${report.informant.name}`}
            className="size-6 rounded-full object-cover"
          />
          <span className="font-semibold">{report.informant.name}</span>
        </a>
      </div>

      <div className="flex w-full flex-row items-center">
        <span className="font-semibold">Reason</span>: {report.description}
      </div>

      {isComment() ? (
        <ReportedComment
          informant={report.informant}
          description={report.description}
          comment={report.comment}
          processed={report.processed}
        />
      ) : isChapter() ? (
        <ReportedChapter
          informant={report.informant}
          description={report.description}
          chapter={report.chapter}
          processed={report.processed}
        />
      ) : (
        <ReportedManga
          informant={report.informant}
          description={report.description}
          manga={report.manga}
          processed={report.processed}
        />
      )}
    </div>
  );
};

ReportedNode.propTypes = {
  report: propTypes.shape({
    _id: propTypes.string,
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
    }),
    chapter: propTypes.shape({
      _id: propTypes.string,
      title: propTypes.string,
    }),
    comment: propTypes.shape({
      _id: propTypes.string,
      content: propTypes.string,
    }),
    processed: propTypes.bool,
  }),
  updater: propTypes.func,
  deleter: propTypes.func,
};

export default ReportedNode;
