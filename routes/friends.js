const Router = require('express');
const friendController = require('../controllers/friend-controller');
const router = new Router();
const authMiddleware = require('../middlewares/auth-middleware');

// router.post('/change_password', authMiddleware, friendController.changePassword);
// router.post('/delete', friendController.deleteUser);
// router.get('/activate/:link', friendController.activate);
router.get('/search_user/', authMiddleware, friendController.searchUser);
router.get('/search_user/:searchText', authMiddleware, friendController.searchUser);
// router.get('/user_info', authMiddleware, friendController.getUserInfo);

module.exports = router;
