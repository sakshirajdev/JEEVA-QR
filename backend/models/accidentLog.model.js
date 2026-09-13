const db = require('../db');

/**
 * Log accident location
 * @param {string} token
 * @param {object} locationData
 */
function logAccidentLocation(token, locationData) {
  const logEntry = {
    id: Date.now(),
    token: token,
    ...locationData
  };
  
  db.accidentLogs.push(logEntry);
  db.saveAccidentLogs();
  
  console.log('[DB] Accident location logged for:', locationData.userName);
  console.log('     Location:', locationData.mapsUrl);
}

/**
 * Get recent accident logs
 * @param {number} limit
 * @returns {Array}
 */
function getRecentAccidentLogs(limit = 10) {
  return db.accidentLogs.slice(-limit).reverse();
}

module.exports = {
  logAccidentLocation,
  getRecentAccidentLogs
};
