const asyncHandler = require('express-async-handler');
const Rating = require('../models/ratingModel');
const Manga = require('../models/mangaModel');
const User = require('../models/userModel');

// @description get all ratings of a manga
// @route GET /api/mangas/:id/ratings
// @access public
const getRatings = asyncHandler(async (req, res) => {
    // check valid id
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400);
        throw new Error("Invalid ID");
    }

    // check if manga exists
    const manga = await Manga.findById(req.params.id);
    if (!manga) {
        res.status(404);
        throw new Error("Manga not found");
    }

    const ratings = await Rating.find({ manga: manga.id })
        .select('score');

    res.status(200).json(ratings);
});

// @description get a rating of a user for a manga
// @route GET /api/mangas/:id/ratings/one
// @access require token
const getOneRating = asyncHandler(async (req, res) => {
    // check valid id
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400);
        throw new Error("Invalid ID");
    }

    // check if manga exists
    const manga = await Manga.findById(req.params.id);
    if (!manga) {
        res.status(404);
        throw new Error("Manga not found");
    }

    let rating = await Rating.findOne({ manga: manga.id, user: req.user.id });
    if (!rating) {
        res.status(404).json({ message: "You have not rated this manga yet" });
    }
    else res.status(200).json(rating);
});

// @description send rating to a manga, update a rating if it already exists
// @route POST /api/mangas/:id/ratings
// @access require token
const sendRating = asyncHandler(async (req, res) => {
    // check valid id
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400);
        throw new Error("Invalid ID");
    }

    let ratingScore;
    if (!req.body.score) {
        res.status(400);
        throw new Error("Lacking rating score");
    }
    else {
        ratingScore = parseInt(req.body.score);
        if (Number.isNaN(ratingScore) || !Number.isSafeInteger(ratingScore) || ratingScore < 1 || ratingScore > 5) {
            res.status(400);
            throw new Error("Invalid rating score");
        }
    }

    // check if manga exists
    const manga = await Manga.findById(req.params.id);
    if (!manga) {
        res.status(404);
        throw new Error("Manga not found");
    }

    // check if rating exists
    let rating = await Rating.findOne({ manga: manga.id, user: req.user.id });
    if (rating) {
        rating.score = ratingScore;
        await rating.save();
    }
    else {
        rating = await Rating.create({
            manga: manga.id,
            user: req.user.id,
            score: ratingScore,
        });
    }

    res.status(200).json(rating);
});

module.exports = {
    getRatings,
    getOneRating,
    sendRating
}