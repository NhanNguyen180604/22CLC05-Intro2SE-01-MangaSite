const expressAsyncHandler = require("express-async-handler");
const Report = require("../models/reportModel");
const Manga = require("../models/mangaModel");
const Chapter = require("../models/chapterModel");
const Comment = require("../models/commentModel");
const { z } = require("zod");
const reportModel = require("../models/reportModel");

/**
 * GET /api/reports: Retrieve all reports
 *
 * - Clearance Level: 4 (Admins)
 * - Special Containment Procedures:
 *   + Accepts query: { page: number, per_page: number, show_processed: boolean }
 * - Object Class: Safe (No mutations are done)
 * - Status: 200/success, 401/unauthorized.
 * - Returns: { reports: { _id, informant, description, manga, chapter, comment, processed }[], page, per_page, total_pages, total }
 */
const getReports = expressAsyncHandler(async (req, res) => {
  // Dumb people firewall.
  if (req.user.accountType != "admin") {
    res.status(401);
    throw new Error("Unauthorized.");
  }

  const schema = z.object({
    page: z.coerce.number().positive().safe().default(1),
    per_page: z.coerce.number().positive().safe().default(20),
    show_processed: z.coerce.boolean().default(false),
  });
  const query = schema.safeParse(req.query);

  if (query.error) {
    res
      .status(400)
      .json({ message: `Bad request: ${query.error.issues[0].message}` });
    return;
  }

  const { page, per_page, show_processed } = query.data;

  // Finally, some action.
  const reports = await reportModel
    .aggregate()
    .match(show_processed ? {} : { processed: false })
    .sort({ processed: -1 })
    .lookup({
      from: "users",
      localField: "informant",
      foreignField: "_id",
      as: "informant",
    })
    .unwind("$informant")
    .lookup({
      from: "mangas",
      localField: "manga",
      foreignField: "_id",
      as: "manga",
    })
    .unwind({ path: "$manga", preserveNullAndEmptyArrays: true })
    .lookup({
      from: "authors",
      localField: "manga.authors",
      foreignField: "_id",
      as: "manga.authors",
    })
    .lookup({
      from: "chapters",
      localField: "chapter",
      foreignField: "_id",
      as: "chapter",
    })
    .unwind({ path: "$chapter", preserveNullAndEmptyArrays: true })
    .lookup({
      from: "mangas",
      localField: "chapter.manga",
      foreignField: "_id",
      as: "chapter.manga",
    })
    .unwind({ path: "$chapter.manga", preserveNullAndEmptyArrays: true })
    .lookup({
      from: "comments",
      localField: "comment",
      foreignField: "_id",
      as: "comment",
    })
    .unwind({ path: "$comment", preserveNullAndEmptyArrays: true })
    .lookup({
      from: "users",
      localField: "comment.user",
      foreignField: "_id",
      as: "comment.user",
    })
    .unwind({ path: "$comment.user", preserveNullAndEmptyArrays: true })
    .facet({
      total: [{ $count: "count" }],
      pagination: [
        {
          $skip: (page - 1) * page,
        },
        {
          $limit: per_page,
        },
      ],
    });

  return res.status(200).json({
    reports: reports[0].pagination,
    page,
    per_page,
    total_pages: Math.ceil(reports[0].total[0].count / per_page),
    total: reports[0].total[0].count,
  });
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
  const sum = [!!req.body.manga, !!req.body.chapter, !!req.body.comment].reduce(
    (a, v) => a + v,
  );
  if (sum != 1) {
    res.status(400);
    throw new Error(
      "Bad Request: only one field among manga, chapter and comment may be set.",
    );
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
    throw new Error(
      "Not Found: that comment doesn't exist. stop hallucinating.",
    );
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
  console.log(`Want to delete ${req.params.id}`);
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
  console.log(`Want to update ${req.params.id}`, req.params);
  if (req.user.accountType != "admin") {
    res.status(401);
    throw new Error("Unauthorized.");
  }

  const report = await Report.findOne({ _id: req.params.id });
  if (report == null) {
    res.status(404);
    throw new Error("Not Found: that report doesn't exist.");
  }

  const q = await Report.findOneAndUpdate(
    { _id: req.params.id },
    { processed: !report.processed },
    { returnDocument: "after" },
  );
  return res.status(200).json(q);
});

module.exports = { getReports, sendReport, deleteReport, updateReportState };
