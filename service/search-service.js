const { MeiliSearch } = require("meilisearch");
const Database = require("../db");


class SearchService extends Database {
    isInit = false;
    constructor() {
        super();
        this.initSearchService();
    }
    async initSearchService() {
        const apiKey = await fetch(`${process.env.SEARCH_URL}/keys`, {
            headers: {
                Authorization: `Bearer ${process.env.SEARCH_MASTER_KEY}`
            }
        }).then(res => res.json()).then(res => res.results[0].key);
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

        const documents = await this.query("SELECT id, email, name, surname, avatar FROM user WHERE privacy = 'public'");
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
        const documents = await this.query("SELECT id, email, name, surname, avatar FROM user WHERE privacy = 'public'");
        await this.userIndex.updateDocuments(documents);
    }

    async searchUser(text, userId) {
        const userFriends = await this.query("SELECT user_id, friend_id FROM friend WHERE friend_id = ? OR user_id = ?", userId, userId);
        const search = await this.userIndex.search(text, {
            limit: 1000,
            filter: [...userFriends.map(friend => `id != ${friend.user_id === userId ? friend.friend_id : friend.user_id}`), `id != ${userId}`]
        });
        return search;
    }
}

module.exports = new SearchService();