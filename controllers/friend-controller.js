const searchService = require("../service/search-service");

class FriendController {
    async getFriends(req, res, next) {
        try {

        } catch (e) {
            next(e);
        }
    }
    async deleteFriend(req, res, next) {

    }
    async sendFriendRequest(req, res, next) {

    }
    async acceptFriendRequest(req, res, next) {

    }
    async rejectFriendRequest(req, res, next) {

    }
    async searchUser(req, res, next) {
        try {
            const searchText = req.params.searchText ?? "";
            console.log("text: ", searchText);
            const userId = req.user.id;
            const search = await searchService.searchUser(searchText, userId);
            console.log(search);
            res.json(search.hits);
        } catch (e) {
            next(e)
        }
    }
}


module.exports = new FriendController();