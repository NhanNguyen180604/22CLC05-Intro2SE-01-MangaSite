const expressAsyncHandler = require("express-async-handler");
const z = require("zod");
const Manga = require("../models/mangaModel");
const { default: mongoose } = require("mongoose");

function escapeRegex(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * GET /api/search: Searches.
 *
 * Access Level: 0
 * Accepts params:
 * - q: Titles query
 * - include_categories: Include queries, string separated by commas
 * - exclude_categories: Exclude queries, string separated by commas.
 * - include_authors: Include authors ID, string separated by commas.
 * - exclude_authors: Exclude authors ID, string separated by commas.
 * - page: Page number
 * - per_page: Number of mangas per page
 */
const searchHandler = expressAsyncHandler(async (req, res) => {
  const schema = z.object({
    q: z.string().min(1, "Query is not optional"),
    include_categories: z
      .string()
      .regex(/^\w(,\w)*$/, "Must be a string separated by commas")
      .optional()
      .default(""),
    exclude_categories: z
      .string()
      .regex(/^\w(,\w)*$/, "Must be a string separated by commas")
      .optional()
      .default(""),
    include_authors: z
      .string()
      .regex(/^\w(,\w)*$/, "Must be a string separated by commas")
      .optional()
      .default(""),
    exclude_authors: z
      .string()
      .regex(/^\w(,\w)*$/, "Must be a string separated by commas")
      .optional()
      .default(""),
    page: z.number().int("Must be an integer").min(1, "Must be greater than 0").optional().default(1),
    per_page: z.number().int("Must be an integer").min(1, "Must be greater than 0").optional.default(20),
  });
  const parsed = schema.safeParse(req.query);

  console.log(parsed.success, parsed.data);
  if (!parsed.success) {
    res.status(400);
    throw new Error(parsed.error.issues[0].message);
  }

  const results = await Manga.aggregate([
    {
      $match: {
        authors: {
          $in: parsed.data.include_authors.split(",").map(mongoose.Schema.Types.ObjectId),
          $nin: parsed.data.exclude_authors.split(",").map(mongoose.Schema.Types.ObjectId),
        },
        name: {
          $regex: RegExp(escapeRegex(parsed.data.q), "i"),
        },
      },
    },
    {
      $lookup: {
        from: "Category",
        localField: "categories",
        foreignField: "_id",
        as: "categoryDetails",
      },
    },
    {
      $match: {
        "categoryDetails.name": {
          $in: parsed.data.include_categories.split(",").map(mongoose.Schema.Types.ObjectId),
          $nin: parsed.data.exclude_categories.split(",").map(mongoose.Schema.Types.ObjectId),
        },
      },
    },
    {
      $facet: {
        counting: [
          {
            $count: "count",
          },
        ],
        results: [
          {
            $skip: (parsed.data.page - 1) * parsed.data.per_page,
            $limit: parsed.data.per_page,
          },
        ],
      },
    },
  ]);

  const totalCount = results[0].counting[0]?.count || 0; // Get total count (handle if no matches)
  const paginatedResults = results[0].results;

  res.status(200).json({
    page: parsed.data.page,
    per_page: parsed.data.per_page,
    total_pages: Math.ceil(totalCount / parsed.data.per_page),
    total: totalCount,
    mangas: paginatedResults,
  });
});

module.exports = { searchHandler };
