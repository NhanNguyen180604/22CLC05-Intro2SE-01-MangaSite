const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./db/db');
connectDB();

const errorHandler = require('./middlewares/errorMiddleware');

const mangaRoutes = require('./routes/mangaRoutes');

const port = process.env.PORT || 3000;

// initialize app
const app = express();

// add middlewares
app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ extended: false, limit: '5mb' }));
app.use(cors());

// routing, order matters
app.use('/api/mangas', mangaRoutes);

// handle error
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server starts on port ${port}`);
});