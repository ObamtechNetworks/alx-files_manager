// const { ObjectId } = require('mongodb');
const sha1 = require('sha1');
const dbClient = require('../utils/db');
// const redisClient = require('../utils/redis');

exports.postNew = async (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;

  if (!userEmail) {
    res.status(400).json({
      error: 'Missing email',
    });
    return;
  }

  if (!userPassword) {
    res.status(400).json({
      error: 'Missing password',
    });
    return;
  }

  const existingUser = await dbClient.userExist(userEmail);
  if (existingUser.length > 0) {
    res.status(400).json({
      error: 'Already exist',
    });
  }

  const hashedPass = sha1(userPassword);
  const user = await dbClient.createUser(userEmail, hashedPass);
  const id = `${user.insertedId}`;
  res.status(201).json({
    id,
    userEmail,
  });
};
