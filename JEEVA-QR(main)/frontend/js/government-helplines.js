/**
 * Government Helplines Page JavaScript
 * Handles adding unlimited government helplines and QR generation
 */

(function () {
  'use strict';

  // DOM Elements
  const helplinesList = document.getElementById('helplinesList');
  const addMoreBtn = document.getElementById('addMoreBtn');
  const backBtn = document.getElementById('backBtn');
  const privacyBtn = document.getElementById('privacyBtn');
  const generateBtn = document.getElementById('generateBtn');
  const messageEl = document.getElementById('message');
  const successEl = document.getElementById('success');
  const qrSection = document.getElementById('qrSection');

  // State
  let helplineCount = 0;
  let userData = {};

  // Common Indian helplines
  const commonHelplines = [
    { name: 'All-in-one Emergency', number: '112' },
    { name: 'Ambulance', number: '108' },
    { name: 'Fire', number: '101' },
    { name: 'Police', number: '102' },
    { name: 'Women Helpline', number: '1091' },
    { name: 'Road Accident Emergency', number: '1073' }
  ];

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
    console.log('DEBUG: phone="' + phone + '"');
    // Temporarily accept ANY non-empty value
    const isValid = phone && phone.trim().length > 0;
    console.log('DEBUG: isValid=' + isValid + ' (accepting any non-empty value)');
    return isValid;
  }

  /**
   * Initialize common helplines
   */
  function initializeCommonHelplines() {
    commonHelplines.forEach(helpline => {
      addHelplineFields(helpline.name, helpline.number, true);
    });
  }

  /**
   * Add helpline fields
   * @param {string} name - Helpline name (optional)
   * @param {string} number - Helpline number (optional)
   * @param {boolean} isCommon - Whether this is a common helpline
   */
  function addHelplineFields(name = '', number = '', isCommon = false) {
    helplineCount++;
    
    const helplineItem = document.createElement('div');
    helplineItem.className = 'helpline-item';
    helplineItem.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <h3 style="margin: 0; font-size: 1rem;">
          ${isCommon ? name : `Custom Helpline ${helplineCount - commonHelplines.length}`}
        </h3>
        ${!isCommon ? `<button type="button" class="btn-remove" onclick="removeHelpline(this)">❌ Remove</button>` : ''}
      </div>
      <label>
        Helpline Name / हेल्पलाइन नाम
      </label>
      <input
        type="text"
        class="helpline-name"
        value="${name}"
        placeholder="e.g. Medical Emergency"
        ${isCommon ? 'readonly' : 'required'}
      />

      <label>
        Helpline Number / हेल्पलाइन नंबर
      </label>
      <input
        type="tel"
        class="helpline-number"
        value="${number}"
        inputmode="tel"
        placeholder="e.g. 112"
        ${isCommon ? 'readonly' : 'required'}
      />
      <div class="info-text">
        ${isCommon ? 'Official government helpline' : 'Enter official helpline number'}
      </div>
    `;
    
    helplinesList.appendChild(helplineItem);
  }

  /**
   * Remove helpline fields
   * @param {HTMLElement} button - Remove button that was clicked
   */
  function removeHelpline(button) {
    const helplineItem = button.closest('.helpline-item');
    helplineItem.remove();
    
    // Renumber remaining custom helplines
    const customHelplines = helplinesList.querySelectorAll('.helpline-item:not([data-common])');
    customHelplines.forEach((item, index) => {
      const header = item.querySelector('h3');
      if (header) {
        header.textContent = `Custom Helpline ${index + 1}`;
      }
    });
  }

  /**
   * Collect all helpline data
   * @returns {Array} Array of helpline objects
   */
  function collectHelplines() {
    const helplines = [];
    const helplineItems = helplinesList.querySelectorAll('.helpline-item');
    
    console.log('DEBUG: Found', helplineItems.length, 'helpline items');
    
    helplineItems.forEach((item, index) => {
      const nameInput = item.querySelector('.helpline-name');
      const numberInput = item.querySelector('.helpline-number');
      
      console.log('DEBUG: Item', index, 'nameInput:', nameInput, 'numberInput:', numberInput);
      console.log('DEBUG: Item', index, 'name value:', nameInput ? nameInput.value : 'NULL');
      console.log('DEBUG: Item', index, 'number value:', numberInput ? numberInput.value : 'NULL');
      
      const name = nameInput ? nameInput.value.trim() : '';
      const number = numberInput ? numberInput.value.trim() : '';
      
      if (name && number) {
        helplines.push({ name, number });
      }
    });
    
    return helplines;
  }

  /**
   * Validate all helplines
   * @returns {boolean} True if all helplines are valid
   */
  function validateHelplines() {
    const helplines = collectHelplines();
    console.log('DEBUG: All collected helplines:', JSON.stringify(helplines, null, 2));
    
    if (helplines.length === 0) {
      showError('Please add at least one helpline. कृपया कम से कम एक हेल्पलाइन जोड़ें।');
      return false;
    }
    
    for (const helpline of helplines) {
      console.log('DEBUG: Checking helpline:', JSON.stringify(helpline));
      if (!isValidIndianPhone(helpline.number)) {
        console.log('DEBUG: FAILED validation for:', helpline.name);
        showError(`Invalid helpline number for ${helpline.name}. कृपया सही नंबर दें।`);
        return false;
      }
    }
    
    console.log('DEBUG: All helplines passed validation');
    return true;
  }

  /**
   * Generate QR code with all data
   */
  async function generateQR() {
    hideMessages();
    qrSection.classList.add('hidden');

    if (!validateHelplines()) {
      return;
    }

    // Collect all data
    const emergencyContacts = JSON.parse(sessionStorage.getItem('emergencyContacts') || '[]');
    const governmentHelplines = collectHelplines();
    
    // Disable button during request
    generateBtn.disabled = true;
    generateBtn.textContent = 'Please wait... / कृपया प्रतीक्षा करें...';

    try {
      const res = await fetch(API_BASE + '/api/register', {
        method: 'POST',
        
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...userData,
          emergencyContacts,
          governmentHelplines
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to register user');
      }

      const data = await res.json();
      const { token } = data;

      successEl.textContent = 'Emergency QR generated successfully. आपातकालीन QR बन गया है।';
      successEl.classList.remove('hidden');

      // Clear session storage
      sessionStorage.removeItem('emergencyContacts');
      sessionStorage.removeItem('userData');

      window.location.href = '/qr.html?token=' + encodeURIComponent(token);

    } catch (err) {
      console.error('Registration error:', err);
      showError('Unable to generate QR. कृपया बाद में पुनः प्रयास करें।');
    } finally {
      generateBtn.disabled = false;
      generateBtn.innerHTML = 'Generate Emergency QR<br />आपातकालीन QR बनाएं';
    }
  }

  /**
   * Go back to emergency contacts page
   */
  function goBack() {
    // Save current helplines
    const helplines = collectHelplines();
    sessionStorage.setItem('governmentHelplines', JSON.stringify(helplines));
    
    window.location.href = '/emergency-contacts.html';
  }

  /**
   * Go to privacy settings page
   */
  function goToPrivacySettings() {
    // Save current helplines
    const helplines = collectHelplines();
    sessionStorage.setItem('governmentHelplines', JSON.stringify(helplines));
    
    window.location.href = '/privacy-settings.html';
  }

  // Make removeHelpline globally accessible
  window.removeHelpline = removeHelpline;

  // Event listeners
  addMoreBtn.addEventListener('click', () => addHelplineFields());
  backBtn.addEventListener('click', goBack);
  privacyBtn.addEventListener('click', goToPrivacySettings);
  generateBtn.addEventListener('click', generateQR);

  // Initialize page
  function initializePage() {
    // Load user data
    userData = JSON.parse(sessionStorage.getItem('userData') || '{}');
    
    if (!userData.fullName) {
      // If no user data, go back to registration
      window.location.href = '/';
      return;
    }

    // Initialize common helplines
    initializeCommonHelplines();

    // Load existing helplines if coming back from this page
    const existingHelplines = sessionStorage.getItem('governmentHelplines');
    if (existingHelplines) {
      const helplines = JSON.parse(existingHelplines);
      
      // Clear existing fields
      helplinesList.innerHTML = '';
      
      // Add saved helplines
      helplines.forEach(helpline => {
        const isCommon = commonHelplines.some(common => common.number === helpline.number);
        addHelplineFields(helpline.name, helpline.number, isCommon);
      });
    }
  }

  initializePage();
})();
