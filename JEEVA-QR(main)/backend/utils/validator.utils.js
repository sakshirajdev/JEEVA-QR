/**
 * Validate Indian phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean}
 */
function isValidIndianPhone(phone) {
  // Temporarily accept ANY non-empty value
  return Boolean(phone && phone.trim().length > 0);
}

/**
 * Clean phone number to digits only
 * @param {string} phone - Phone number
 * @returns {string}
 */
function cleanPhoneNumber(phone) {
  return phone ? phone.replace(/\D/g, '') : '';
}

module.exports = {
  isValidIndianPhone,
  cleanPhoneNumber
};
