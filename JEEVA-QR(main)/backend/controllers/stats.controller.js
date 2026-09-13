const db = require('../db');

/**
 * Get basic database statistics
 */
exports.getStats = (req, res) => {
  res.json({
    totalUsers: Object.keys(db.users).length,
    totalAccidentLogs: db.accidentLogs.length,
    totalPhotos: Object.keys(db.photos).length,
    lastUpdated: new Date().toISOString()
  });
};
