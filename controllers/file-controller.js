const fs = require('fs');
const path = require('path');
const ApiError = require('../exceptions/api-error');
const { getAvatarSize } = require('../service/file-service');
const multer = require('multer');
const userService = require('../service/user-service');

class FileController {
    async getAvatar(req, res, next) {
        try {
            const {path: avatar_url = 'default.png'} = req.params;
            let avatarPath = path.resolve(__dirname, '..', 'img', 'avatar', avatar_url);
            let avatarSize;
            try {
                avatarSize = await getAvatarSize(avatarPath);
            } catch(e) {
                avatarPath =  path.resolve(__dirname, '..', 'img', 'avatar', 'default.png');
                avatarSize = await getAvatarSize(avatarPath);
            }
            res.writeHead(200, {
                'Content-Type': `image/${avatarPath.split('.').at(-1)}`,
                'Content-Length': avatarSize,
            });
            fs.createReadStream(avatarPath).pipe(res);
        } catch (err) {
            next(err);
        }
    }
    async setAvatar(req, res, next) {
        try {
            const {filename} = req.file;
            const {id} = req.params;
            const accessToken = (req.headers.authorization.split(' ')[1]);

            const user = await userService.getUserByAccessToken(accessToken);


            if (user.id !== +id) {
                return next(ApiError.UnAccessedError())
            }

            await userService.setUserParamById(`https://networth.shodon.ru/api/file/avatar/${filename}`, 'avatar', id);

            res.json('data')
        } catch(e) {
            next(e);
        }
    }
}

module.exports = new FileController();