const express = require('express');
const router = express.Router();
const banUserController = require('../controllers/banUserController');
const { authorize } = require('../middlewares/authMiddleware');

router.route('/ban').post(authorize, banUserController.banUser);

module.exports = router;
