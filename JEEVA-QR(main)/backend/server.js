/**
 * QR Emergency Alert System - Backend Server
 * Refactored to MVC Architecture
 */

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const { uploadsDir } = require('./config/upload');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const corsOptions = process.env.ALLOWED_ORIGIN ? { origin: process.env.ALLOWED_ORIGIN } : {};
app.use(cors(corsOptions));

// ============================================
// STATIC FILE SERVING
// ============================================

const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');

app.use('/css', express.static(path.join(FRONTEND_DIR, 'css')));
app.use('/js', express.static(path.join(FRONTEND_DIR, 'js')));
app.use('/uploads', express.static(uploadsDir));

// ============================================
// ROUTES
// ============================================

app.use('/', routes);

// Serve static assets (Favicons, images, root level assets)
app.use(express.static(FRONTEND_DIR));

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Global Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).send('Internal server error');
});

// ============================================
// START SERVER
// ============================================

if (require.main === module) {
  app.listen(PORT, () => {
    console.log('=========================================');
    console.log('  QR Emergency Alert System (MVC)');
    console.log('=========================================');
    console.log(`  Server running on: http://localhost:${PORT}`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('=========================================');
  });
}

module.exports = app;
