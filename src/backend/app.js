const express = require("express");
const cors = require("cors");
require("dotenv").config();
const fileUpload = require("express-fileupload");

const db = require("./db/db");

// If not in testing environment, connect to DB.
// Otherwise, let the test files determine when to connect.
if (!process.env.VITEST) db.connectDB();

const errorHandler = require("./middlewares/errorMiddleware");

const mangaRoutes = require("./routes/mangaRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const authorRoutes = require("./routes/authorRoutes");
const reportRoutes = require("./routes/reportRoutes");
const userRoutes = require("./routes/userRoutes");
const searchRoutes = require("./routes/searchRoutes");
const userModel = require("./models/userModel");
const { hashSync } = require("bcryptjs");
const authorModel = require("./models/authorModel");
const categoryModel = require("./models/categoryModel");
const mangaModel = require("./models/mangaModel");
const reportModel = require("./models/reportModel");
const commentModel = require("./models/commentModel");

// initialize app
const app = express();

// add middlewares
app.use(express.json({ limit: "150mb" }));
app.use(express.urlencoded({ extended: false, limit: "5mb" }));
app.use(cors());
app.use(
  fileUpload({
    limits: {
      fileSize: 30 * 1024 * 1024, // 30 MiB
    },
  })
);

// routing, order matters
app.use("/api/mangas", mangaRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/authors", authorRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);
app.use("/api/search", searchRoutes);

// app.get("/fake", async (req, res) => {
//   await Promise.all([
//     userModel.deleteMany(),
//     mangaModel.deleteMany(),
//     authorModel.deleteMany(),
//     reportModel.deleteMany(),
//     categoryModel.deleteMany(),
//     commentModel.deleteMany(),
//   ]);

//   const users = require("./data/fake_users.json");
//   const createdUsers = await userModel.insertMany(users.map((it) => ({ ...it, password: hashSync(it.password) })));

//   const authors = require("./data/fake_authors.json");
//   await authorModel.insertMany(authors);

//   const categories = require("./data/fake_categories.json");
//   await categoryModel.insertMany(categories);

//   async function getUser(name) {
//     return await userModel.findOne({ name });
//   }

//   async function mapAuthorsToId(...names) {
//     return (await authorModel.find({ name: { $in: names } }).select("_id")).map((node) => node._id);
//   }

//   async function mapCategoriesToId(...names) {
//     return (await categoryModel.find({ name: { $in: names } }).select("_id")).map((node) => node._id);
//   }

//   const mangas = require("./data/fake_mangas.json");
//   const parsedMangas = await Promise.all(
//     mangas.map(async (manga) => {
//       const a = {
//         ...manga,
//         authors: await mapAuthorsToId(...manga.authors),
//         categories: await mapCategoriesToId(...manga.categories),
//         uploader: (await getUser(manga.uploader[0]))._id,
//       };
//       return a;
//     })
//   );
//   const createdMangas = await mangaModel.insertMany(parsedMangas);

//   const reports = [
//     {
//       informant: createdUsers[0]._id,
//       description: "Art is too cute",
//       manga: await mangaModel.findOne({ name: "Shattered" }),
//     },
//     {
//       informant: createdUsers[1]._id,
//       description: "Bro this isn't Yoshi this is tax evasion guide",
//       manga: await mangaModel.findOne({ name: "Yoshi Yoshi Yoshi YOSH!" }),
//     },
//   ];
//   await reportModel.insertMany(reports);

//   res.status(200).json({});
// });

// handle error
app.use(errorHandler);

// THIS IS MANDATORY!
// WITHOUT THIS, SUPERTEST WON'T RUN.
// My bad, I put export default lol, forgor.
module.exports = app;
