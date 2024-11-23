const asyncHandler = require('express-async-handler');
const Chapter = require('../models/chapterModel');
const Manga = require('../models/mangaModel');
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

    const chapter = await Chapter.findOne({ manga: req.params.id, number: req.params.chapterNumber });
    res.status(200).json(chapter);
});

// @description get chapter's list
// @route GET /api/mangas/:id/chapters
// @access public
const getChapterList = asyncHandler(async (req, res) => {
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

    const count = await Chapter.countDocuments();
    const total_pages = Math.ceil(count / per_page);
    page = Math.min(page, total_pages);
    page = Math.max(page, 1);
    const skip = (page - 1) * per_page;

    const chapters = await Chapter.find({ manga: req.params.id })
        .skip(skip)
        .limit(per_page)
        .select('_id title number');
        
    res.status(200).json({
        chapters: chapters,
        page: page,
        per_page: per_page,
        total_pages: total_pages,
        total: count,
    });
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
    if (!req.body.number || req.body.number < 0 || !req.body.images || req.body.images.length === 0) {
        res.status(400);
        throw new Error("Invalid chapter number / Where my images?");
    }

    let chapter = await Chapter.findOne({ manga: manga.id, number: req.body.number });
    // if chapter exists, append the images
    if (chapter) {
        // upload images to cloud
        const urls = await cloudinaryWrapper.uploadImages(req.body.images, `${manga.id}/${req.body.number}`);
        chapter.images = [...chapter.images, ...urls];
    }
    // if chapter doesn't exist, create one
    else {
        chapter = await Chapter.create({
            manga: manga.id,
            number: req.body.number,
            title: req.body.title ? req.body.title : 'No title'
        });
        // upload images to cloud
        const urls = await cloudinaryWrapper.uploadImages(req.body.images, `${manga.id}/${req.body.number}`);
        chapter.images = urls;
    }

    chapter.updatedAt = new Date(0);
    await chapter.save();

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

    if (req.body.images && req.body.images.length > 0) {
        updated = true;
        await cloudinaryWrapper.deleteImages(`${manga.id}/${chapter.number}`);
        chapter.images = await cloudinaryWrapper.uploadImages(req.body.images, `${manga.id}/${chapter.number}`);
    }

    if (updated) {
        manga.updatedAt = new Date(0);
        await chapter.save();
        await manga.save();
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
    manga.updatedAt = new Date(0);
    await manga.save();
    res.status(200).json({ manga: manga.id, chapterNumber: chapter.number });
});

const deleteAllChapters = asyncHandler(async (mangaID) => {
    const chapters = await Chapter.find({ manga: mangaID });
    if (chapters.length === 0) {
        return;
    }

    // delete chapters info in the database
    for (let chapter of chapters) {
        await chapter.deleteOne();
    }
});

module.exports = {
    getChapter,
    getChapterList,
    uploadChapter,
    updateChapter,
    deleteChapter,
    deleteAllChapters,
};