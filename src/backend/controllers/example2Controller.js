const asyncHandler = require('express-async-handler');

const get1 = asyncHandler(async (req, res) => {
    res.status(200).json({ message: 'GET /api/example2' });
});

const getID = asyncHandler(async (req, res) => {
    res.status(200).json({ message: `GET /api/example2/${req.params.id}` });
});

const postID = asyncHandler(async (req, res) => {
    res.status(200).json({ message: `POST /api/example2/${req.params.id}` });
});

module.exports = { get1, getID, postID };