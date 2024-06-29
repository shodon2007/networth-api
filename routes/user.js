const Router = require('express');
const userController = require('../controllers/user-controller');
const router = new Router();
const { body } = require('express-validator');
const authMiddleware = require('../middlewares/auth-middleware');
const fs = require('fs');
const path = require('path');

router.post(
    '/registration',
    body('email').isEmail(),
    body('password').isLength({ min: 4, max: 32 }),
    body('name').isLength({ min: 2, max: 32 }),
    body('surname').isLength({ min: 2, max: 32 }),
    userController.registration
);

router.post('/change_password', authMiddleware, userController.changePassword);
router.post('/send_code', authMiddleware, userController.sendCode);
router.post('/change_email', authMiddleware, userController.changeEmail);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.post('/delete', userController.deleteUser);
router.post('/edit_profile', body('id').isNumeric(), authMiddleware, userController.editUserProfile);
router.get('/activate/:link', userController.activate);
router.get('/refresh', userController.refresh);
router.get('/user_info', authMiddleware, userController.getUserInfo);
router.get('/userhello', (req, res) => {
    res.send('Hello, I`m here')
})
module.exports = router;
