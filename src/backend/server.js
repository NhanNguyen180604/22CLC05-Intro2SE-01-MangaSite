const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./db/db');

connectDB();

const port = process.env.PORT | 3000;
const app = express();

app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ extended: false, limit: '5mb' }));
app.use(cors);

app.listen(port, () => {
    console.log(`Server starts on port ${port}`);
});