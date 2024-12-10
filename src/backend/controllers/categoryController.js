const expressAsyncHandler = require("express-async-handler");
const Category = require("../models/categoryModel");
const { z } = require("zod");

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
  if (req.query.all === 'true'){
    const allCategories = await Category.find();
    return res.status(200).json(allCategories);
  }
  
  const schema = z.object({
    page: z.coerce.number().int().positive().safe().default(1),
    per_page: z.coerce.number().int().positive().safe().default(20),
  });

  const result = schema.safeParse(req.query);
  if (result.error) {
    res.status(400);
    throw new Error(`Invalid query ${result.error.issues[0].path}: ${result.error.issues[0].message}`);
  }

  const { page, per_page } = result.data;
  const total = await Category.countDocuments({});
  const totalPages = Math.ceil(total / per_page);
  const query = await Category.find({})
    .skip(per_page * (page - 1))
    .limit(per_page);

  return res.status(200).json({
    categories: query,
    page,
    per_page,
    total_pages: totalPages,
    total,
  });
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
