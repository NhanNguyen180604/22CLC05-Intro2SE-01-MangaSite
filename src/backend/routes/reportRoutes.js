const express = require("express");
const router = express.Router();
const { getReports, sendReport, deleteReport, updateReportState } = require("../controllers/reportsController");
const { authorize } = require("../middlewares/authMiddleware");

router.route("/").get(authorize, getReports).post(authorize, sendReport);
router.route("/:id").delete(authorize, deleteReport).put(authorize, updateReportState);

module.exports = router;
