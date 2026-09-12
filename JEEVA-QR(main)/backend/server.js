/**
 * QR Emergency Alert System - Backend Server
 * Express.js server handling registration, QR generation, and emergency data
 */

const express = require('express');
const path = require('path');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const cors = require('cors');
const QRCode = require('qrcode');
const multer = require('multer');
const fs = require('fs');

// Import database module
const db = require('./database');

// ============================================
// EXPRESS APP SETUP
// ============================================

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Enable CORS so frontend hosted on a different origin can call APIs.
// If you want to restrict to a specific origin, set ALLOWED_ORIGIN env var.
const corsOptions = process.env.ALLOWED_ORIGIN ? { origin: process.env.ALLOWED_ORIGIN } : {};
app.use(cors(corsOptions));

// ============================================
// FILE UPLOAD CONFIGURATION
// ============================================

// Create uploads directory if it doesn't exist (skip in Vercel)
let uploadsDir;
let upload;

if (process.env.VERCEL || process.env.NODE_ENV === 'production' && !process.env.HOME) {
  console.log('[SERVER] Running in serverless environment - file uploads disabled');
  uploadsDir = '/tmp'; // Use temp directory in serverless
  upload = multer({ 
    storage: multer.memoryStorage(), // Use memory storage in serverless
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
      // Only accept image files
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    }
  });
} else {
  // Local development - use disk storage
  uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Configure multer for photo uploads
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'emergency-' + uniqueSuffix + '.jpg');
    }
  });

  upload = multer({ 
    storage: storage,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
      // Only accept image files
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    }
  });
}

// ============================================
// STATIC FILE SERVING (Frontend)
// ============================================

const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');

// Serve static assets (CSS, JS)
app.use('/css', express.static(path.join(FRONTEND_DIR, 'css')));
app.use('/js', express.static(path.join(FRONTEND_DIR, 'js')));
app.use('/uploads', express.static(uploadsDir));

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generate secure random token
 * @returns {string} 32-character hex token
 */
function generateToken() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Encode user data into a self-contained token (for serverless compatibility)
 * @param {object} user - User data
 * @returns {string} Base64-encoded token
 */
function encodeUserToken(user) {
  const data = {
    n: user.fullName,
    b: user.bloodGroup,
    e: user.emergencyContacts.map(c => ({ n: c.name, p: c.phone })),
    g: user.governmentHelplines.map(h => ({ n: h.name, p: h.number })),
    t: Date.now()
  };
  return Buffer.from(JSON.stringify(data), 'utf8').toString('base64url');
}

/**
 * Decode user data from self-contained token
 * @param {string} token - Base64-encoded token
 * @returns {object|null} User data or null if invalid
 */
function decodeUserToken(token) {
  try {
    const data = JSON.parse(Buffer.from(token, 'base64url').toString('utf8'));
    return {
      fullName: data.n,
      bloodGroup: data.b,
      emergencyContacts: data.e.map(c => ({ name: c.n, phone: c.p })),
      governmentHelplines: data.g.map(h => ({ name: h.n, number: h.p })),
      createdAt: new Date(data.t).toISOString()
    };
  } catch (err) {
    console.error('Failed to decode token:', err.message);
    return null;
  }
}

/**
 * Validate Indian phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean}
 */
function isValidIndianPhone(phone) {
  // Temporarily accept ANY non-empty value
  return phone && phone.trim().length > 0;
}

/**
 * Clean phone number to digits only
 * @param {string} phone - Phone number
 * @returns {string}
 */
function cleanPhoneNumber(phone) {
  return phone.replace(/\D/g, '');
}

/**
 * Encode string to base64
 * @param {string} str - String to encode
 * @returns {string}
 */
function encodeBase64(str) {
  return Buffer.from(str, 'utf8').toString('base64');
}

// ============================================
// HTML PAGE ROUTES
// ============================================

// Home/Registration page
app.get('/', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

// QR display page
app.get('/qr.html', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'qr.html'));
});

// Emergency contacts page
app.get('/emergency-contacts.html', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'emergency-contacts.html'));
});

// Government helplines page
app.get('/government-helplines.html', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'government-helplines.html'));
});

