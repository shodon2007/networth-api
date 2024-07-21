const Router = require('express');
const userRouter = require('./user');
const translationRouter = require('./translation');
const fileRouter = require('./file');
const friendRouter = require('./friends');
const router = new Router();

router.use('/user', userRouter);
router.use('/translation', translationRouter);
router.use('/file', fileRouter);
router.use('/friends', friendRouter);

module.exports = router;
