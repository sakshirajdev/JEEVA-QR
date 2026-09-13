const crypto = require('crypto');

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
 * Encode string to base64
 * @param {string} str - String to encode
 * @returns {string}
 */
function encodeBase64(str) {
  return Buffer.from(str, 'utf8').toString('base64');
}

module.exports = {
  generateToken,
  encodeUserToken,
  decodeUserToken,
  encodeBase64
};