// Privacy settings page
app.get('/privacy-settings.html', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'privacy-settings.html'));
});

// Emergency scan page (for rescuers)
app.get('/scan/:token', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'scan.html'));
});

// ============================================
// API ROUTES
// ============================================

/**
 * POST /api/register
 * Register a new user and generate token
 */
app.post('/api/register', (req, res) => {
  const { fullName, bloodGroup, emergencyContacts, governmentHelplines } = req.body;

  // Validate required fields
  if (!fullName || !bloodGroup) {
    return res.status(400).json({ 
      error: 'Missing required fields. सभी जानकारी आवश्यक है।' 
    });
  }

  // Validate emergency contacts
  if (!emergencyContacts || !Array.isArray(emergencyContacts) || emergencyContacts.length === 0) {
    return res.status(400).json({ 
      error: 'At least one emergency contact is required. कम से कम एक आपातकालीन संपर्क आवश्यक है।' 
    });
  }

  // Validate government helplines
  if (!governmentHelplines || !Array.isArray(governmentHelplines) || governmentHelplines.length === 0) {
    return res.status(400).json({ 
      error: 'At least one government helpline is required. कम से कम एक सरकारी हेल्पलाइन आवश्यक है।' 
    });
  }

  // Validate emergency contact phone numbers
  for (const contact of emergencyContacts) {
    if (!contact.name || !contact.phone || !isValidIndianPhone(contact.phone)) {
      return res.status(400).json({ 
        error: 'Invalid emergency contact information. अमान्य आपातकालीन संपर्क जानकारी।' 
      });
    }
  }

  // Validate government helpline numbers
  for (const helpline of governmentHelplines) {
    if (!helpline.name || !helpline.number || !isValidIndianPhone(helpline.number)) {
      return res.status(400).json({ 
        error: 'Invalid government helpline information. अमान्य सरकारी हेल्पलाइन जानकारी।' 
      });
    }
  }

  // Create user record
  const user = {
    fullName: fullName.trim(),
    bloodGroup: bloodGroup.trim().toUpperCase(),
    emergencyContacts: emergencyContacts.map(contact => ({
      name: contact.name.trim(),
      phone: cleanPhoneNumber(contact.phone)
    })),
    governmentHelplines: governmentHelplines.map(helpline => ({
      name: helpline.name.trim(),
      number: cleanPhoneNumber(helpline.number)
    })),
    createdAt: new Date().toISOString()
  };

  // Generate self-contained token (for serverless compatibility)
  // The token itself contains all user data, so no database lookup needed
  const token = encodeUserToken(user);
  
  // Also save to database for backward compatibility (local dev)
  db.saveUser(token, user);

  // Build response URLs (use relative URLs for universal compatibility)
  const publicUrl = `/scan/${token}`;

  res.json({
    token,
    publicUrl,
    qrImageUrl: `/api/qr/${token}`
  });
});

/**
 * GET /api/qr/:token
 * Generate and return QR code image (PNG)
 */
app.get('/api/qr/:token', async (req, res) => {
  const { token } = req.params;
  
  // Try to decode user from token (self-contained token)
  // Falls back to database lookup for backward compatibility
  let user = decodeUserToken(token);
  if (!user) {
    user = db.getUser(token);
  }
  
  if (!user) {
    return res.status(404).send('Unknown QR code');
  }

  // Build FULL absolute URL for QR code (required for scanning to work!)
  // Priority: SITE_URL env var > VERCEL_URL > request host > localhost fallback
  const protocol = req.protocol || 'https';
  const host = process.env.SITE_URL || 
               process.env.VERCEL_URL || 
               req.get('host') || 
               'localhost:3000';
  
  // Remove protocol if already in env var
  const cleanHost = host.replace(/^https?:\/\//, '');
  const baseUrl = process.env.SITE_URL ? 
                  (process.env.SITE_URL.startsWith('http') ? process.env.SITE_URL : `https://${cleanHost}`) :
                  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `${protocol}://${cleanHost}`);
  
  const publicUrl = `${baseUrl}/scan/${token}`;
  console.log('[QR] Generating QR with URL:', publicUrl);

  try {
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
    // Use toBuffer for universal compatibility (works in both serverless and local)
    const qrBuffer = await QRCode.toBuffer(publicUrl, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 512
    });
    res.send(qrBuffer);
  } catch (err) {
    console.error('QR generation failed:', err);
    res.status(500).send('Failed to generate QR code');
  }
});

