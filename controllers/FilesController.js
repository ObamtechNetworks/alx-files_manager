const { ObjectId } = require('mongodb');
const { v4: uuidv4 } = require('uuid'); // For generating tokens
// const sha1 = require('sha1');// For hashing the password
const dbClient = require('../utils/db'); // MongoDB client
const redisClient = require('../utils/redis'); // Redis client

exports.postUpload = async function postUpload(req, res) {
  try {
    console.log('Inside postUpload');
    const token = req.headers['x-token'];

    // Check if token is provided
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Retrieve the user ID from Redis using the token
    const userId = await redisClient.get(`auth_${token}`);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Retrieve user from the database
    const db = dbClient.getDb(); // Get the database instance
    const user = await db.collection('users').findOne({ _id: ObjectId(userId) }); // Use ObjectId here

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Proceed with file creation
    const {
      name, type, parentId = 0, isPublic = false, data,
    } = req.body;

    // Validate name
    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    // Validate type
    const validTypes = ['file', 'folder', 'image'];
    if (!type || !validTypes.includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    // Validate data (for file/image types)
    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    // Validate parentId if provided
    let parentFile = null;
    if (parentId !== 0) {
      parentFile = await db.collection('files').findOne({ _id: ObjectId(parentId) }); // Use ObjectId here
      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }

      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    if (type === 'folder') {
      const newFile = {
        userId: ObjectId(userId), // Use ObjectId here
        name,
        type,
        isPublic,
        parentId: parentId === 0 ? 0 : ObjectId(parentId), // Use ObjectId here
      };

      const result = await db.collection('files').insertOne(newFile);
      return res.status(201).json({
        id: result.insertedId,
        userId,
        name,
        type,
        isPublic,
        parentId,
      });
    }

    const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';
    // eslint-disable-next-line global-require
    const fs = require('fs');
    // eslint-disable-next-line global-require
    const path = require('path');

    // Ensure the folder exists
    if (!fs.existsSync(FOLDER_PATH)) {
      fs.mkdirSync(FOLDER_PATH, { recursive: true });
    }

    // Generate a unique file name using UUID
    const fileUUID = uuidv4();
    const localPath = path.join(FOLDER_PATH, fileUUID);

    // Decode the Base64 data
    const fileData = Buffer.from(data, 'base64');

    // Write the file to the local file system
    fs.writeFileSync(localPath, fileData);

    // Create the file document
    const newFile = {
      userId: dbClient.ObjectId(userId),
      name,
      type,
      isPublic,
      parentId: parentId === 0 ? 0 : dbClient.ObjectId(parentId),
      localPath,
    };

    // Insert into the database
    const result = await dbClient.db.collection('files').insertOne(newFile);

    return res.status(201).json({
      id: result.insertedId,
      userId,
      name,
      type,
      isPublic,
      parentId,
    });
  } catch (error) {
    console.error('Error in postUpload:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
