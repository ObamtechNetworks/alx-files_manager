const express = require('express');
const appController = require('../controllers/AppController');
const { postNew, getMe } = require('../controllers/UsersController');
const { getConnect, getDisconnect } = require('../controllers/AuthController');
// eslint-disable-next-line no-unused-vars
const { postUpload, getShow, getIndex } = require('../controllers/FilesController');
// const { putPublish, putUnpublish, getFile } = require('../controllers/FilesController');

const router = express.Router();
router.get('/status', appController.getStatus); // definition of getStatus
router.get('/stats', appController.getStats); // definition of getStatus
router.post('/users', postNew); // definition of postNew
router.get('/connect', getConnect); // defination of getConnect
router.get('/disconnect', getDisconnect); // definition of getDisconnect
router.get('/users/me', getMe);
router.post('/files', postUpload);

module.exports = router;
