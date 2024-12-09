const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    informant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    manga: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Manga",
    },
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
    processed: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
