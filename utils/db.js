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
    // Connect asynchronously and handle errors
    this.client.connect()
      .then(() => {
        // console.log('Connected to MongoDB successfully.');
      })
      .catch((err) => {
        console.error('Failed to connect to MongoDB', err);
      });
  }

  getDb() {
    if (!this.client.isConnected()) {
      throw new Error('MongoDB client is not connected');
    }
    return this.client.db(this.database);
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
    try {
      const db = this.client.db(this.database);
      const userCollection = db.collection('users');
      const user = await userCollection.findOne({ email });
      return user; // Return the user or null if not found
    } catch (error) {
      console.error('Error checking user existence:', error);
      throw new Error('Database error'); // Allow error propagation
    }
  }

  async createUser(email, hashedPass) {
    try {
      const db = this.client.db(this.database);
      const userCollection = db.collection('users');
      const result = await userCollection.insertOne({
        email,
        password: hashedPass,
      });
      return result; // Return the result of the insertion
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user'); // Allow error propagation
    }
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

  async findUserByEmail(email) {
    try {
      const db = this.client.db(this.database);
      const userCollection = await db.collection('users');
      return userCollection.findOne({ email });
    } catch (error) {
      console.error('Error finding user:', error);
      return null;
    }
  }
}

// Export the DBClient instance
const dbClient = new DBClient();
module.exports = dbClient;
