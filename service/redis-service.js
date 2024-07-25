const redis = require('redis')

class Redis {
  constructor (this) {
    this.client = redis.createClient()
    this.client.on("error", err => console.error("Error in Redis ->", err))
  }
  
  async connect() {
    await this.client.connect()
  }

  async setTTL(key, data) {
    await this.client.setEx(key, "3600", data)
  }

  async get(key) {
    await this.client.get(key)
  }

  async set(key, data) {
    await this.client.set(key, data)
  }

  async setH() {

  }

  async getH() {
    
  }
}
