const asyncHandler = require('express-async-handler');

const get1 = asyncHandler(async (req, res) => {
    res.status(200).json({ message: 'GET /api/example1' });
});

const post1 = asyncHandler(async (req, res) => {
    res.status(200).json({ message: 'POST /api/example1' });
});

const getLmao = asyncHandler(async (req, res) => {
    res.status(200).json({ message: 'GET /api/example1/lmao' });
});

const postLmao = asyncHandler(async (req, res) => {
    res.status(200).json({ message: 'POST /api/example1/lmao' });
});

module.exports = { get1, post1, getLmao, postLmao };