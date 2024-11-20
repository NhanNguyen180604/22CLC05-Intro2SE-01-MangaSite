const express = require("express");
const { authorize } = require("../middlewares/authMiddleware");
const { getCategories, uploadCategory } = require("../controllers/categoryController");

const router = express.Router();

router.route("/").get(getCategories).post(authorize, uploadCategory);

module.exports = router;
