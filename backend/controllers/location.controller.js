const accidentLogModel = require('../models/accidentLog.model');
const userModel = require('../models/user.model');
const { decodeUserToken } = require('../utils/token.utils');

/**
 * Log accident location
 */
exports.logLocation = (req, res) => {
  const { token } = req.params;
  
  let user = decodeUserToken(token);
  if (!user) {
    user = userModel.getUser(token);
  }
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { latitude, longitude, mapsUrl } = req.body || {};

  accidentLogModel.logAccidentLocation(token, {
    userName: user.fullName,
    latitude,
    longitude,
    mapsUrl,
    reportedAt: new Date().toISOString()
  });

  res.json({ ok: true });
};
