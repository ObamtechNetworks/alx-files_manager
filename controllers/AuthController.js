// Import required dependencies
const { v4: uuidv4 } = require('uuid'); // For generating tokens
const sha1 = require('sha1');// For hashing the password
const dbClient = require('../utils/db'); // MongoDB client
const redisClient = require('../utils/redis'); // Redis client

exports.getConnect = async function getConnect(req, res) {
  // Get the Authorization header from the request
  const authHeader = req.headers.authorization;

  // Check if the Authorization header is provided and is Basic auth
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Decode the Base64 string (it should be email:password)
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [email, password] = credentials.split(':');

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Search for the user in MongoDB using the email
    const user = await dbClient.userExist(email);
    if (!user.length) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate the password (stored password is SHA1 hashed)
    const hashedPassword = sha1(password);
    if (user[0].password !== hashedPassword) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Generate a new token (UUID)
    const token = uuidv4();

    // Store the user ID in Redis with the key 'auth_<token>' for 24 hours
    const redisKey = `auth_${token}`;
    await redisClient.set(redisKey, user[0]._id.toString(), 86400); // 86400 seconds = 24 hours

    // Return the token in the response
    return res.status(200).json({ token });
  } catch (error) {
    console.error('Error in /connect:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getDisconnect = async function getDisconnect(req, res) {
  const token = req.headers['x-token'];

  // Check if token is provided
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Form the Redis key based on the token
  const redisKey = `auth_${token}`;

  try {
    // Check if the token exists in Redis
    const userId = await redisClient.get(redisKey);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Delete the token from Redis
    await redisClient.del(redisKey);

    // Return status 204 (No Content)
    return res.status(204).end();
  } catch (error) {
    console.error('Error in /disconnect:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
