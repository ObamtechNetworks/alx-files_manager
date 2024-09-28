const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

const getStatus = (req, res) => {
  // check connection status of database and redis
  res.status(200).json({
    redis: redisClient.isAlive(),
    db: dbClient.isAlive(),
  });
};

const getStats = async (req, res) => {
  const allUsers = await dbClient.nbUsers();
  const allFiles = await dbClient.nbFiles();

  // return the number of files and users in teh db with status code 200
  res.status(200).json({
    users: allUsers,
    files: allFiles,
  });
};

module.exports = { getStatus, getStats };
