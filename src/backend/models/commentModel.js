const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    manga: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Manga",
      required: true,
    },
    chapter: {
      type: Number,
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models["Comment"] || mongoose.model("Comment", commentSchema);
