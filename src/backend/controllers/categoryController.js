const expressAsyncHandler = require("express-async-handler");
const Category = require("../models/categoryModel");

/**
 * Get all categories
 *
 * - Route: GET /api/categories
 * - Access: public
 * - Query: page (number), per_page (number)
 * - Status: 200 if success, 400 if bad request.
 * - Returns { categories: {_id, name}[], page, per_page, total_pages, total }
 */
const getCategories = expressAsyncHandler(async (req, res) => {
  let page = req.query.page ? parseInt(req.query.page) : 1;
  const perPage = req.query.per_page ? parseInt(req.query.per_page) : 20;

  // Validation.
  if (Number.isNaN(page) || !Number.isSafeInteger(page) || page <= 0) {
    res.status(400);
    throw new Error("Bad Request: Invalid query page.");
  }

  if (Number.isNaN(perPage) || !Number.isSafeInteger(perPage) || perPage <= 0) {
    res.status(400);
    throw new Error("Bad Request: Invalid query per_page.");
  }

  const total = await Category.countDocuments({});
  const totalPages = Math.ceil(total / perPage);
  const query = await Category.find({})
    .skip(perPage * (page - 1))
    .limit(perPage);

  return res.status(200).json({ categories: query, page, per_page: perPage, total_pages: totalPages, total });
});

/**
 * Upload a category.
 *
 * - Route: POST /api/categories
 * - Access: admins
 * - Accepts: { name: string }
 * - Status: 200 success, 400 body invalid, 401 unauthorized
 * - Returns: { _id: string, name: string }
 */
const uploadCategory = expressAsyncHandler(async (req, res) => {
  if (req.user.accountType != "admin") {
    res.status(401);
    throw new Error("Unauthorized access");
  }

  if (!req.body.name) {
    res.status(400);
    throw new Error("Bad Request: No name specified.");
  }

  const query = await Category.exists({ name: req.body.name });
  if (query != null) {
    res.status(400);
    throw new Error("Bad Request: That name is already taken.");
  }

  const created = await Category.create({ name: req.body.name });
  return res.status(200).json({ _id: created._id, name: created.name });
});

module.exports = { getCategories, uploadCategory };
