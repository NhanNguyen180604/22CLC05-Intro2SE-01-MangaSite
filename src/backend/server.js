const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./db/db");
connectDB();

const errorHandler = require("./middlewares/errorMiddleware");

const mangaRoutes = require("./routes/mangaRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const authorRoutes = require("./routes/authorRoutes");
const reportRoutes = require("./routes/reportRoutes");

const port = process.env.PORT || 3000;

// initialize app
const app = express();

// add middlewares
app.use(express.json({ limit: "150mb" }));
app.use(express.urlencoded({ extended: false, limit: "5mb" }));
app.use(cors());

// routing, order matters
app.use("/api/mangas", mangaRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/authors", authorRoutes);
app.use("/api/reports", reportRoutes);

// handle error
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server starts on port ${port}`);
});
