/**
 * Registration Page JavaScript
 * Handles user registration and QR generation
 */

(function () {
  'use strict';

  // DOM Elements
  const form = document.getElementById('registerForm');
  const messageEl = document.getElementById('message');
  const successEl = document.getElementById('success');
  const qrSection = document.getElementById('qrSection');
  const qrImage = document.getElementById('qrImage');
  const downloadLink = document.getElementById('downloadLink');
  const generateBtn = document.getElementById('generateBtn');
  const userNameDisplay = document.getElementById('userNameDisplay');
  const userBloodDisplay = document.getElementById('userBloodDisplay');

  // API base (can be set by /js/config.js). Leave empty to use relative paths.
  const API_BASE = window.API_BASE || '';

  /**
   * Show error message
   * @param {string} msg - Error message to display
   */
  function showError(msg) {
    messageEl.textContent = msg;
    messageEl.classList.remove('hidden');
  }

  /**
   * Hide all messages
   */
  function hideMessages() {
    messageEl.classList.add('hidden');
    successEl.classList.add('hidden');
  }

  /**
   * Validate Indian phone number format
   * @param {string} phone - Phone number to validate
   * @returns {boolean}
   */
  function isValidIndianPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 13;
  }

  /**
   * Handle form submission
   * @param {Event} e - Form submit event
   */
  async function handleSubmit(e) {
    e.preventDefault();
    hideMessages();
    qrSection.classList.add('hidden');

    const fullName = document.getElementById('fullName').value.trim();
    const bloodGroup = document.getElementById('bloodGroup').value;

    // Client-side validation
    if (!fullName || !bloodGroup) {
      showError('Please fill all fields. सभी जानकारी भरें।');
      return;
    }

    // Disable button during request
    generateBtn.disabled = true;
    generateBtn.textContent = 'Please wait... / कृपया प्रतीक्षा करें...';

    // Save user data to session storage
    const userData = { fullName, bloodGroup };
    sessionStorage.setItem('userData', JSON.stringify(userData));

    // Navigate to emergency contacts page
    window.location.href = '/emergency-contacts.html';
  }

  // Initialize
  form.addEventListener('submit', handleSubmit);
})();
