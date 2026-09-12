/**
 * Emergency Contacts Page JavaScript
 * Handles adding unlimited emergency contacts
 */

(function () {
  'use strict';

  // DOM Elements
  const contactsList = document.getElementById('contactsList');
  const addMoreBtn = document.getElementById('addMoreBtn');
  const backBtn = document.getElementById('backBtn');
  const nextBtn = document.getElementById('nextBtn');
  const messageEl = document.getElementById('message');

  // State
  let contactCount = 1;

  /**
   * Show error message
   * @param {string} msg - Error message to display
   */
  function showError(msg) {
    messageEl.textContent = msg;
    messageEl.classList.remove('hidden');
  }

  /**
   * Hide error message
   */
  function hideMessage() {
    messageEl.classList.add('hidden');
  }

  /**
   * Validate Indian phone number format
   * @param {string} phone - Phone number to validate
   * @returns {boolean}
   */
  function isValidIndianPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    // Allow 3-digit helpline numbers (like 112, 108) or regular phone numbers (10-13 digits)
    return (cleaned.length === 3) || (cleaned.length >= 10 && cleaned.length <= 13);
  }

  /**
   * Add new contact fields
   */
  function addContactFields() {
    contactCount++;
    
    const contactItem = document.createElement('div');
    contactItem.className = 'contact-item';
    contactItem.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <h3 style="margin: 0; font-size: 1rem;">Contact ${contactCount}</h3>
        <button type="button" class="btn-remove" onclick="removeContact(this)">❌ Remove</button>
      </div>
      <label>
        Contact Name / संपर्क नाम
      </label>
      <input
        type="text"
        class="contact-name"
        autocomplete="name"
        placeholder="e.g. Sunita Kumar"
        required
      />

      <label>
        Contact Number / संपर्क नंबर
      </label>
      <input
        type="tel"
        class="contact-phone"
        inputmode="tel"
        pattern="[0-9+\-\s]{3,15}"
        placeholder="e.g. 9876543210"
        required
      />
      <div class="info-text">
        Prefer Indian mobile number with STD / ISD code if needed.
      </div>
    `;
    
    contactsList.appendChild(contactItem);
  }

  /**
   * Remove contact fields
   * @param {HTMLElement} button - Remove button that was clicked
   */
  function removeContact(button) {
    const contactItem = button.closest('.contact-item');
    contactItem.remove();
    
    // Renumber remaining contacts
    const remainingContacts = contactsList.querySelectorAll('.contact-item');
    remainingContacts.forEach((item, index) => {
      const header = item.querySelector('h3');
      if (header) {
        header.textContent = `Contact ${index + 1}`;
      }
    });
    contactCount = remainingContacts.length;
  }

  /**
   * Collect all contact data
   * @returns {Array} Array of contact objects
   */
  function collectContacts() {
    const contacts = [];
    const contactItems = contactsList.querySelectorAll('.contact-item');
    
    contactItems.forEach(item => {
      const name = item.querySelector('.contact-name').value.trim();
      const phone = item.querySelector('.contact-phone').value.trim();
      
      if (name && phone) {
        contacts.push({ name, phone });
      }
    });
    
    return contacts;
  }

  /**
   * Validate all contacts
   * @returns {boolean} True if all contacts are valid
   */
  function validateContacts() {
    const contacts = collectContacts();
    
    if (contacts.length === 0) {
      showError('Please add at least one emergency contact. कृपया कम से कम एक आपातकालीन संपर्क जोड़ें।');
      return false;
    }
    
    for (const contact of contacts) {
      if (!isValidIndianPhone(contact.phone)) {
        showError(`Invalid phone number for ${contact.name}. कृपया सही फोन नंबर दें।`);
        return false;
      }
    }
    
    return true;
  }

  /**
   * Save contacts to session storage and navigate to next page
   */
  function goToNextPage() {
    hideMessage();
    
    if (!validateContacts()) {
      return;
    }
    
    const contacts = collectContacts();
    sessionStorage.setItem('emergencyContacts', JSON.stringify(contacts));
    
    window.location.href = '/government-helplines.html';
  }

  /**
   * Go back to registration page
   */
  function goBack() {
    window.location.href = '/';
  }

  // Make removeContact globally accessible
  window.removeContact = removeContact;

  // Event listeners
  addMoreBtn.addEventListener('click', addContactFields);
  backBtn.addEventListener('click', goBack);
  nextBtn.addEventListener('click', goToNextPage);

  // Load existing contacts if coming back from next page
  const existingContacts = sessionStorage.getItem('emergencyContacts');
  if (existingContacts) {
    const contacts = JSON.parse(existingContacts);
    
    // Clear existing fields except first one
    const firstContact = contactsList.querySelector('.contact-item');
    contactsList.innerHTML = '';
    contactsList.appendChild(firstContact);
    
    // Add saved contacts
    contacts.forEach((contact, index) => {
      if (index === 0) {
        // Update first contact
        firstContact.querySelector('.contact-name').value = contact.name;
        firstContact.querySelector('.contact-phone').value = contact.phone;
      } else {
        // Add new contact fields
        addContactFields();
        const lastContact = contactsList.lastElementChild;
        lastContact.querySelector('.contact-name').value = contact.name;
        lastContact.querySelector('.contact-phone').value = contact.phone;
      }
    });
  }
})();
