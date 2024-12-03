const expressAsyncHandler = require("express-async-handler");
const z = require("zod");
const Manga = require("../models/mangaModel");
const Category = require("../models/categoryModel");

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
    q: z.string(),
    include_categories: z
      .string()
      .regex(/^(\w+(,\w+)*)?$/, "Must be a string separated by commas")
      .optional()
      .default("")
      .transform((arg) => (arg.trim() != "" ? arg.trim().split(",") : [])),
    exclude_categories: z
      .string()
      .regex(/^(\w+(,\w+)*)?$/, "Must be a string separated by commas")
      .optional()
      .default("")
      .transform((arg) => (arg.trim() != "" ? arg.trim().split(",") : [])),
    include_authors: z
      .string()
      .regex(/^(\w+(,\w+)*)?$/, "Must be a string separated by commas")
      .optional()
      .default("")
      .transform((arg) => (arg.trim() != "" ? arg.trim().split(",") : [])),
    exclude_authors: z
      .string()
      .regex(/^(\w+(,\w+)*)?$/, "Must be a string separated by commas")
      .optional()
      .default("")
      .transform((arg) => (arg.trim() != "" ? arg.trim().split(",") : [])),
    page: z.coerce.number().int("Must be an integer").min(1, "Must be greater than 0").default(1),
    per_page: z.coerce.number().int("Must be an integer").min(1, "Must be greater than 0").default(20),
  });
  const parsed = schema.safeParse(req.query);

  if (!parsed.success) {
    res.status(400);
    throw new Error(`${parsed.error.issues[0].path}: ${parsed.error.issues[0].message}`);
  }

  // Pipeline for authors.
  const authorPipeline = {
    ...(parsed.data.include_authors.length > 0 && { $in: parsed.data.include_authors }),
    ...(parsed.data.exclude_authors.length > 0 && { $nin: parsed.data.exclude_authors }),
  };

  // Pipeline for categories
  const categoryPipeline = {
    ...(parsed.data.include_categories.length > 0 && { $in: parsed.data.include_categories }),
    ...(parsed.data.exclude_categories.length > 0 && { $nin: parsed.data.exclude_categories }),
  };

  // If they're logged in and have a user's blacklist.
  let userPipeline = {};
  if (req.user) {
    const blacklist = req.user.blacklist;
    if (blacklist.categories.length > 0) userPipeline.categories = { $nin: blacklist.categories };
    if (blacklist.authors.length > 0) userPipeline.authors = { $nin: blacklist.authors };
  }

  const results = await Manga.aggregate()
    .match(userPipeline)
    .match(Object.keys(authorPipeline).length > 0 ? { authors: authorPipeline } : {})
    .match({ name: { $regex: RegExp(escapeRegex(parsed.data.q), "i") } })
    .lookup({ from: "categories", localField: "categories", foreignField: "_id", as: "categories" })
    .match(Object.keys(categoryPipeline).length > 0 ? { "categories.name": categoryPipeline } : {})
    .facet({
      counting: [{ $count: "count" }],
      results: [{ $skip: (parsed.data.page - 1) * parsed.data.per_page }, { $limit: parsed.data.per_page }],
    });
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
