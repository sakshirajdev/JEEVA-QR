const express = require('express');
const router = express.Router();

const { upload } = require('../config/upload');
const userController = require('../controllers/user.controller');
const qrController = require('../controllers/qr.controller');
const locationController = require('../controllers/location.controller');
const photoController = require('../controllers/photo.controller');
const statsController = require('../controllers/stats.controller');

// User Registration & Profile
router.post('/register', userController.registerUser);
router.get('/users/:token/public', userController.getPublicUser);

// QR Code Generation
router.get('/qr/:token', qrController.generateQRCode);

// Emergency Location Logging
router.post('/users/:token/location', locationController.logLocation);

// Photo Upload
router.post('/upload-photo', upload.single('photo'), photoController.uploadPhoto);

// Statistics
router.get('/stats', statsController.getStats);

module.exports = router;
