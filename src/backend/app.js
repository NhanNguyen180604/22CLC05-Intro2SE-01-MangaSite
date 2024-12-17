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

// handle error
app.use(errorHandler);

// THIS IS MANDATORY!
// WITHOUT THIS, SUPERTEST WON'T RUN.
// My bad, I put export default lol, forgor.
module.exports = app;
