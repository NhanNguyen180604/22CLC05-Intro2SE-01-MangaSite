const express = require('express');
const router = express.Router();
const controller = require('../controllers/example2Controller');
const { authorize } = require('../middlewares/authMiddleware');

// /api/example2
// example of authorize middelware
// u wont pass this unless u have JWT token in Bearer header
router.route('/')
    .get(authorize, controller.get1);  

// /api/example2/:id
router.route('/:id')
    .get(controller.getID)
    .post(controller.postID);

module.exports = router;