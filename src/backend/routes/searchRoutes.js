const express = require("express");
const { searchHandler } = require("../controllers/searchController");
const router = express.Router();

router.route("/").get(searchHandler);

module.exports = router;
