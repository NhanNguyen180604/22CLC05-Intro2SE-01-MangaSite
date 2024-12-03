const asyncHandler = require("express-async-handler");
const Author = require("../models/authorModel");
const User = require("../models/userModel");
const { deleteAllMangas } = require('./mangaController');

/**
 * GET /api/authors: get all victims as a list.
 *
 * Query:
 * - Page (number): the page number.
 * - Per page (number): number of authors per page.
 */
const getAuthors = asyncHandler(async (req, res) => {
  // Check if the query parameters are cute.
  if (req.query.page && (isNaN(parseInt(req.query.page)) || !Number.isSafeInteger(parseInt(req.query.page)))) {
    res.status(401);
    throw new Error("Bad request. Invalid query page.");
  }

  if (
    req.query.per_page &&
    (isNaN(parseInt(req.query.per_page)) || !Number.isSafeInteger(parseInt(req.query.per_page)))
  ) {
    res.status(401);
    throw new Error("Bad request. Invalid query per_page");
  }

  let page = req.query.page ? parseInt(req.query.page) : 1;
  const perPage = req.query.per_page ? parseInt(req.query.per_page) : 20;
  const total = await Author.countDocuments();
  const totalPages = Math.ceil(total / perPage);

  if (page > totalPages) page = totalPages;

  const body = await Author.find()
    .skip((page - 1) * perPage)
    .limit(perPage)
    .select("_id name");

  return res.status(200).json({
    authors: body,
    page,
    per_page: perPage,
    total_pages: totalPages,
    total,
  });
});

/**
 * POST /api/authors: add a new victim to our stealing checklist.
 *
 * - Status: 200 if succeeds, 400 if author's name is empty, 401 if not authorized.
 * - Accepts: { name: string }
 * - Returns: { _id: string, name: string }
 */
const uploadAuthor = asyncHandler(async (req, res) => {
  if (req.user.accountType === "user") {
    res.status(401);
    throw new Error("Unauthorized.");
  }

  if (!req.body || !req.body.name) {
    res.status(400);
    throw new Error("Bad Request. Author name is empty.");
  }

  // Deny if author already exists.
  if (await Author.exists({ name: req.body.name })) {
    res.status(400);
    throw new Error("That author already exists.");
  }

  // Let's go another author to steal from. I love stealing.
  const doc = await Author.create({ name: req.body.name });
  return res.status(200).json({ _id: doc._id, name: doc.name });
});

/**
 * POST /api/authors/:id, update a victim's name.
 *
 * - Access: admins only
 * - Accepts: { name: string }
 * - Status: 200 if succeeds, 400 if id is invalid or body is empty, 401 if user isn't authorized.
 * - Returns: { _id: string, name: string }
 */
const updateAuthor = asyncHandler(async (req, res) => {
  if (req.user.accountType != "admin") {
    res.status(401);
    throw new Error("Unauthorized");
  }

  // Block bad requests
  if (!req.params.id.match(/[\w\d]{24}/)) {
    res.status(400);
    throw new Error("Bad request. ID is invalid.");
  }

  if (!req.body || !req.body.name) {
    res.status(400);
    throw new Error("Bad request. Didn't specify new name of author.");
  }

  // Deny if that name is already taken. Because they should tell their parents to rename them, right?
  // I was named Maria you better change your legal name to Mario dude.
  if (await Author.exists({ name: req.body.name })) {
    res.status(400);
    throw new Error("Bad request. That name is already taken.");
  }

  // Update user's pen name.
  const doc = await Author.findOneAndUpdate(
    { _id: req.params.id },
    { name: req.body.name },
    { returnDocument: "after" },
  );
  return res.status(200).json({ _id: doc._id, name: doc.name });
});

/**
 * DELETE /api/authors/:id
 *
 * - Access: admins only
 * - Status: 200 if succeeds, 400 if id invalid, 401 if not authorized.
 * - Returns: { _id: string, name: string }
 */
const deleteAuthor = asyncHandler(async (req, res) => {
  if (req.user.accountType != "admin") return res.status(401).json({ message: "Unauthorized" });

  // Block bad requests
  if (!req.params.id.match(/[\w\d]{24}/)) return res.status(400).json({ message: "Bad request. ID is invalid." });

  if (!(await Author.exists({ _id: req.params.id }))) {
    res.status(400);
    throw new Error("Bad request. No author exists with that ID.");
  }

  // delete author's mangas
  await deleteAllMangas(req.params.id);

  // Delete author and remove approved status.
  const doc = await Author.findOneAndDelete({ _id: req.params.id });
  return res.status(200).json({ _id: doc._id, name: doc.name });
});

module.exports = { getAuthors, uploadAuthor, updateAuthor, deleteAuthor };
