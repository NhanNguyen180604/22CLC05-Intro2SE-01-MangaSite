const express = require("express");
const router = express.Router();
const { getAuthor, uploadAuthor, updateAuthor, deleteAuthor } = require("../controllers/authorController");
const { authorize } = require("../middlewares/authMiddleware");

router.route("/").get(getAuthor).post(authorize, uploadAuthor);
router.route("/:id").put(authorize, updateAuthor).delete(authorize, deleteAuthor);

module.exports = router;
