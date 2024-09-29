const express = require('express');

const router = express.Router();
const AppController = require('../controllers/AppController');
const { postNew } = require('../controllers/UsersController');

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
router.post('/users', postNew);

module.exports = router;
