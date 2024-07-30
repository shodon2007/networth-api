const { MeiliSearch } = require("meilisearch");
const Database = require("../db");


class SearchService extends Database {
    isInit = false;
    constructor() {
        super();
        this.initSearchService();
    }
    async initSearchService() {
        this.client = new MeiliSearch({
            host: process.env.SEARCH_URL,
            apiKey: process.env.SEARCH_MASTER_KEY,
        });
        this.initUserIndex();
    }
    async initUserIndex() {
        if (!this.userIndex) {
            this.userIndex = this.client.index("user");
        }

        const documents = await this.query("SELECT id, email, name, surname, avatar FROM users WHERE privacy = 'public'");
        await this.userIndex.addDocuments(documents);
        this.userIndex.updateSearchableAttributes([
            "email", "name", "surname",
        ])
        this.userIndex.updateDisplayedAttributes([
            "*",
        ])
        await this.userIndex.updateFilterableAttributes([
            'id',
        ])
    }
    async updateUserDocuments() {
        const documents = await this.query("SELECT id, email, name, surname, avatar FROM users WHERE privacy = 'public'");
        await this.userIndex.updateDocuments(documents);
    }

    async searchUser(text, userId, page) {
        const userFriends = await this.query("SELECT user_id, friend_id FROM friends WHERE friend_id = ? OR user_id = ?", userId, userId);
        const search = await this.userIndex.search(text, {
            page: page,
            filter: [...userFriends.map(friend => `id != ${friend.user_id === userId ? friend.friend_id : friend.user_id}`), `id != ${userId}`]
        });
        return search;
    }
    async searchFriends(text, userId) {
        const userFriends = await this.query("SELECT user_id, friend_id FROM friends WHERE (friend_id = ? OR user_id = ?) AND accepted = 1", userId, userId);
        if (!text) {
            text = " "
        }
        const friendIds = userFriends.map(friend => friend.user_id === userId ? friend.friend_id : friend.user_id);
        let filters = friendIds.map(id => `id = ${id}`).join(' OR ');

        if (userFriends.length === 0) {
            return []
        }

        const search = await this.userIndex.search(text, {
            limit: 10000,
            filter: [`(${filters})`, `id != ${userId}`]
        })
        return search.hits;
    }
}

module.exports = new SearchService();