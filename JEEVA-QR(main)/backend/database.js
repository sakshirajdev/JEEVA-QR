/**
 * QR Emergency Alert System - Database Legacy Compatibility Adapter
 * Re-exports model & storage operations from the new MVC database and models modules.
 */

const userModel = require('./models/user.model');
const accidentLogModel = require('./models/accidentLog.model');
const photoModel = require('./models/photo.model');
const db = require('./db');

module.exports = {
  // User operations
  saveUser: userModel.saveUser,
  getUser: userModel.getUser,
  getAllUsers: userModel.getAllUsers,
  deleteUser: userModel.deleteUser,
  
  // Accident log operations
  logAccidentLocation: accidentLogModel.logAccidentLocation,
  getRecentAccidentLogs: accidentLogModel.getRecentAccidentLogs,
  
  // Photo operations
  logPhotoUpload: photoModel.logPhotoUpload,
  getPhotoByViewToken: photoModel.getPhotoByViewToken,
  markPhotoAsViewed: photoModel.markPhotoAsViewed,
  
  // Statistics
  getStats: () => ({
    totalUsers: Object.keys(db.users).length,
    totalAccidentLogs: db.accidentLogs.length,
    totalPhotos: Object.keys(db.photos).length,
    lastUpdated: new Date().toISOString()
  })
};
