const express = require("express");
const { authorize } = require("../middlewares/authMiddleware");
const { getCategories, uploadCategory, updateCategory, deleteCategory } = require("../controllers/categoryController");

const router = express.Router();

router.route("/").get(getCategories).post(authorize, uploadCategory);
router.route("/:id").put(authorize, updateCategory).delete(authorize, deleteCategory)

module.exports = router;
