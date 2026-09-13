const db = require('../db');

/**
 * Log photo upload info
 * @param {string} token
 * @param {object} photoInfo
 */
function logPhotoUpload(token, photoInfo) {
  db.photos[photoInfo.viewToken] = {
    ...photoInfo,
    token: token,
    viewed: false,
    createdAt: new Date().toISOString()
  };
  db.savePhotos();
  
  console.log('[DB] Photo uploaded:', photoInfo.filename, '(ViewToken:', photoInfo.viewToken.substring(0, 8) + '...)');
}

/**
 * Get photo info by view token
 * @param {string} viewToken
 * @returns {object|null}
 */
function getPhotoByViewToken(viewToken) {
  return db.photos[viewToken] || null;
}

/**
 * Mark photo as viewed
 * @param {string} viewToken
 */
function markPhotoAsViewed(viewToken) {
  if (db.photos[viewToken]) {
    db.photos[viewToken].viewed = true;
    db.photos[viewToken].viewedAt = new Date().toISOString();
    db.savePhotos();
    console.log('[DB] Photo marked as viewed:', viewToken.substring(0, 8) + '...');
  }
}

module.exports = {
  logPhotoUpload,
  getPhotoByViewToken,
  markPhotoAsViewed
};