/**
 * GET /api/users/:token/public
 * Get public user info (no raw phone number)
 */
app.get('/api/users/:token/public', (req, res) => {
  const { token } = req.params;
  
  // Try to decode user from token (self-contained token)
  // Falls back to database lookup for backward compatibility
  let user = decodeUserToken(token);
  if (!user) {
    user = db.getUser(token);
  }
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Return public data including arrays of emergency contacts and government helplines
  // Phone numbers are base64-encoded (not shown as text on page)
  res.json({
    fullName: user.fullName,
    bloodGroup: user.bloodGroup,
    emergencyContacts: user.emergencyContacts.map(contact => ({
      name: contact.name,
      phoneEncoded: encodeBase64(contact.phone)
    })),
    governmentHelplines: user.governmentHelplines
  });
});

/**
 * POST /api/users/:token/location
 * Log accident location (for monitoring/future features)
 */
app.post('/api/users/:token/location', (req, res) => {
  const { token } = req.params;
  
  // Try to decode user from token (self-contained token)
  // Falls back to database lookup for backward compatibility
  let user = decodeUserToken(token);
  if (!user) {
    user = db.getUser(token);
  }
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { latitude, longitude, mapsUrl } = req.body || {};

  // Log the accident location
  db.logAccidentLocation(token, {
    userName: user.fullName,
    latitude,
    longitude,
    mapsUrl,
    reportedAt: new Date().toISOString()
  });

  res.json({ ok: true });
});

/**
 * GET /api/stats
 * Get basic statistics (for admin/demo)
 */
app.get('/api/stats', (req, res) => {
  const stats = db.getStats();
  res.json(stats);
});

/**
 * POST /api/upload-photo
 * Upload emergency photo and return secure URL
 */
app.post('/api/upload-photo', upload.single('photo'), (req, res) => {
  try {
    const { token, patientName, timestamp } = req.body;
    
    // Validate user exists
    const user = db.getUser(token);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No photo uploaded' });
    }

    // Generate secure view token
    const viewToken = generateToken();
    
    // Log photo upload
    db.logPhotoUpload(token, {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      patientName: patientName,
      timestamp: timestamp,
      uploadedAt: new Date().toISOString(),
      viewToken: viewToken
    });

    // Create URLs
    const photoUrl = `/uploads/${req.file.filename}`;
    const secureUrl = `${req.protocol}://${req.get('host')}/photo/${viewToken}`;

    res.json({
      success: true,
      photoUrl: photoUrl,
      secureUrl: secureUrl,
      viewToken: viewToken,
      message: 'Photo uploaded successfully'
    });

  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({ error: 'Photo upload failed' });
  }
});

/**
 * GET /photo/:viewToken
 * View photo securely (one-time access)
 */
app.get('/photo/:viewToken', (req, res) => {
  const { viewToken } = req.params;
  
  // Get photo info from database
  const photoInfo = db.getPhotoByViewToken(viewToken);
  if (!photoInfo) {
    return res.status(404).send('Photo not found or expired');
  }

  // Check if photo has been viewed before (one-time access)
  if (photoInfo.viewed) {
    return res.status(410).send('Photo link expired - one-time access only');
  }

  // Mark as viewed
  db.markPhotoAsViewed(viewToken);

  // Serve the photo page
  res.sendFile(path.join(__dirname, '..', 'frontend', 'photo-view.html'));
});

// ============================================
// STATIC FILE SERVING (Favicons)
// ============================================

// Serve favicon files from frontend directory
app.use(express.static(FRONTEND_DIR));

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).send('Internal server error');
});

// ============================================
// START SERVER
// ============================================

// Start server only when running directly (not when required by serverless platforms)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log('=========================================');
    console.log('  QR Emergency Alert System');
    console.log('=========================================');
    console.log(`  Server running on: http://localhost:${PORT}`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('=========================================');
  });
}

module.exports = app;
