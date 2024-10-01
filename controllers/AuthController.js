const { v4: uuidv4 } = require('uuid');
const sha1 = require('sha1');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

exports.getConnect = async (req, res) => {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const encodedCredentials = authHeader.slice(6);
  const decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString('utf-8');
  const [email, password] = decodedCredentials.split(':');

  if (!email || !password) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = await dbClient.userExist(email);
  if (!user || user.length === 0) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const storedPassword = user[0].password;
  const hashedInputPassword = sha1(password);

  if (storedPassword !== hashedInputPassword) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = uuidv4();
  await redisClient.set(`auth_${token}`, user[0]._id.toString(), 24 * 60 * 60); // Set expiration to 24 hours

  return res.json({ token });
};

exports.getDisconnect = async (req, res) => {
  const token = req.header('X-Token');
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  await redisClient.del(`auth_${token}`);
  return res.sendStatus(204);
};
