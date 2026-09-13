const path = require('path');

const FRONTEND_DIR = path.join(__dirname, '..', '..', 'frontend');

exports.renderHome = (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
};

exports.renderQR = (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'qr.html'));
};

exports.renderEmergencyContacts = (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'emergency-contacts.html'));
};

exports.renderGovernmentHelplines = (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'government-helplines.html'));
};

exports.renderPrivacySettings = (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'privacy-settings.html'));
};

exports.renderScan = (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'scan.html'));
};
