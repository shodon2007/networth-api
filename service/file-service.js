const fs = require('fs');
const Database = require('../db');
const path = require('path')

class FileService extends Database {
    async getAvatarSize(avatarPath) {
        const avatarSize = fs.statSync(avatarPath).size;
        return avatarSize;
    }
    async setAvatar(userId, data) {
        userId = 51;
        const status = fs.writeFile(path.resolve(__dirname, '..', 'img', 'avatar', userId), data);
    }
} 

module.exports = new FileService();