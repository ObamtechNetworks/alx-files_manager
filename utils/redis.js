const redis = require('redis');
const { promisify } = require('util');

class RedisClient {
  constructor() {
    // Initialize Redis client
    this.client = redis.createClient();

    // Promisify Redis methods to use with async/await
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);

    // track connection status
    this.connected = true;

    // Event listener for successful connection
    this.client.on('connect', () => {
      this.connected = true;
      // console.log('Redis client connected', this.connected);
    });

    // Event listener for errors
    this.client.on('error', (err) => {
      console.log('Redis error', err);
      this.connected = false;
    });
  }

  // Check if Redis connection is alive
  isAlive() {
    return this.connected;
  }

  // Get value for a key
  async get(key) {
    try {
      const value = await this.getAsync(key);

      if (value) {
        // console.log(`The value for ${key} is ${value}`);
        return value;
      }
      // console.log(`Key ${key} does not exist in Redis.`);
      return null;
    } catch (error) {
      // console.log(`Error getting key: ${error}`);
      return null;
    }
  }

  // Set value for a key with optional expiration
  async set(key, value, duration) {
    try {
      if (duration) {
        await this.setAsync(key, value, 'EX', duration);
        // console.log(`Set ${key} = ${value} with expiration of ${duration} seconds in Redis.`);
      } else {
        await this.setAsync(key, value);
        // console.log(`Set ${key} = ${value} without expiration in Redis.`);
      }
    } catch (error) {
      console.log('Error setting key: ', error);
    }
  }

  // Delete a key
  async del(key) {
    try {
      await this.delAsync(key);
      console.log(`Key ${key} deleted successfully.`);
    } catch (error) {
      console.log(`Error: Cannot delete key ${key} - ${error}`);
    }
  }
}

// Export an instance of RedisClient
const redisClient = new RedisClient();
module.exports = redisClient;
