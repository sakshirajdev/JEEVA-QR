const path = require('path');
const photoModel = require('../models/photo.model');
const userModel = require('../models/user.model');
const { generateToken } = require('../utils/token.utils');

const FRONTEND_DIR = path.join(__dirname, '..', '..', 'frontend');

/**
 * Upload emergency photo and return secure URL
 */
exports.uploadPhoto = (req, res) => {
  try {
    const { token, patientName, timestamp } = req.body;
    
    const user = userModel.getUser(token);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No photo uploaded' });
    }

    const viewToken = generateToken();
    
    photoModel.logPhotoUpload(token, {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      patientName: patientName,
      timestamp: timestamp,
      uploadedAt: new Date().toISOString(),
      viewToken: viewToken
    });

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
};

/**
 * View photo securely (one-time access)
 */
exports.viewPhoto = (req, res) => {
  const { viewToken } = req.params;
  
  const photoInfo = photoModel.getPhotoByViewToken(viewToken);
  if (!photoInfo) {
    return res.status(404).send('Photo not found or expired');
  }

  if (photoInfo.viewed) {
    return res.status(410).send('Photo link expired - one-time access only');
  }

  photoModel.markPhotoAsViewed(viewToken);

  res.sendFile(path.join(FRONTEND_DIR, 'photo-view.html'));
};
