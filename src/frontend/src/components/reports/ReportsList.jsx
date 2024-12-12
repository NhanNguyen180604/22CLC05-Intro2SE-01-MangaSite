import propTypes from "prop-types";
import { useEffect, useState } from "react";
import { getReports } from "../../service/reportService.js";

const ReportsList = function ({ search, showProcessed }) {
  const [currentData, setCurrentData] = useState([]);
  const [page, setPage] = useState(0);
  const [newData, setNewData] = useState(null);

  useEffect(() => {
    getReports({ page, showProcessed });
  }, [page, showProcessed]);
};

ReportsList.propTypes = {
  search: propTypes.string,
  showProcessed: propTypes.bool,
};

export default ReportsList;
