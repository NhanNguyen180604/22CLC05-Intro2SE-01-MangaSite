const asyncHandler = require('express-async-handler');
const Cover = require('../models/coverModel');
const Manga = require('../models/mangaModel');
const cloudinaryWrapper = require('../others/cloudinaryWrapper');

// @description get a manga's covers, excluding the default cover
// @route GET /api/mangas/:id/covers
// @access public
const getCovers = asyncHandler(async (req, res) => {
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

    const covers = await Cover.find({ manga: manga.id })
        .sort({ number: 1 })
        .select('-manga -imagePublicID');
    res.status(200).json(covers);
});

const getDefaultCover = asyncHandler(async (req, res) => {
    res.status(200).json(process.env.DEFAULT_COVER);
});

// @description upload a cover to the cover gallery of a manga
// @route POST /api/mangas/:id/covers
// @access uploader only, require token
const uploadCover = asyncHandler(async (req, res) => {
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

    // check permission
    if (req.user.id !== manga.uploader.toString()) {
        res.status(401);
        throw new Error("Not authorize to upload cover");
    }

    if (!req.body.number) {
        res.status(400);
        throw new Error("Need a number for cover");
    }

    if (!req.files || !req.files.image) {
        res.status(400);
        throw new Error("No cover image to upload");
    }

    let uploadedFile = req.files.image;

    // check if cover exists
    let cover = await Cover.findOne({ manga: manga.id, number: req.body.number });
    if (cover) {
        res.status(400);
        throw new Error("Cover already exists");
    }

    const [publicID, url] = await cloudinaryWrapper.uploadSingleImage(uploadedFile.data, `${manga.id}/cover`);
    cover = await Cover.create({
        manga: manga.id,
        number: req.body.number,
        imageURL: url,
        imagePublicID: publicID,
    });
    res.status(200).json(cover);
});

// @description change a manga's cover, use this function after uploading a new cover
// @route PUT /api/mangas/:id/covers/:coverNumber
// @access uploader only, require token
const changeCover = asyncHandler(async (req, res) => {
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

    // check permission
    if (req.user.id !== manga.uploader.toString()) {
        res.status(401);
        throw new Error("Not authorize to upload cover");
    }

    const cover = await Cover.findOne({ manga: manga.id, number: req.params.coverNumber });
    if (!cover) {
        res.status(404);
        throw new Error("Cover doesn't exist");
    }

    manga.cover = cover.imageURL;
    await manga.save();
    res.status(200).json({
        mangaID: manga.id,
        cover: manga.cover
    });
});

// @description delete a manga's cover
// @route DELETE /api/mangas/:id/covers/:coverNumber
// @access uploader/admin only, require token
const deleteCover = asyncHandler(async (req, res) => {
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

    // check permission
    if (req.user.id !== manga.uploader.toString() && req.user.accountType !== 'admin') {
        res.status(401);
        throw new Error("Not authorize to upload cover");
    }

    const cover = await Cover.findOne({ manga: manga.id, number: req.params.coverNumber });
    if (!cover) {
        res.status(404);
        throw new Error("Cover doesn't exist");
    }

    if (manga.cover === cover.imageURL) {
        manga.cover = process.env.DEFAULT_COVER;
        await manga.save();
    }

    await cloudinaryWrapper.deleteResources([cover.imagePublicID]);
    await cover.deleteOne();
    res.status(200).json({ number: req.params.coverNumber, publicID: cover.imagePublicID });
});

module.exports = {
    getCovers,
    getDefaultCover,
    uploadCover,
    changeCover,
    deleteCover
};