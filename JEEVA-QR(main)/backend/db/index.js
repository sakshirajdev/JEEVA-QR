/**
 * Base Database Engine
 * Simple JSON file-based storage for users, accident logs, and photos
 * Modified for Vercel serverless compatibility (in-memory storage)
 */

const fs = require('fs');
const path = require('path');

const DATABASE_DIR = path.join(__dirname, '..', '..', 'database');
const USERS_FILE = path.join(DATABASE_DIR, 'users.json');
const LOGS_FILE = path.join(DATABASE_DIR, 'accident_logs.json');
const PHOTOS_FILE = path.join(DATABASE_DIR, 'photos.json');

// In-memory storage state
let users = {};          // token -> user object
let accidentLogs = [];   // Array of accident location logs
let photos = {};         // viewToken -> photo info

function ensureDatabaseDir() {
  if (process.env.VERCEL || (process.env.NODE_ENV === 'production' && !process.env.HOME)) {
    console.log('[DB] Running in serverless environment - using in-memory storage');
    return;
  }
  
  if (!fs.existsSync(DATABASE_DIR)) {
    fs.mkdirSync(DATABASE_DIR, { recursive: true });
    console.log('[DB] Created database directory:', DATABASE_DIR);
  }
}

function loadUsers() {
  if (process.env.VERCEL || (process.env.NODE_ENV === 'production' && !process.env.HOME)) {
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

function loadAccidentLogs() {
  if (process.env.VERCEL || (process.env.NODE_ENV === 'production' && !process.env.HOME)) {
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

function loadPhotos() {
  if (process.env.VERCEL || (process.env.NODE_ENV === 'production' && !process.env.HOME)) {
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

function saveUsers() {
  if (process.env.VERCEL || (process.env.NODE_ENV === 'production' && !process.env.HOME)) {
    return;
  }
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (err) {
    console.error('[DB] Failed to save users.json:', err.message);
  }
}

function saveAccidentLogs() {
  if (process.env.VERCEL || (process.env.NODE_ENV === 'production' && !process.env.HOME)) {
    return;
  }
  try {
    fs.writeFileSync(LOGS_FILE, JSON.stringify(accidentLogs, null, 2), 'utf8');
  } catch (err) {
    console.error('[DB] Failed to save accident_logs.json:', err.message);
  }
}

function savePhotos() {
  if (process.env.VERCEL || (process.env.NODE_ENV === 'production' && !process.env.HOME)) {
    return;
  }
  try {
    fs.writeFileSync(PHOTOS_FILE, JSON.stringify(photos, null, 2), 'utf8');
  } catch (err) {
    console.error('[DB] Failed to save photos.json:', err.message);
  }
}

// Initialize on module load
ensureDatabaseDir();
loadUsers();
loadAccidentLogs();
loadPhotos();

module.exports = {
  users,
  accidentLogs,
  photos,
  saveUsers,
  saveAccidentLogs,
  savePhotos
};
