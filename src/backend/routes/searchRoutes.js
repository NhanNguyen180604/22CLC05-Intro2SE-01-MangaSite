const express = require("express");
const { searchHandler } = require("../controllers/searchController");
const { checkUser } = require("../middlewares/authMiddleware");
const router = express.Router();

router.route("/").get(checkUser, searchHandler);

module.exports = router;
