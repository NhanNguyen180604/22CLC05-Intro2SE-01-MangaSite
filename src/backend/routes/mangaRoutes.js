const express = require('express');
const router = express.Router();
const mangaController = require('../controllers/mangaController');
const chapterController = require('../controllers/chapterController');
const coverController = require('../controllers/coverController');
const commentController = require('../controllers/commentController');
const ratingController = require('../controllers/ratingController');
const { authorize, checkUser } = require('../middlewares/authMiddleware');

// temporary importing until all modules are written
require('../models/mangaModel');
require('../models/userModel');

// rating routes
// /api/mangas/:id/ratings
router.route('/:id/ratings')
    .get(ratingController.getRatings)
    .post(authorize, ratingController.sendRating);

router.route('/:id/ratings/one')
    .get(authorize, ratingController.getOneRating);

// comment routes
// exception, I suck, I dont know how to properly make this route
router.route('/comments/:id')
    .delete(authorize, commentController.deleteComment);

// /api/mangas/:id/comments
router.route('/:id/comments')
    .get(commentController.getMangaComments)
    .post(authorize, commentController.postComment)
    .put(authorize, mangaController.toggleComment);
router.route('/:id/chapters/:chapterNumber/comments')
    .get(commentController.getChapterComments);

// cover routes
// /api/mangas/:id/covers
router.route('/:id/covers')
    .get(coverController.getCovers)
    .post(authorize, coverController.uploadCover);

router.route('/:id/covers/:coverNumber')
    .put(authorize, coverController.changeCover)
    .delete(authorize, coverController.deleteCover);

// chapter routes
// /api/mangas/:id/chapters/:chapterNumber
router.route('/:id/chapters/:chapterNumber')
    .get(chapterController.getChapter)
    .put(authorize, chapterController.updateChapter)
    .delete(authorize, chapterController.deleteChapter);

// /api/mangas/:id/chapters
router.route('/:id/chapters')
    .get(chapterController.getChapterList)
    .post(authorize, chapterController.uploadChapter);

// manga routes
// /api/mangas/
router.route('/')
    .get(checkUser, mangaController.getMangas)
    .post(authorize, mangaController.uploadManga);

// /api/mangas/:id
router.route('/:id')
    .get(checkUser, mangaController.getMangaByID)
    .put(authorize, mangaController.updateManga)
    .delete(authorize, mangaController.deleteManga);

// /api/mangas/:id/readingHistory
router.route('/:id/readingHistory')
    .put(authorize, mangaController.updateHistory)
    .get(authorize, mangaController.getHistory)
    .delete(authorize, mangaController.deleteHistory)

module.exports = router;
