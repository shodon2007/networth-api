const Router = require('express');
const fileController = require('../controllers/file-controller');
const authMiddleware = require('../middlewares/auth-middleware');
const router = new Router();
const multer = require('multer');
const { v4 } = require('uuid');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'img/avatar/');
    },
    filename: function (req, file, cb) {
      const uniqueFilename = v4() + '.png';
      cb(null, uniqueFilename);
    }
  });
const upload = multer({dest: 'img/avatar/', storage,});
router.get('/avatar/:path', fileController.getAvatar);
router.post('/avatar/:id', authMiddleware, upload.single('file'), fileController.setAvatar);

module.exports = router;
