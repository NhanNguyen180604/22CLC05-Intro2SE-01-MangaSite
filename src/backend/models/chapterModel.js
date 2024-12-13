const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema({
  manga: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Manga",
    required: true,
  },
  number: {
    type: Number,
    required: true,
    min: 0,
  },
  title: {
    type: String,
    required: true,
    default: "",
  },
  images: [
    {
      publicID: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
      _id: false,
    },
  ],
});

chapterSchema.index({ manga: 1, number: 1 }, { unique: true });

module.exports =
  mongoose.models["Chapter"] || mongoose.model("Chapter", chapterSchema);
