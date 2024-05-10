const Router = require('express');
const authRouter = require('./user');
const translationRouter = require('./translation');
const fileRouter = require('./file');

const router = new Router();

router.use('/auth', authRouter);
router.use('/translation', translationRouter);
router.use('/file', fileRouter);

module.exports = router;
