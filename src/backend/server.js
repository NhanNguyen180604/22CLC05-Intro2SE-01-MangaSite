const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./db/db');
const errorHandler = require('./middlewares/errorMiddleware');

const example1Routes = require('./routes/example1Routes');
const example2Routes = require('./routes/example2Routes');

const port = process.env.PORT || 3000;

connectDB();

// initialize app
const app = express();

// add middlewares
app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ extended: false, limit: '5mb' }));
app.use(cors());

// routing, order matters
app.use('/api/example1', example1Routes);
app.use('/api/example2', example2Routes);

// handle error
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server starts on port ${port}`);
});