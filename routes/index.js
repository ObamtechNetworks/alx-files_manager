const express = require('express');
const appController = require('../controllers/AppController');
const { postNew, getMe } = require('../controllers/UsersController');
const { getConnect, getDisconnect } = require('../controllers/AuthController');
const { postUpload, getShow, getIndex } = require('../controllers/FilesController');
const { putPublish, putUnpublish, getFile } = require('../controllers/FilesController');

const router = express.Router();
router.get('/status', appController.getStatus); // definition of getStatus
router.get('/stats', appController.getStats); // definition of getStatus
router.post('/users', postNew); // definition of postNew
router.get('/connect', getConnect); // defination of getConnect
router.get('/disconnect', getDisconnect); // definition of getDisconnect
router.get('/users/me', getMe);
router.post('/files', postUpload);
router.get('/files/:id', getShow);
router.get('/files', getIndex);
router.put('/files/:id/publish', putPublish);
router.put('/files/:id/publish', putUnpublish);
router.get('/files/:id/data', getFile);

module.exports = router;
