/* eslint-disable react-hooks/exhaustive-deps */
import propTypes from "prop-types";
import { useEffect, useState } from "react";
import { getReports } from "../../service/reportService.js";
import { redirect } from "../../service/service.js";
import ReportedNode from "./ReportedNode.jsx";

const ReportsList = function ({ search, showProcessed }) {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [data, setData] = useState([]);

  // Every time page changes, re-fetch.
  useEffect(() => {
    setLoading(true);
    getReports({ page, showProcessed }).then((reports) => {
      setLoading(false);

      // Not 200 means unauthorized.
      if (reports == null) {
        redirect("/401");
        return;
      }

      setHasMore(reports.more);
      setData([...data, ...reports.reports]);
    });
  }, [page]);

  return (
    <div className="flex w-full flex-col gap-6">
      {data.map((report, idx) => (
        <ReportedNode report={report} key={`report-node-${idx}`} />
      ))}

      {loading && (
        <p className="my-4 animate-pulse text-center text-xl font-semibold">
          Loading...
        </p>
      )}
    </div>
  );
};

ReportsList.propTypes = {
  search: propTypes.string,
  showProcessed: propTypes.bool,
};

export default ReportsList;
