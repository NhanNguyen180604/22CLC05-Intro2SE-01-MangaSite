const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authorize, checkUser } = require('../middlewares/authMiddleware');

router.route('/library').get(authorize, userController.getLibrary);
router.route('/library/:tab').get(authorize, userController.getLibraryTab).put(authorize, userController.updateLibrary);
router.route('/library/:tab/:id').delete(authorize, userController.deleteFromLibrary);

router.route('/blacklist').get(authorize, userController.getBlacklist).put(authorize, userController.updateBlacklist);

router.route('/').get(authorize, userController.getUsers);
router.route('/me').get(authorize, userController.getMe);
router.route('/notifications').post(authorize, userController.notifyUser).get(authorize, userController.getUserNoti);
router.route('/:id').get(authorize, userController.getUserById).put(authorize, userController.changeUserRole);
router.route('/login').post(userController.loginUser);
router.route('/register').post(userController.registerUser);
router.route('/approval').post(authorize, userController.requestApproval);
router.route('/ban').post(authorize, userController.banUser);

module.exports = router;
