const Database = require('../db');

class FriendService extends Database {
    async addNewFriendRequest(userId, friendId) {
        try {
            const userFriendList = await this.query(`
                SELECT id FROM friend 
                WHERE (user_id = ? AND friend_id = ?) OR (friend_id = ? AND user_id = ?)
            `, userId, friendId, userId, friendId);
            const isNotFriends = userFriendList.length === 0;
            if (!isNotFriends) {
                return {
                    message: "Извините, но вы уже отправили запрос",
                    data: false
                }
            }
            await this.query("INSERT INTO friend (user_id, friend_id, accepted) VALUES (?, ?, 0)", userId, friendId);
            return {
                message: "Вы успешно отправили запрос в друзья",
                data: true
            };
        } catch (e) {
            return {
                message: "Неизвестная ошибка",
                data: false
            };
        }
    }
    async rejectFriendRequest(userId, friendId) {
        try {
            await this.query(`
                DELETE FROM friend 
                WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)
            `, userId, friendId, friendId, userId);

            return {
                data: true,
                message: "Вы успешно отклонили запрос в друзья"
            }
        } catch (e) {
            console.log(e)
            return {
                message: "Неизвестная ошибка при отклонении запроса",
                data: false
            }
        }
    }

    async getFriendRequestList(userId) {
        try {
            const reqList = await this.query(`
                SELECT user.id, user.name, user.surname, user.email, user.avatar, user.phone_number 
                FROM friend 
                INNER JOIN user ON friend.user_id = user.id 
                WHERE friend_id = ? AND friend.accepted = 0
            `, userId);

            return {
                message: "Вы успешно получили список запросов в друзья",
                data: reqList
            };
        } catch (e) {
            return {
                message: "Неизвестная ошибка при получении 'списка запросов для меня'",
                data: false,
            }
        }
    }

    async getSendFriendRequestList(userId) {
        try {
            const reqList = await this.query(`
                SELECT user.id, user.name, user.surname, user.email, user.avatar, user.phone_number 
                FROM friend 
                INNER JOIN user ON friend.friend_id = user.id 
                WHERE user_id = ? AND friend.accepted = 0
            `, userId);

            return {
                message: "Вы успешно получили список отправленных запросов",
                data: reqList
            };
        } catch (e) {
            return {
                message: "Неизвестная ошибка при получении 'списка отправленных запросов'",
                data: false,
            }
        }
    }

    async acceptFriendRequest(userId, friendId) {
        try {
            await this.query(`
                UPDATE friend 
                SET accepted = 1 
                WHERE user_id = ? AND friend_id = ?
            `, friendId, userId);

            return {
                message: "Вы успешно добавили в друзья",
                data: true
            }
        } catch (e) {
            return {
                message: "Неизвестная ошибка при принятии в друзья",
                data: false,
            }
        }
    }

    async deleteFriend(userId, friendId) {
        try {
            await this.query(`
                DELETE FROM friend 
                WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)
            `, userId, friendId, friendId, userId)
            return {
                message: "Вы успешно удалили друга",
                data: true,
            }
        } catch (e) {
            return {
                message: "Не удалось удалить друга из друзей",
                data: false
            }
        }
    }
}

module.exports = new FriendService();