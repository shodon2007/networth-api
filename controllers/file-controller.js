const fs = require('fs');
const path = require('path');
const ApiError = require('../exceptions/api-error');
const { getAvatarSize } = require('../service/file-service');

class FileController {
    async getFile(req, res, next) {
        // const lang = req.params.lang;
        // const filePath = path.join(__dirname, '..', 'translations', `${lang}.json`);
        // fs.readFile(filePath, 'utf-8', (err, data) => {
        //     if (err) {
        //         return next(ApiError.BadRequest('Произошла ошибка при поиске файла переводов'));
        //     }
        //     try {
        //         const jsonData = JSON.parse(data);
        //         res.json(jsonData);
        //     } catch(e) {
        //         return next(ApiError.BadRequest('Произошла ошибка при парсинге файла переводов'));
        //     }
        // })
    }
    async getAvatar(req, res, next) {
        try {
            const {avatar_url = 'default.png'} = req.params;
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
}

module.exports = new FileController();