const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Manga = require('../models/mangaModel');
const Chapter = require('../models/chapterModel');
const Cover = require('../models/coverModel');
const ReadingHistory = require('../models/readingHistoryModel');
const Comment = require('../models/commentModel');
const MangaNoti = require('../models/mangaNotificationModel');
const Report = require('../models/reportModel');
const cloudinaryWrapper = require('../others/cloudinaryWrapper');
const { deleteByPrefix, deleteFolder } = require('../others/cloudinaryWrapper');

// @description get all mangas, filtered by user's blacklist
// @route GET /api/mangas
// @access public
const getMangas = asyncHandler(async (req, res) => {
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

    // if user is logged in, check their blacklist
    let filter = {};
    if (req.user) {
        if (req.user.blacklist.categories.length > 0) {
            filter.categories = { $nin: req.user.blacklist.categories };
        }

        if (req.user.blacklist.authors.length > 0) {
            filter.authors = { $nin: req.user.blacklist.authors };
        }
    }

    const count = await Manga.countDocuments(filter);
    const total_pages = Math.ceil(count / per_page);
    page = Math.min(page, total_pages);
    page = Math.max(page, 1);
    const skip = (page - 1) * per_page;
    let mangas;

    if (req.query.type === 'top-rating' || req.query.type === 'recently-updated') {
        const sortField = req.query.type === 'top-rating' ? 'overallRating' : 'updatedAt';
        const sortOrder = req.query.type === 'top-rating' ? 1 : -1;
        mangas = await Manga.aggregate([
            { $match: filter },
            { $sort: { [sortField]: sortOrder } },
            { $skip: skip },
            { $limit: per_page },
            {
                $lookup: {
                    from: 'authors',
                    localField: 'authors',
                    foreignField: '_id',
                    as: 'authors',
                },
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'categories',
                    foreignField: '_id',
                    as: 'categories',
                },
            },
            {
                $project: {
                    name: 1,
                    status: 1,
                    uploader: 1,
                    description: 1,
                    canComment: 1,
                    cover: 1,
                    overallRating: 1,
                    authors: { _id: 1, name: 1 },
                    categories: { _id: 1, name: 1 },
                },
            },
        ]);
    }
    else {
        mangas = await Manga.find(filter)
            .skip(skip)
            .limit(per_page)
            .populate([
                { path: 'authors', model: 'Author', select: 'name' },
                { path: 'categories', model: 'Category', select: 'name' }
            ]);
    }

    res.status(200).json({
        page: page,
        per_page: per_page,
        total_pages: total_pages,
        total: count,
        mangas: mangas,
    });
});

// @description get mangas by uploader
// @route GET /api/mangas/uploader/:uploaderID
// @access public
const getMangasByUploader = asyncHandler(async (req, res) => {
    // check valid id
    if (!req.params.uploaderID.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400);
        throw new Error("Invalid ID");
    }

    const user = await User.findById(req.params.uploaderID);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
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

    const count = await Manga.countDocuments({ uploader: user._id });
    const total_pages = Math.ceil(count / per_page);
    page = Math.min(page, total_pages);
    page = Math.max(page, 1);
    const skip = (page - 1) * per_page;

    const mangas = await Manga.find({ uploader: user._id })
        .skip(skip)
        .limit(per_page);

    res.status(200).json({
        mangas: mangas,
        page: page,
        per_page: per_page,
        total: count,
        total_pages: total_pages,
    });
});

// @description get a manga by id
// @route GET /api/mangas/:id
// @access public
const getMangaByID = asyncHandler(async (req, res) => {
    // check valid id
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400);
        throw new Error("Invalid ID");
    }

    // check if manga exists
    const manga = await Manga.findById(req.params.id)
        .populate({ path: 'authors', model: 'Author', select: 'name' })
        .populate({ path: 'categories', model: 'Category', select: 'name' })
        .populate({ path: 'uploader', model: 'User', select: 'name' });

    if (!manga) {
        res.status(404);
        throw new Error("Manga not found");
    }

    // if user is logged in
    if (req.user) {
        if (
            (
                req.user.blacklist.categories.length > 0
                && manga.categories.some(category => req.user.blacklist.categories.includes(category.id))
            )
            ||
            (
                req.user.blacklist.authors.length > 0
                && manga.authors.some(author => req.user.blacklist.authors.includes(author.id))
            )
        ) {
            res.status(200).json({
                warning: "This manga is filtered by your blacklist",
                _id: manga.id,
                name: manga.name,
                authors: manga.authors,
                categories: manga.categories,
                description: manga.description,
                status: manga.status,
                uploader: manga.uploader,
                cover: manga.cover,
                canComment: manga.canComment,
            });
            return;
        }
    }

    res.status(200).json(manga);
});

// @description upload a manga, no chapter yet
// @route POST /api/mangas
// @access approved user only, require token
const uploadManga = asyncHandler(async (req, res) => {
    if (req.user.accountType !== 'approved') {
        res.status(401);
        throw new Error("Not authorized, must be an approved user");
    }

    if (
        !req.body.name || !req.body.authors || req.body.authors.length === 0 ||
        !req.body.categories || req.body.categories.length === 0 || !req.body.status
    ) {
        res.status(400);
        throw new Error("Lack of name/authors/categories/status");
    }

    const manga = await Manga.create({
        name: req.body.name,
        authors: req.body.authors,
        categories: req.body.categories,
        cover: process.env.DEFAULT_COVER,
        description: req.body.description ? req.body.description : '',
        status: req.body.status,
        canComment: req.body.canComment ? req.body.canComment : true,
        uploader: req.user.id,
        overallRating: 0,
    });

    if (req.files && req.files.cover) {
        let uploadedFile = req.files.cover;
        const [publicID, url] = await cloudinaryWrapper.uploadSingleImage(uploadedFile.data, `${manga.id}/cover`);
        const cover = await Cover.create({
            manga: manga._id,
            number: 1,
            imageURL: url,
            imagePublicID: publicID,
        });
        manga.cover = url;
        await manga.save();
    }

    res.status(200).json(manga);
});

