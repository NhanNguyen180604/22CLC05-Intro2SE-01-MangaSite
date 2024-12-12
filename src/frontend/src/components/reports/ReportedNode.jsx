import propTypes from "prop-types";
import ReportedChapter from "./ReportedChapter.jsx";
import ReportedComment from "./ReportedComment.jsx";
import ReportedManga from "./ReportedManga.jsx";

const ReportedNode = function ({ report }) {
  if (report.comment.content != undefined) {
    return (
      <ReportedComment
        informant={report.informant}
        description={report.description}
        comment={report.comment}
        processed={report.processed}
      />
    );
  }

  if (report.chapter.title != undefined) {
    return (
      <ReportedChapter
        informant={report.informant}
        description={report.description}
        chapter={report.chapter}
        processed={report.processed}
      />
    );
  }

  return (
    <ReportedManga
      informant={report.informant}
      description={report.description}
      manga={report.manga}
      processed={report.processed}
    />
  );
};

ReportedNode.propTypes = {
  report: propTypes.shape({
    informant: propTypes.shape({
      _id: propTypes.string,
      name: propTypes.string,
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
};

export default ReportedNode;
