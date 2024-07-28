const friendService = require("../service/friend-service");
const searchService = require("../service/search-service");

class FriendController {
    async getFriends(req, res, next) {
        try {
            const { searchText } = req.query;
            const userId = req.user.id;
            const data = await searchService.searchFriends(searchText, userId);
            console.log(data);
            res.json({
                message: "Вы успешно получили список друзей",
                data: data,
            })
        } catch (e) {
            console.log(e)
            next(e);
        }
    }
    async deleteFriend(req, res, next) {
        try {
            const { friendId } = req.query;
            const userId = req.user.id;
            const data = await friendService.deleteFriend(userId, friendId)
            res.json(data);
        } catch (e) {
            next(e);
        }
    }
    async sendFriendRequest(req, res, next) {
        try {
            const { sendId: friendId } = req.body;
            const userId = req.user.id;
            const data = await friendService.addNewFriendRequest(userId, friendId);
            res.json(data);
        } catch (e) {
            next(e);
        }
    }
    async sendFriendRequestList(req, res, next) {
        try {
            const userId = req.user.id;
            const data = await friendService.getSendFriendRequestList(userId);
            res.json(data);
        } catch (e) {
            next(e);
        }
    }
    async getFriendRequestList(req, res, next) {
        try {
            const userId = req.user.id;
            const data = await friendService.getFriendRequestList(userId);
            res.json(data)
        } catch (e) {
            next(e);
        }
    }
    async acceptFriendRequest(req, res, next) {
        try {
            const { friendId } = req.params;
            const userId = req.user.id;
            const data = await friendService.acceptFriendRequest(userId, friendId);
            res.json(data);
        } catch (e) {
            next(e);
        }
    }
    async rejectFriendRequest(req, res, next) {
        try {
            const { sendId: friendId } = req.body;
            const userId = req.user.id;
            const data = await friendService.rejectFriendRequest(userId, friendId);
            res.json(data);
        } catch (e) {
            next(e);
        }
    }
    async searchUser(req, res, next) {
        try {
            const searchText = req.params.searchText ?? "";
            const { page } = req.query
            const userId = req.user.id;
            const search = await searchService.searchUser(searchText, userId, +page + 1);
            if (search.hits.length === 0) {
                return res.status(400).json(search.hits)
            }
            return res.json(search.hits);
        } catch (e) {
            console.log(e)
            next(e)
        }
    }
}


module.exports = new FriendController();