// @description update a manga's information
// @route PUT /api/mangas/:id
// @access uploader of the manga only, require token
const updateManga = asyncHandler(async (req, res) => {
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

    // check for user
    if (req.user.id !== manga.uploader.toString()) {
        res.status(401);
        throw new Error("Not authorized to update");
    }

    if (!req.body) {
        res.status(400);
        throw new Error("No new information to update");
    }
    else if (req.body.rating) {
        res.status(400);
        throw new Error("Not allowed to update overall rating");
    }

    const updatedManga = await Manga.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedManga);
});

// @description delete a manga, along with its chapters
// @route DELETE /api/mangas/:id
// @access uploader of the manga/admin only, require token
const deleteManga = asyncHandler(async (req, res) => {
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

    // check for user
    if (req.user.accountType !== 'admin' && req.user.id !== manga.uploader.toString()) {
        res.status(401);
        throw new Error("Not authorized to delete");
    }

    // temporary code, hope so
    // delete relating documents in the database
    await Chapter.deleteMany({ manga: manga._id });
    await Cover.deleteMany({ manga: manga._id });
    await ReadingHistory.deleteMany({ manga: manga._id });
    await Comment.deleteMany({ manga: manga._id });
    await MangaNoti.deleteMany({ manga: manga._id });
    await Report.deleteMany({ manga: manga._id });

    // delete the folders on Cloudinary
    await deleteByPrefix(manga.id);
    await deleteFolder(manga.id);

    // delete the manga
    await manga.deleteOne();
    res.status(200).json({ message: `Deleted manga, id: ${req.params.id}` });
});

const deleteAllMangas = asyncHandler(async (authorID) => {
    const mangas = await Manga.find({ authors: authorID });
    if (mangas.length === 0)
        return;

    for (let manga of mangas) {
        // temporary code, hope so
        // delete relating documents in the database
        await Chapter.deleteMany({ manga: manga._id });
        await Cover.deleteMany({ manga: manga._id });
        await ReadingHistory.deleteMany({ manga: manga._id });
        await Comment.deleteMany({ manga: manga._id });
        await MangaNoti.deleteMany({ manga: manga._id });
        await Report.deleteMany({ manga: manga._id });

        // delete the folders on Cloudinary
        await deleteByPrefix(manga.id);
        await deleteFolder(manga.id);

        // delete the manga in the database
        await manga.deleteOne();
    }
});

// @description toggle the permission to comment on a manga
// @route PUT /api/mangas/:id/comments
// @access manga's uploader only, require token
const toggleComment = asyncHandler(async (req, res) => {
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

    if (req.user.id !== manga.uploader.toString()) {
        res.status(401);
        throw new Error("Not authorized to toggle comment for this manga");
    }

    manga.canComment = !manga.canComment;
    await manga.save();
    res.status(200).json({ message: `Successfully toggle comment permission, canComment: ${manga.canComment}` });
});

const updateHistory = asyncHandler(async (req, res) => {
    const mangaId = req.params.id
    let { newChapters, deleteChapters } = req.body;
    if (!newChapters) newChapters = []
    if (!deleteChapters) deleteChapters = []

    let readingHistory = await ReadingHistory.findOne({
        user: req.user.id,
        manga: mangaId,
    })

    if (readingHistory === null) {
        readingHistory = new ReadingHistory({
            user: req.user.id,
            manga: mangaId,
            chapters: newChapters,
        });
    } else {
        readingHistory.chapters = readingHistory.chapters.filter((chapter) => {
            return !deleteChapters.some(deleteChapter => chapter.equals(deleteChapter))
        });

        newChapters.forEach((newChapter) => {
            if (!readingHistory.chapters.some(chapter => chapter.equals(newChapter)))
                readingHistory.chapters.push(newChapter)
        })
    }

    const updatedReadingHistory = await readingHistory.save();

    res.json(updatedReadingHistory);
});

const getHistory = asyncHandler(async (req, res) => {
    const mangaId = req.params.id

    const readingHistory = await ReadingHistory.findOne({
        user: req.user.id,
        manga: mangaId,
    })

    res.json(readingHistory)
});

const deleteHistory = asyncHandler(async (req, res) => {
    const mangaId = req.params.id

    const readingHistory = await ReadingHistory.findOne({
        user: req.user.id,
        manga: mangaId,
    })

    if (!readingHistory) {
        res.status(404)
        throw new Error('The manga/history is not found')
    }

    await readingHistory.deleteOne()

    res.json(readingHistory)
});

module.exports = {
    getMangas,
    getMangaByID,
    getMangasByUploader,
    uploadManga,
    updateManga,
    deleteManga,
    deleteAllMangas,
    toggleComment,
    updateHistory,
    getHistory,
    deleteHistory,
}