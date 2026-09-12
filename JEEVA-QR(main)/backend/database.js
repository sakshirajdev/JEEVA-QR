/**
 * QR Emergency Alert System - Database Module
 * Simple JSON file-based storage for users and accident logs
 * Modified for Vercel serverless compatibility
 */

const fs = require('fs');
const path = require('path');

// ============================================
// DATABASE CONFIGURATION
// ============================================

const DATABASE_DIR = path.join(__dirname, '..', 'database');
const USERS_FILE = path.join(DATABASE_DIR, 'users.json');
const LOGS_FILE = path.join(DATABASE_DIR, 'accident_logs.json');
const PHOTOS_FILE = path.join(DATABASE_DIR, 'photos.json');

// ============================================
// IN-MEMORY STORAGE (for Vercel serverless)
// ============================================

let users = {};          // token -> user object
let accidentLogs = [];   // Array of accident location logs
let photos = {};         // viewToken -> photo info

// ============================================
// INITIALIZATION
// ============================================

/**
 * Ensure database directory exists
 */
function ensureDatabaseDir() {
  // Skip directory creation in Vercel serverless or any serverless environment
  if (process.env.VERCEL || process.env.NODE_ENV === 'production' && !process.env.HOME) {
    console.log('[DB] Running in serverless environment - using in-memory storage');
    return;
  }
  
  if (!fs.existsSync(DATABASE_DIR)) {
    fs.mkdirSync(DATABASE_DIR, { recursive: true });
    console.log('[DB] Created database directory:', DATABASE_DIR);
  }
}

/**
 * Load users from JSON file
 */
function loadUsers() {
  // Skip file loading in Vercel serverless or any serverless environment
  if (process.env.VERCEL || process.env.NODE_ENV === 'production' && !process.env.HOME) {
    console.log('[DB] Running in serverless environment - using in-memory users');
    return;
  }
  
  try {
    if (fs.existsSync(USERS_FILE)) {
      const raw = fs.readFileSync(USERS_FILE, 'utf8');
      const parsed = JSON.parse(raw || '{}');
      if (parsed && typeof parsed === 'object') {
        users = parsed;
        console.log('[DB] Loaded', Object.keys(users).length, 'users from database');
      }
    }
  } catch (err) {
    console.error('[DB] Failed to load users.json:', err.message);
    users = {};
  }
}

/**
 * Load accident logs from JSON file
 */
function loadAccidentLogs() {
  // Skip file loading in Vercel serverless or any serverless environment
  if (process.env.VERCEL || process.env.NODE_ENV === 'production' && !process.env.HOME) {
    console.log('[DB] Running in serverless environment - using in-memory accident logs');
    return;
  }
  
  try {
    if (fs.existsSync(LOGS_FILE)) {
      const raw = fs.readFileSync(LOGS_FILE, 'utf8');
      const parsed = JSON.parse(raw || '[]');
      if (Array.isArray(parsed)) {
        accidentLogs = parsed;
        console.log('[DB] Loaded', accidentLogs.length, 'accident logs');
      }
    }
  } catch (err) {
    console.error('[DB] Failed to load accident_logs.json:', err.message);
    accidentLogs = [];
  }
}

/**
 * Load photos from JSON file
 */
function loadPhotos() {
  // Skip file loading in Vercel serverless or any serverless environment
  if (process.env.VERCEL || process.env.NODE_ENV === 'production' && !process.env.HOME) {
    console.log('[DB] Running in serverless environment - using in-memory photos');
    return;
  }
  
  try {
    if (fs.existsSync(PHOTOS_FILE)) {
      const raw = fs.readFileSync(PHOTOS_FILE, 'utf8');
      const parsed = JSON.parse(raw || '{}');
      if (parsed && typeof parsed === 'object') {
        photos = parsed;
        console.log('[DB] Loaded', Object.keys(photos).length, 'photos from database');
      }
    }
  } catch (err) {
    console.error('[DB] Failed to load photos.json:', err.message);
    photos = {};
  }
}

/**
 * Save users to JSON file
 */
function saveUsers() {
  // Skip file saving in Vercel serverless or any serverless environment
  if (process.env.VERCEL || process.env.NODE_ENV === 'production' && !process.env.HOME) {
    console.log('[DB] Running in serverless environment - users stored in memory only');
    return;
  }
  
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (err) {
    console.error('[DB] Failed to save users.json:', err.message);
  }
}

/**
 * Save accident logs to JSON file
 */
