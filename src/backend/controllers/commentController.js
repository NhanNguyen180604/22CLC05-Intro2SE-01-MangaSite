const asyncHandler = require('express-async-handler');
const Manga = require('../models/mangaModel');
const Chapter = require('../models/chapterModel');
const Comment = require('../models/commentModel');

// @description get all comments on a manga
// @route GET /api/mangas/:id/comments
// @access public
const getMangaComments = asyncHandler(async (req, res) => {
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

    const count = await Comment.countDocuments({ manga: manga.id, chapter: undefined });
    const total_pages = Math.ceil(count / per_page);
    page = Math.min(page, total_pages);
    page = Math.max(page, 1);
    const skip = (page - 1) * per_page;

    const comments = await Comment.find({ manga: manga.id, chapter: undefined })
        .skip(skip)
        .populate({
            path: 'user',
            model: 'User',
            select: 'name avatar.url',
        });

    res.status(200).json({
        comments: comments,
        page: page,
        total_pages: total_pages,
        per_page: per_page,
        total: count,
    });
});

// @description get all comments on a manga's chapter
// @route GET /api/mangas/:id/chapters/:chapterNumber/comments
// @access public
const getChapterComments = asyncHandler(async (req, res) => {
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

    // check if chapter exist
    const chapter = await Chapter.findOne({ manga: manga.id, number: req.params.chapterNumber });
    if (!chapter) {
        res.status(404);
        throw new Error("Chapter not found");
    }

    // pagination
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

    const count = await Comment.countDocuments({ manga: manga.id, chapter: chapter.number });
    const total_pages = Math.ceil(count / per_page);
    page = Math.min(page, total_pages);
    page = Math.max(page, 1);
    const skip = (page - 1) * per_page;

    const comments = await Comment.find({ manga: manga.id, chapter: chapter.number })
        .skip(skip)
        .populate({
            path: 'user',
            model: 'User',
            select: 'name avatar.url',
        });

    res.status(200).json({
        comments: comments,
        page: page,
        total_pages: total_pages,
        per_page: per_page,
        total: count,
    });
});

// @description post a comment to a manga/chapter
// @route POST /api/mangas/:id/comments
// @access require token
const postComment = asyncHandler(async (req, res) => {
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

    if (!manga.canComment) {
        res.status(400);
        throw new Error("Comment is disabled");
    }

    // if comment on a chapter
    const chapterNumber = req.body.chapter ? parseInt(req.body.chapter) : null;
    const chapter = chapterNumber ? await Chapter.findOne({ manga: manga.id, number: chapterNumber }) : null;

    if (!req.body.content || !req.body.content.trim().length) {
        res.status(400);
        throw new Error("Comment cannot be empty or whitespace only");
    }

    const comment = {
        user: req.user.id,
        content: req.body.content,
        manga: manga.id
    };

    if (chapter) {
        comment.chapter = chapter.number;
    }

    if (req.body.replyTo?.match(/^[0-9a-fA-F]{24}$/)) {
        const repliedComment = await Comment.findById(req.body.replyTo);
        // if this comment is on a chapter, check if the replied comment is also on the same chapter
        if (repliedComment && chapter && chapter.number === repliedComment.chapter) {
            comment.replyTo = repliedComment;
        }
        // if the comment is on the manga, then check if the replied comment exists and is also on the manga itself
        else if (repliedComment && !repliedComment.chapter && !chapter) {
            comment.replyTo = repliedComment;
        }
        else {
            res.status(400);
            throw new Error("The replied comment is not on the same chapter, or one of the two comment is on the manga, while the other is on a chapter");
        }
    }
    else {
        res.status(400);
        throw new Error("Invalid replied comment's id");
    }

    const commentDoc = await Comment.create(comment);
    res.status(200).json(commentDoc);
});

// @description delete a comment
// @route DELETE /api/mangas/comments/:id
// @access owner of the comment / manga's uploader / admin only, require token
const deleteComment = asyncHandler(async (req, res) => {
    // check valid id
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400);
        throw new Error("Invalid ID");
    }

    const comment = await Comment.findById(req.params.id);
    if (!comment) {
        res.status(404);
        throw new Error("Comment not found");
    }

    const manga = await Manga.findById(comment.manga);

    // check permission
    if (req.user.id !== comment.user.toString() &&
        req.user.id !== manga.uploader.toString() &&
        req.user.accountType !== 'admin'
    ) {
        res.status(401);
        throw new Error("Not authorized to delete comment");
    }

    await comment.deleteOne();
    res.status(200).json({
        _id: comment.id,
    });
});

module.exports = {
    getMangaComments,
    getChapterComments,
    postComment,
    deleteComment,
}