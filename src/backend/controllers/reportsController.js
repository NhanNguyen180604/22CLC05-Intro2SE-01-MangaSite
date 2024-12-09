const expressAsyncHandler = require("express-async-handler");
const Report = require("../models/reportModel");
const Manga = require("../models/mangaModel");
const Chapter = require("../models/chapterModel");
const Comment = require("../models/commentModel");

/**
 * GET /api/reports: Retrieve all reports
 *
 * - Clearance Level: 4 (Admins)
 * - Special Containment Procedures: Requires query { page: number, per_page: number }.
 * - Containment Class: Safe (because we're fucking good at containing this)
 * - Status: 200/success, 401/unauthorized.
 * - Returns: { reports: { _id, informant, description, manga, chapter, comment, processed }[], page, per_page, total_pages, total }
 */
const getReports = expressAsyncHandler(async (req, res) => {
  // Dumb people firewall.
  if (req.user.accountType != "admin") {
    res.status(401);
    throw new Error("Unauthorized.");
  }

  const page = req.query.page ? parseInt(req.query.page) : 1;
  const per_page = req.query.per_page ? parseInt(req.query.per_page) : 20;

  // Validation.
  if (Number.isNaN(page) || !Number.isSafeInteger(page) || page <= 0) {
    res.status(400);
    throw new Error("Bad Request: Invalid query page.");
  }

  if (Number.isNaN(per_page) || !Number.isSafeInteger(per_page) || per_page <= 0) {
    res.status(400);
    throw new Error("Bad Request: Invalid query per_page.");
  }

  const total = await Report.countDocuments({});
  const total_pages = Math.ceil(total / per_page);

  if (page > total_pages) {
    res.status(400);
    throw new Error("Bad Request: Query page too large.");
  }

  // Finally, some action.
  const reports = await Report.find({})
    .sort({ processed: -1 })
    .skip((page - 1) * per_page)
    .limit(per_page);
  return res.status(200).json({ reports, page, per_page, total_pages, total });
});

/**
 * POST /api/reports: Sends a report.
 *
 * - Clearance Level: 2 (Logged in users)
 * - Special Containment Procedures: { description: string, manga: string, chapter: string, comment: string }
 * - Containment Class: Euclid (why are 3 different functions, report manga, report chapter and report comment here at the same time)
 * - Addendum: 200/success, 400/invalid, 401/unauthorized, 404/not found.
 * - Returns: { _id, informant, description, manga, chapter, comment, processed }.
 */
const sendReport = expressAsyncHandler(async (req, res) => {
  if (!req.body.description) {
    res.status(400);
    throw new Error("Bad Request: unspecified description.");
  }

  // Check query.
  const sum = [!!req.body.manga, !!req.body.chapter, !!req.body.comment].reduce((a, v) => a + v);
  if (sum != 1) {
    res.status(400);
    throw new Error("Bad Request: only one field among manga, chapter and comment may be set.");
  }

  // Check existence.
  if (req.body.manga && !(await Manga.exists({ _id: req.body.manga }))) {
    res.status(404);
    throw new Error("Not Found: that manga doesn't exist.");
  }
  if (req.body.chapter && !(await Chapter.exists({ _id: req.body.chapter }))) {
    res.status(404);
    throw new Error("Not Found: that manga chapter doesn't exist.");
  }
  if (req.body.comment && !(await Comment.exists({ _id: req.body.comment }))) {
    res.status(404);
    throw new Error("Not Found: that comment doesn't exist. stop hallucinating.");
  }

  // Create the report.
  const result = await Report.create({
    informant: req.user._id,
    description: req.body.description,
    manga: req.body.manga,
    chapter: req.body.chapter,
    comment: req.body.comment,
  });
  return res.status(200).json(result);
});

/**
 * DELETE /api/reports/:id: Delete a report.
 *
 * - Clearance Level: 4 (Admins)
 * - Addendum: 200/success, 401/unauthorized, 404/reportnotfound.
 * - Returns: { _id: string }
 */
const deleteReport = expressAsyncHandler(async (req, res) => {
  if (req.user.accountType != "admin") {
    res.status(401);
    throw new Error("Unauthorized.");
  }

  if (!(await Report.exists({ _id: req.params.id }))) {
    res.status(404);
    throw new Error("Not Found: that report doesn't exist.");
  }

  const q = await Report.findOneAndDelete({ _id: req.params.id });
  return res.status(200).json({ _id: q._id });
});

/**
 * PUT /api/reports/:id: Update the field "processed" of the report.
 *
 * - Clearance Level: 4 (Admins)
 * - Addendum: 200/success, 401/unauthorized, 404/notfound.
 * - Returns: report
 */
const updateReportState = expressAsyncHandler(async (req, res) => {
  if (req.user.accountType != "admin") {
    res.status(401);
    throw new Error("Unauthorized.");
  }

  const report = await Report.findOne({ _id: req.params.id });
  if (report == null) {
    res.status(404);
    throw new Error("Not Found: that report doesn't exist.");
  }

  const q = await Report.findOneAndUpdate({ _id: req.params.id }, { processed: !report.processed }, { returnDocument: "after" });
  return res.status(200).json(q);
});

module.exports = { getReports, sendReport, deleteReport, updateReportState };
