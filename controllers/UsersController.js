const { ObjectId } = require('mongodb');
const sha1 = require('sha1');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

exports.postNew = async function postNew(req, res) {
  const userEmail = req.body.email;
  const userPassword = req.body.password;

  if (!userEmail) {
    return res.status(400).json({ error: 'Missing email' });
  }

  if (!userPassword) {
    return res.status(400).json({ error: 'Missing password' });
  }

  try {
    const existingUser = await dbClient.userExist(userEmail);
    if (existingUser) {
      return res.status(400).json({ error: 'Already exist' });
    }

    const hashedPass = sha1(userPassword);
    const user = await dbClient.createUser(userEmail, hashedPass);

    return res.status(201).json({
      id: user.insertedId.toString(), // Convert ObjectId to string
      email: userEmail,
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getMe = async function getMe(req, res) {
  const token = req.headers['x-token']; // technique to reterive token from header

  // Check if token is provided
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Form the Redis key based on the token
  const redisKey = `auth_${token}`;

  try {
    // Retrieve the user ID from Redis using the token
    const userId = await redisClient.get(redisKey);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Fetch the user details from MongoDB using the user ID
    const usersCollection = await dbClient.users();
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Return the user details (email and id)
    return res.status(200).json({
      id: user._id,
      email: user.email,
    });
  } catch (error) {
    console.error('Error in /users/me:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
