const express = require('express');
const router = express.Router();
const controller = require('../controllers/example1Controller');

// /api/example1
router.route('/')
    .get(controller.get1)
    .post(controller.post1);

// /api/example1/lmao
router.route('/lmao')
    .get(controller.getLmao)
    .post(controller.postLmao);

module.exports = router;