function saveAccidentLogs() {
  // Skip file saving in Vercel serverless or any serverless environment
  if (process.env.VERCEL || process.env.NODE_ENV === 'production' && !process.env.HOME) {
    console.log('[DB] Running in serverless environment - accident logs stored in memory only');
    return;
  }
  
  try {
    fs.writeFileSync(LOGS_FILE, JSON.stringify(accidentLogs, null, 2), 'utf8');
  } catch (err) {
    console.error('[DB] Failed to save accident_logs.json:', err.message);
  }
}

/**
 * Save photos to JSON file
 */
function savePhotos() {
  // Skip file saving in Vercel serverless or any serverless environment
  if (process.env.VERCEL || process.env.NODE_ENV === 'production' && !process.env.HOME) {
    console.log('[DB] Running in serverless environment - photos stored in memory only');
    return;
  }
  
  try {
    fs.writeFileSync(PHOTOS_FILE, JSON.stringify(photos, null, 2), 'utf8');
  } catch (err) {
    console.error('[DB] Failed to save photos.json:', err.message);
  }
}

// ============================================
// USER OPERATIONS
// ============================================

/**
 * Save a new user
 * @param {string} token - Unique token
 * @param {object} user - User data
 */
function saveUser(token, user) {
  users[token] = user;
  saveUsers();
  console.log('[DB] Saved user:', user.fullName, '(Token:', token.substring(0, 8) + '...)');
}

/**
 * Get user by token
 * @param {string} token - User token
 * @returns {object|null}
 */
function getUser(token) {
  return users[token] || null;
}

/**
 * Get all users (for admin)
 * @returns {object}
 */
function getAllUsers() {
  return users;
}

/**
 * Delete user by token
 * @param {string} token - User token
 * @returns {boolean}
 */
function deleteUser(token) {
  if (users[token]) {
    delete users[token];
    saveUsers();
    return true;
  }
  return false;
}

// ============================================
// ACCIDENT LOG OPERATIONS
// ============================================

/**
 * Log an accident location
 * @param {string} token - User token
 * @param {object} locationData - Location information
 */
function logAccidentLocation(token, locationData) {
  const logEntry = {
    id: Date.now(),
    token: token,
    ...locationData
  };
  
  accidentLogs.push(logEntry);
  saveAccidentLogs();
  
  console.log('[DB] Accident location logged for:', locationData.userName);
  console.log('     Location:', locationData.mapsUrl);
}

/**
 * Get recent accident logs
 * @param {number} limit - Maximum number of logs to return
 * @returns {array}
 */
function getRecentAccidentLogs(limit = 10) {
  return accidentLogs.slice(-limit).reverse();
}

// ============================================
// STATISTICS
// ============================================

/**
 * Get database statistics
 * @returns {object}
 */
function getStats() {
  return {
    totalUsers: Object.keys(users).length,
    totalAccidentLogs: accidentLogs.length,
    totalPhotos: Object.keys(photos).length,
    lastUpdated: new Date().toISOString()
  };
}

// ============================================
// PHOTO OPERATIONS
// ============================================

/**
 * Log photo upload
 * @param {string} token - User token
 * @param {object} photoInfo - Photo information
 */
function logPhotoUpload(token, photoInfo) {
  photos[photoInfo.viewToken] = {
    ...photoInfo,
    token: token,
    viewed: false,
    createdAt: new Date().toISOString()
  };
  savePhotos();
  
  console.log('[DB] Photo uploaded:', photoInfo.filename, '(ViewToken:', photoInfo.viewToken.substring(0, 8) + '...)');
}

/**
 * Get photo by view token
 * @param {string} viewToken - Photo view token
 * @returns {object|null}
 */
function getPhotoByViewToken(viewToken) {
  return photos[viewToken] || null;
}

/**
 * Mark photo as viewed (one-time access)
 * @param {string} viewToken - Photo view token
 */
function markPhotoAsViewed(viewToken) {
  if (photos[viewToken]) {
    photos[viewToken].viewed = true;
    photos[viewToken].viewedAt = new Date().toISOString();
    savePhotos();
    console.log('[DB] Photo marked as viewed:', viewToken.substring(0, 8) + '...');
  }
}

// ============================================
// INITIALIZE ON MODULE LOAD
// ============================================

ensureDatabaseDir();
loadUsers();
loadAccidentLogs();
loadPhotos();

// ============================================
// EXPORTS
// ============================================

module.exports = {
  // User operations
  saveUser,
  getUser,
  getAllUsers,
  deleteUser,
  
  // Accident log operations
  logAccidentLocation,
  getRecentAccidentLogs,
  
  // Photo operations
  logPhotoUpload,
  getPhotoByViewToken,
  markPhotoAsViewed,
  
  // Statistics
  getStats
};
