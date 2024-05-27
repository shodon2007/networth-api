const fs = require('fs');
const Database = require('../db');
const path = require('path')
const { v4 } = require('uuid');
const svg2img = require('svg2img');

class FileService extends Database {
    async getAvatarSize(avatarPath) {
        const avatarSize = fs.statSync(avatarPath).size;
        return avatarSize;
    }
    async saveAvatar(file) {
        let fileData = file.buffer;
        const isSvg = file.originalname.split('.').at(-1) === 'svg';
        let fileName = '';
        if (isSvg) {
            svg2img(file.buffer, (err, buffer) => {
                if (err) {
                    throw new Error('Ошибка при конвертации фото профиля');
                }
                fileData = buffer;
            });
            fileName = v4() + '.jpg';
        } else {
            fileName = v4() + `.${file.originalname.split('.').at(-1) || 'png'}`;
        }

        fs.writeFile(path.resolve(__dirname, '..', 'img', 'avatar', fileName), fileData, (err) => {
            if (err) {
                throw new Error('Ошибка при сохранении изоброжения профиля')
            }
        });
        return fileName;
    }
}

module.exports = new FileService();