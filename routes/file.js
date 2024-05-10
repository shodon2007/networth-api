const Router = require('express');
const fileController = require('../controllers/file-controller');
const router = new Router();

router.get('/avatar/:path', fileController.getAvatar);

module.exports = router;
