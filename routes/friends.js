const Router = require('express');
const friendController = require('../controllers/friend-controller');
const router = new Router();
const authMiddleware = require('../middlewares/auth-middleware');

// router.post('/change_password', authMiddleware, friendController.changePassword);
// router.post('/delete', friendController.deleteUser);
// router.get('/activate/:link', friendController.activate);
router.delete("/", authMiddleware, friendController.deleteFriend)
router.get("/all", authMiddleware, friendController.getFriends)
router.post('/accept_request/:friendId', authMiddleware, friendController.acceptFriendRequest);
router.post('/reject_request', authMiddleware, friendController.rejectFriendRequest);
router.post('/send_request', authMiddleware, friendController.sendFriendRequest);
router.get('/send_request/all', authMiddleware, friendController.sendFriendRequestList);
router.get('/get_request/all', authMiddleware, friendController.getFriendRequestList);
router.get('/search_user/', authMiddleware, friendController.searchUser);
router.get('/search_user/:searchText', authMiddleware, friendController.searchUser);
// router.get('/user_info', authMiddleware, friendController.getUserInfo);

module.exports = router;
