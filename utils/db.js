const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    this.database = process.env.DB_DATABASE || 'files_manager';

    // Use unified topology for better monitoring
    this.con = `mongodb://${host}:${port}`;
    this.client = new MongoClient(this.con, { useUnifiedTopology: true });

    // Connect asynchronously and handle errors
    this.client.connect();
  }

  // Updated isAlive method
  isAlive() {
    return this.client && this.client.topology && this.client.topology.isConnected();
  }

  // Asynchronously count the number of users in the 'users' collection
  async nbUsers() {
    try {
      const db = this.client.db(this.database);
      const userCollection = db.collection('users');
      const userCount = await userCollection.countDocuments();
      return userCount;
    } catch (error) {
      console.error('Error counting users:', error);
      return 0;
    }
  }

  async users() {
    try {
      const db = this.client.db(this.database);
      const userCollection = await db.collection('users');
      return userCollection;
    } catch (error) {
      console.log('No user', error);
      return 0;
    }
  }

  async userExist(email) {
    // checks if a user with an email exists in the database
    const database = this.client.db(this.database);
    const collection = database.collection('users');
    const user = await collection.find({ email }).toArray();
    return user;
  }

  async createUser(email, hashedPw) {
    // inserst a new user into the database
    const database = this.client.db(this.database);
    const collection = database.collection('users');
    const newUser = await collection.insertOne({ email, password: hashedPw });
    return newUser;
  }

  // Asynchronously count the number of files in the 'files' collection
  async nbFiles() {
    try {
      const db = this.client.db(this.database); // Update to this.client.db
      const filesCollection = db.collection('files');
      const fileCount = await filesCollection.countDocuments();
      return fileCount;
    } catch (error) {
      console.error('Error counting files:', error);
      return 0;
    }
  }
}

// Export the DBClient instance
const dbClient = new DBClient();
module.exports = dbClient;
