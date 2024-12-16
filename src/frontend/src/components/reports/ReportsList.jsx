/* eslint-disable react-hooks/exhaustive-deps */
import propTypes from "prop-types";
import { useEffect, useState } from "react";
import { getReports } from "../../service/reportService.js";
import { redirect } from "../../service/service.js";
import ReportedNode from "./ReportedNode.jsx";

const ReportsList = function ({ search, showProcessed }) {
  const [loading, setLoading] = useState(true);
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

  // Function to update the report client-side, or should we refetch?
  function updateProcessedData(_id, processed) {
    setData(
      data.map((node) => {
        if (node._id != _id) return node;
        return {
          ...node,
          processed: processed,
        };
      }),
    );
  }

  // Function to pop out a node without having to refetch.
  function deleteData(_id) {
    setData(data.filter((node) => node._id != _id));
  }

  return (
    <div className="flex w-full flex-col gap-6">
      {data
        .filter((node) =>
          node.informant.name.toLowerCase().includes(search.toLowerCase()),
        )
        .filter((node) => showProcessed || !node.processed)
        .map((report, idx) => (
          <ReportedNode
            report={report}
            key={`report-node-${idx}`}
            updater={updateProcessedData}
            deleter={deleteData}
          />
        ))}

      {loading && (
        <p className="my-4 animate-pulse text-center text-xl font-semibold">
          Loading...
        </p>
      )}

      {hasMore && !loading && (
        <button
          onClick={() => {
            setPage(page + 1);
          }}
          className="h-12 rounded-full border-2 border-very-light-blue text-very-light-blue duration-200 hover:bg-very-light-blue hover:text-black"
        >
          Show More
        </button>
      )}
    </div>
  );
};

ReportsList.propTypes = {
  search: propTypes.string,
  showProcessed: propTypes.bool,
};

export default ReportsList;
