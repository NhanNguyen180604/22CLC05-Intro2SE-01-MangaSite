const asyncHandler = require('express-async-handler');
const Manga = require('../models/mangaModel');
const User = require('../models/userModel');
const { deleteAllChapters } = require('../controllers/chapterController');
const { deleteAllCovers } = require('../controllers/coverController');
const { deleteByPrefix, deleteFolder } = require('../others/cloudinaryWrapper');

// @description get all mangas, filtered by user's blacklist
// @route GET /api/mangas
// @access public
const getMangas = asyncHandler(async (req, res) => {
    let page = req.query.page ? req.query.page : 1;
    const per_page = req.query.per_page ? req.query.per_page : 20;
    const count = await Manga.countDocuments();
    const total_pages = Math.ceil(count / per_page);
    page = Math.min(page, total_pages);
    const skip = (page - 1) * per_page;

    // if user is logged in, check their blacklist
    let filter = {};
    if (req.user) {
        if (req.user.blacklist.categories.length > 0) {
            req.user = await req.user.populate({
                path: 'blacklist.categories',
                model: 'Category',
                select: '_id'
            });

            const ids = await Promise.all(req.user.blacklist.categories.map(async category => {
                return category.id;
            }));

            filter.categories = { $nin: ids };
        }

        if (req.user.blacklist.authors.length > 0) {
            req.user = await req.user.populate({
                path: 'blacklist.authors',
                model: 'Author',
                select: '_id'
            });

            const ids = await Promise.all(req.user.blacklist.authors.map(async author => {
                return author.id;
            }));

            filter.authors = { $nin: ids };
        }
    }

    const mangas = await Manga.find(filter)
        .skip(skip)
        .limit(per_page);

    res.status(200).json({
        page: page,
        per_page: per_page,
        total_pages: total_pages,
        total: count,
        mangas: mangas,
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
        .populate({ path: 'categories', model: 'Category', select: 'name' });

    if (!manga) {
        res.status(400);
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
        canComment: true,
        uploader: req.user.id
    });

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

    const updatedManga = await Manga.findByIdAndUpdate(req.params.id, req.body, { new: true })
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

    // delete all chapters info in the database
    await deleteAllChapters(manga.id);

    // delete all cover images info in the database
    await deleteAllCovers(manga.id);

    // delete the folders on Cloudinary
    await deleteByPrefix(manga.id);
    await deleteFolder(manga.id);

    // delete the manga
    await manga.deleteOne();
    res.status(200).json({ message: `Deleted manga, id: ${req.params.id}` });
});

module.exports = {
    getMangas, getMangaByID, uploadManga, updateManga, deleteManga
}