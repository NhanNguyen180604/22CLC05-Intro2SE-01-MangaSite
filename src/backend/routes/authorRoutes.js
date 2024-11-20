const express = require("express");
const router = express.Router();
const { getAuthors, uploadAuthor, updateAuthor, deleteAuthor } = require("../controllers/authorController");
const { authorize } = require("../middlewares/authMiddleware");

router.route("/").get(getAuthors).post(authorize, uploadAuthor);
router.route("/:id").put(authorize, updateAuthor).delete(authorize, deleteAuthor);

module.exports = router;
