const asyncHandler = require("express-async-handler");
const Author = require("../models/authorModel");
const { deleteAllMangas } = require("./mangaController");
const { z } = require("zod");

/**
 * GET /api/authors: get all victims as a list.
 *
 * Query:
 * - Page (number): the page number.
 * - Per page (number): number of authors per page.
 */
const getAuthors = asyncHandler(async (req, res) => {
  if (req.query.all === 'true'){
    const allAuthors = await Author.find();
    return res.status(200).json(allAuthors);
  }

  const schema = z.object({
    page: z.coerce.number().int().positive().safe().default(1),
    per_page: z.coerce.number().int().positive().safe().default(20),
  });
  const result = schema.safeParse(req.query);
  if (result.error) {
    res.status(400);
    throw new Error(`Bad request. Invalid query ${result.error.issues[0].path}`);
  }

  const total = await Author.countDocuments();
  const totalPages = Math.ceil(total / result.data.per_page);
  const page = result.data.page > totalPages ? totalPages : result.data.page;
  const body = await Author.find()
    .skip((page - 1) * result.data.per_page)
    .limit(result.data.per_page)
    .select("_id name");

  return res.status(200).json({
    authors: body,
    page,
    per_page: result.data.per_page,
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
 * PUT /api/authors/:id, update a victim's name.
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
  const doc = await Author.findOneAndUpdate({ _id: req.params.id }, { name: req.body.name }, { returnDocument: "after" });
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

  let doc;
  try {
    doc = await Author.findById(req.params.id);
  } catch (castError) {
    res.status(400);
    throw new Error("Bad request. Invalid ID");
  }

  if (doc == null) {
    res.status(400);
    throw new Error("Bad request. ID not found.");
  }

  // delete author's mangas
  await deleteAllMangas(req.params.id);

  // Delete author and remove approved status.
  const newDoc = await Author.findOneAndDelete({ _id: req.params.id });
  return res.status(200).json({ _id: newDoc._id, name: newDoc.name });
});

module.exports = { getAuthors, uploadAuthor, updateAuthor, deleteAuthor };
