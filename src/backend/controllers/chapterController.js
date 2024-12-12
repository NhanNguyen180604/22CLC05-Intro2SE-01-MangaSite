const asyncHandler = require('express-async-handler');
const Chapter = require('../models/chapterModel');
const Manga = require('../models/mangaModel');
const MangaNoti = require('../models/mangaNotificationModel');
const cloudinaryWrapper = require('../others/cloudinaryWrapper');

// @description get a chapter by number
// @route GET /api/mangas/:id/chapters/:chapterNumber
// @access public
const getChapter = asyncHandler(async (req, res) => {
    // check valid id
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400);
        throw new Error("Invalid ID");
    }

    const chapter = await Chapter.findOne({ manga: req.params.id, number: req.params.chapterNumber })
        .populate({ path: 'manga', model: 'Manga', select: 'name canComment' });
    res.status(200).json(chapter);
});

// @description get chapter's list
// @route GET /api/mangas/:id/chapters
// @access public
const getChapterList = asyncHandler(async (req, res) => {
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

    if (req.query.all === 'true') {
        const chapters = await Chapter.find({ manga: manga.id })
            .sort({ number: 1 });

        return res.status(200).json({
            chapters: chapters,
            page: 1,
            per_page: chapters.length,
            total_pages: 1,
            total: chapters.length,
        });
    }

    let page = req.query.page ? parseInt(req.query.page) : 1;
    const per_page = req.query.per_page ? parseInt(req.query.per_page) : 20;

    // Validation.
    if (Number.isNaN(page) || !Number.isSafeInteger(page) || page <= 0) {
        res.status(400);
        throw new Error("Bad Request: Invalid query page.");
    }

    if (Number.isNaN(per_page) || !Number.isSafeInteger(per_page) || per_page <= 0) {
        res.status(400);
        throw new Error("Bad Request: Invalid query per_page.");
    }

    const count = await Chapter.countDocuments({ manga: manga.id });
    const total_pages = Math.ceil(count / per_page);
    page = Math.min(page, total_pages);
    page = Math.max(page, 1);
    const skip = (page - 1) * per_page;

    const chapters = await Chapter.find({ manga: manga.id })
        .sort({ number: 1 })
        .skip(skip)
        .limit(per_page);

    res.status(200).json({
        chapters: chapters,
        page: page,
        per_page: per_page,
        total_pages: total_pages,
        total: count,
    });
});

// @description get chapter number list
// @route GET /api/mangas/:id/chapters/numbers
// @access public
const getAllChapterNumbers = asyncHandler(async (req, res) => {
    let chapters = await Chapter.find();
    res.status(200).json(chapters.map(chapter => chapter.number).sort((a, b) => a - b));
});

// @description get chapter's list
// @route POST /api/mangas/:id/chapters
// @access approved user only, require token
const uploadChapter = asyncHandler(async (req, res) => {
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

    // check uploader
    if (manga.uploader.toString() !== req.user.id) {
        res.status(401);
        throw new Error("Not authorized to upload the chapter");
    }

    // check body
    if (!req.body.number || req.body.number < 0) {
        res.status(400);
        throw new Error("Invalid chapter number");
    }

    if (!req.files || !req.files.images) {
        res.status(400);
        throw new Error("Please upload images");
    }

    let uploadedFiles = req.files.images;
    if (!Array.isArray(uploadedFiles))
        uploadedFiles = [uploadedFiles];

    let chapter = await Chapter.findOne({ manga: manga.id, number: req.body.number });
    // if chapter exists
    if (chapter) {
        // upload images to cloud
        res.status(400);
        throw new Error("Chapter already exists");
    }

    chapter = await Chapter.create({
        manga: manga.id,
        number: req.body.number,
        title: req.body.title ? req.body.title : 'No title'
    });
    // upload images to cloud
    const urls = await cloudinaryWrapper.uploadImages(uploadedFiles.map(file => file.data), `${manga.id}/${req.body.number}`);
    chapter.images = urls;


    chapter.updatedAt = new Date();
    await chapter.save();

    const mangaNoti = await MangaNoti.create({
        manga: chapter.manga,
        message: `${updatedManga.name}, chapter ${chapter.number} just got uploaded`,
        createdAt: new Date(),
    });

    res.status(200).json(chapter);
});

// @description update/replace a chapter
// @route PUT /api/mangas/:id/chapters/:chapterNumber
// @access uploader only, require token
const updateChapter = asyncHandler(async (req, res) => {
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

    // check uploader
    if (manga.uploader.toString() !== req.user.id) {
        res.status(401);
        throw new Error("Not authorized to update the chapter");
    }

    // check if chapter exists
    const chapter = await Chapter.findOne({ manga: manga.id, number: req.params.chapterNumber });
    if (!chapter) {
        res.status(404);
        throw new Error("Chapter not found");
    }

    let updated = false;

    if (req.body.title) {
        updated = true;
        chapter.title = req.body.title;
    }

    if (req.files && req.files.images) {
        updated = true;
        let uploadedFiles = req.files.images;
        if (!Array.isArray(uploadedFiles))
            uploadedFiles = [uploadedFiles];

        await cloudinaryWrapper.deleteByPrefix(`${manga.id}/${chapter.number}`);
        chapter.images = await cloudinaryWrapper.uploadImages(uploadedFiles.map(file => file.data), `${manga.id}/${chapter.number}`);
    }

    if (updated) {
        manga.updatedAt = new Date();
        await chapter.save();
        await manga.save();

        // create notification
        const mangaNoti = await MangaNoti.create({
            manga: manga.id,
            message: `${manga.name}, chapter ${chapter.number} just got updated`,
            createdAt: new Date(),
        });

        res.status(200).json(chapter);
    }
    else {
        res.status(400);
        throw new Error("Didnt specify new title / new images");
    }
});

// @description delete a chapter
// @route DELETE /api/mangas/:id/chapters/:chapterNumber
// @access uploader/admin only, require token
const deleteChapter = asyncHandler(async (req, res) => {
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
    if (manga.uploader.toString() !== req.user.id && req.user.accountType !== 'admin') {
        res.status(401);
        throw new Error("Not authorized to delete the chapter");
    }

    // check if chapter exists
    const chapter = await Chapter.findOne({ manga: manga.id, number: req.params.chapterNumber });
    if (!chapter) {
        res.status(404);
        throw new Error("Chapter not found");
    }

    await cloudinaryWrapper.deleteImages(`${manga.id}/${chapter.number}`);

    await chapter.deleteOne();
    manga.updatedAt = new Date();
    await manga.save();
    res.status(200).json({ manga: manga.id, chapterNumber: chapter.number });
});

module.exports = {
    getChapter,
    getChapterList,
    getAllChapterNumbers,
    uploadChapter,
    updateChapter,
    deleteChapter,
};