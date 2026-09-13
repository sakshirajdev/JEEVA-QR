/**
 * Privacy Settings Page JavaScript
 * Handles privacy preferences for emergency contacts
 */

(function () {
  'use strict';

  // DOM Elements
  const privacyForm = document.getElementById('privacyForm');
  const messageEl = document.getElementById('message');
  const successEl = document.getElementById('success');

  // State
  let userData = {};
  let privacySettings = {
    hidePhoneNumbers: true,           // Always hide phone numbers
    requireLocationConsent: true,     // Ask for location sharing consent
    anonymizeCaller: false,           // Hide rescuer's identity
    notifyWhenContacted: true,        // Send notification when contact is made
    dataRetentionDays: 365            // How long to keep data
  };

  /**
   * Show error message
   */
  function showError(msg) {
    messageEl.textContent = msg;
    messageEl.classList.remove('hidden');
    successEl.classList.add('hidden');
  }

  /**
   * Show success message
   */
  function showSuccess(msg) {
    successEl.textContent = msg;
    successEl.classList.remove('hidden');
    messageEl.classList.add('hidden');
  }

  /**
   * Hide all messages
   */
  function hideMessages() {
    messageEl.classList.add('hidden');
    successEl.classList.add('hidden');
  }

  /**
   * Load user data and privacy settings
   */
  function loadUserData() {
    userData = JSON.parse(sessionStorage.getItem('userData') || '{}');
    const saved = localStorage.getItem('privacySettings');
    
    if (saved) {
      privacySettings = { ...privacySettings, ...JSON.parse(saved) };
    }
    
    // Update form with current settings
    updateForm();
  }

  /**
   * Update form with current privacy settings
   */
  function updateForm() {
    document.getElementById('hidePhoneNumbers').checked = privacySettings.hidePhoneNumbers;
    document.getElementById('requireLocationConsent').checked = privacySettings.requireLocationConsent;
    document.getElementById('anonymizeCaller').checked = privacySettings.anonymizeCaller;
    document.getElementById('notifyWhenContacted').checked = privacySettings.notifyWhenContacted;
    document.getElementById('dataRetentionDays').value = privacySettings.dataRetentionDays;
  }

  /**
   * Save privacy settings
   */
  function savePrivacySettings() {
    hideMessages();

    // Collect form data
    privacySettings.hidePhoneNumbers = document.getElementById('hidePhoneNumbers').checked;
    privacySettings.requireLocationConsent = document.getElementById('requireLocationConsent').checked;
    privacySettings.anonymizeCaller = document.getElementById('anonymizeCaller').checked;
    privacySettings.notifyWhenContacted = document.getElementById('notifyWhenContacted').checked;
    privacySettings.dataRetentionDays = parseInt(document.getElementById('dataRetentionDays').value) || 365;

    // Save to localStorage
    localStorage.setItem('privacySettings', JSON.stringify(privacySettings));

    showSuccess('Privacy settings saved successfully! गोपनीयता सेटिंग्स सहेजी गई!');
  }

  /**
   * Go back to previous page
   */
  function goBack() {
    window.history.back();
  }

  /**
   * Delete all user data (privacy request)
   */
  function deleteAllData() {
    if (confirm('Are you sure you want to delete all your emergency data? This action cannot be undone.\n\nक्या आप वाकई अपना सभी आपातकालीन डेटा हटाना चाहते हैं? यह कार्रवाई पूर्ववत नहीं की जा सकती।')) {
      // Clear all storage
      sessionStorage.clear();
      localStorage.removeItem('privacySettings');
      
      // Redirect to home
      window.location.href = '/';
    }
  }

  // Event listeners
  privacyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    savePrivacySettings();
  });

  document.getElementById('backBtn').addEventListener('click', goBack);
  document.getElementById('deleteDataBtn').addEventListener('click', deleteAllData);

  // Initialize
  loadUserData();
})();
