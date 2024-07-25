const fs = require('fs');
const path = require('path');
const { getAvatarSize } = require('../service/file-service');
const userService = require('../service/user-service');
const fileService = require('../service/file-service');

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
            await userService.setUserParamById(fileName, 'avatar', user.id);

            const data = await userService.getUserByParam(user.id, 'id')

            res.status(200).json({
                status: 200,
                message: 'Вы успешно поставили фото профиля',
                data: {
                    avatar: data.avatar
                }
            })
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new FileController();