const path = require('path');
const fs = require('fs');
const multer = require('multer');

let uploadsDir;
let upload;

if (process.env.VERCEL || (process.env.NODE_ENV === 'production' && !process.env.HOME)) {
  console.log('[SERVER] Running in serverless environment - file uploads disabled');
  uploadsDir = '/tmp'; // Use temp directory in serverless
  upload = multer({ 
    storage: multer.memoryStorage(), // Use memory storage in serverless
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    }
  });
} else {
  // Local development - use disk storage
  uploadsDir = path.join(__dirname, '..', '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Configure multer for photo uploads
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
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
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    }
  });
}

module.exports = {
  upload,
  uploadsDir
};
