const fs = require('fs');
const path = require('path');
const ApiError = require('../exceptions/api-error');
const { getAvatarSize } = require('../service/file-service');
const multer = require('multer');
const userService = require('../service/user-service');
const fileService = require('../service/file-service');
const { v4 } = require('uuid');

class FileController {
    async getAvatar(req, res, next) {
        try {
            const { path: avatar_url = 'default.png' } = req.params;
            let avatarPath = path.resolve(__dirname, '..', 'img', 'avatar', avatar_url);
            let avatarSize;
            try {
                avatarSize = await getAvatarSize(avatarPath);
            } catch (e) {
                avatarPath = path.resolve(__dirname, '..', 'img', 'avatar', 'default.png');
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
            const accessToken = (req.headers.authorization.split(' ')[1]);

            const user = await userService.getUserByAccessToken(accessToken);
            const fileName = await fileService.saveAvatar(req.file);
            await userService.setUserParamById(`https://networth.shodon.ru/api/file/avatar/${fileName}`, 'avatar', user.id);

            res.status(200).json({
                status: 200,
                message: 'Вы успешно поставили фото профиля'
            })
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new FileController();