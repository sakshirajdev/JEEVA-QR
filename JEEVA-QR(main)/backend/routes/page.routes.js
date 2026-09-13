const express = require('express');
const router = express.Router();

const pageController = require('../controllers/page.controller');
const photoController = require('../controllers/photo.controller');

// Home page
router.get('/', pageController.renderHome);

// Static HTML pages
router.get('/qr.html', pageController.renderQR);
router.get('/emergency-contacts.html', pageController.renderEmergencyContacts);
router.get('/government-helplines.html', pageController.renderGovernmentHelplines);
router.get('/privacy-settings.html', pageController.renderPrivacySettings);

// Emergency scan page
router.get('/scan/:token', pageController.renderScan);

// One-time photo view page
router.get('/photo/:viewToken', photoController.viewPhoto);

module.exports = router;
