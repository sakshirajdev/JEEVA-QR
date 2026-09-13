const userModel = require('../models/user.model');
const { encodeUserToken, decodeUserToken, encodeBase64 } = require('../utils/token.utils');
const { isValidIndianPhone, cleanPhoneNumber } = require('../utils/validator.utils');

/**
 * Register a new user and generate token
 */
exports.registerUser = (req, res) => {
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

  // Generate self-contained token
  const token = encodeUserToken(user);
  
  // Save to database
  userModel.saveUser(token, user);

  // Build response URLs
  const publicUrl = `/scan/${token}`;

  res.json({
    token,
    publicUrl,
    qrImageUrl: `/api/qr/${token}`
  });
};

/**
 * Get public user info (masked phone numbers)
 */
exports.getPublicUser = (req, res) => {
  const { token } = req.params;
  
  let user = decodeUserToken(token);
  if (!user) {
    user = userModel.getUser(token);
  }
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    fullName: user.fullName,
    bloodGroup: user.bloodGroup,
    emergencyContacts: user.emergencyContacts.map(contact => ({
      name: contact.name,
      phoneEncoded: encodeBase64(contact.phone)
    })),
    governmentHelplines: user.governmentHelplines
  });
};
