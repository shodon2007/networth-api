const Router = require('express');
const fileController = require('../controllers/file-controller');
const authMiddleware = require('../middlewares/auth-middleware');
const router = new Router();
const multer = require('multer');

const storage = multer.memoryStorage({
  destination: function (req, file, cb) {
    cb(null, 'img/avatar/');
  },
});

const upload = multer({ dest: 'img/avatar/', storage, });
router.get('/avatar/:path', fileController.getAvatar);
router.post('/avatar/', authMiddleware, upload.single('file'), fileController.setAvatar);

module.exports = router;
