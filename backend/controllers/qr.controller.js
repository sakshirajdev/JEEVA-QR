const QRCode = require('qrcode');
const userModel = require('../models/user.model');
const { decodeUserToken } = require('../utils/token.utils');

/**
 * Generate and return QR code PNG image
 */
exports.generateQRCode = async (req, res) => {
  const { token } = req.params;
  
  let user = decodeUserToken(token);
  if (!user) {
    user = userModel.getUser(token);
  }
  
  if (!user) {
    return res.status(404).send('Unknown QR code');
  }

  // Priority: SITE_URL env var > VERCEL_URL > request host > localhost fallback
  const protocol = req.protocol || 'https';
  const host = process.env.SITE_URL || 
               process.env.VERCEL_URL || 
               req.get('host') || 
               'localhost:3000';
  
  const cleanHost = host.replace(/^https?:\/\//, '');
  const baseUrl = process.env.SITE_URL ? 
                  (process.env.SITE_URL.startsWith('http') ? process.env.SITE_URL : `https://${cleanHost}`) :
                  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `${protocol}://${cleanHost}`);
  
  const publicUrl = `${baseUrl}/scan/${token}`;
  console.log('[QR] Generating QR with URL:', publicUrl);

  try {
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
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
};
