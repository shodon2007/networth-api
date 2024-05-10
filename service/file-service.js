const fs = require('fs');
const Database = require('../db');
const path = require('path')

class FileService extends Database {
    async getAvatarSize(avatarPath) {
        const avatarSize = fs.statSync(avatarPath).size;
        return avatarSize;
    }
    async setAvatar(avatar_url, avatar_data) {

    }
} 

module.exports = new FileService();