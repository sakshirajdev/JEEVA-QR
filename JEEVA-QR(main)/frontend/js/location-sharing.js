/**
 * Location Sharing Service
 * Handles location sharing via internet and SMS fallback
 */

class LocationSharingService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.locationData = null;
  }

  /**
   * Check if device is online
   */
  checkConnectivity() {
    this.isOnline = navigator.onLine;
    return this.isOnline;
  }

  /**
   * Get current GPS location
   */
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.locationData = {
            latitude,
            longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString(),
            mapsUrl: `https://maps.google.com/?q=${latitude},${longitude}`,
            coordinates: `${latitude},${longitude}`
          };
          resolve(this.locationData);
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  /**
   * Generate location message for sharing
   */
  generateLocationMessage(patientName, includeMapsUrl = true) {
    if (!this.locationData) {
      throw new Error('Location data not available');
    }

    let message = `🚨 EMERGENCY ALERT 🚨\n\n`;
    message += `Patient: ${patientName}\n\n`;

    if (includeMapsUrl && this.locationData.mapsUrl) {
      message += `📍 Live Location:\n${this.locationData.mapsUrl}\n\n`;
    }

    message += `Accuracy: ±${Math.round(this.locationData.accuracy)}m\n`;
    message += `Time: ${new Date(this.locationData.timestamp).toLocaleString()}`;

    return message;
  }

  /**
   * Share location via internet using WhatsApp link
   */
  async shareLocationOnline(patientName, contacts) {
    try {
      const message = this.generateLocationMessage(patientName);
      const results = [];

      if (contacts && contacts.length > 0) {
        for (let i = 0; i < contacts.length; i++) {
          const contact = contacts[i];
          if (!contact.phone) {
            continue;
          }
          const phoneNumber = contact.phone.replace(/\D/g, '');
          const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
          const opened = window.open(whatsappUrl, '_blank');
          if (!opened) {
            window.location.href = whatsappUrl;
            break;
          }
          results.push({ contact: contact.name, method: 'WhatsApp', status: 'opened' });
          if (i < contacts.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }

        return {
          success: true,
          method: 'WhatsApp',
          results: results,
          message: `Opened WhatsApp chat for ${results.length} selected contact(s)`
        };
      }

      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      const opened = window.open(whatsappUrl, '_blank');
      if (!opened) {
        window.location.href = whatsappUrl;
      }

      return {
        success: true,
        method: 'WhatsApp',
        message: 'Opened WhatsApp share window. Select the recipient manually.'
      };
    } catch (error) {
      throw new Error(`Online sharing failed: ${error.message}`);
    }
  }

  /**
   * Generate SMS links for offline sharing
   */
  generateSMSLinks(patientName, contacts) {
    if (!this.locationData) {
      throw new Error('Location data not available');
    }

    const message = this.generateLocationMessage(patientName, false); // No maps URL for SMS
    const smsLinks = [];

    contacts.forEach(contact => {
      if (contact.phone) {
        // Create SMS link with URL encoding
        const smsUrl = `sms:${contact.phone}?body=${encodeURIComponent(message)}`;
        smsLinks.push({
          name: contact.name,
          phone: contact.phone,
          smsUrl: smsUrl
        });
      }
    });

    return smsLinks;
  }

  /**
   * Share location via SMS (offline fallback)
   */
  shareLocationViaSMS(patientName, contacts) {
    try {
      const smsLinks = this.generateSMSLinks(patientName, contacts);
      
      if (smsLinks.length === 0) {
        throw new Error('No valid contacts for SMS');
      }

      return {
        success: true,
        method: 'SMS',
        links: smsLinks,
        message: 'Click on contacts to send location via SMS'
      };
    } catch (error) {
      throw new Error(`SMS sharing failed: ${error.message}`);
    }
  }

  /**
   * Share location automatically to all emergency contacts
   */
  async autoShareToAllContacts(patientName, contacts) {
    try {
      const message = this.generateLocationMessage(patientName, true);
      const isOnline = this.checkConnectivity();
      
      if (isOnline) {
        // Online: Try to share via WhatsApp Web or other apps
        return await this.autoShareOnline(patientName, contacts, message);
      } else {
        // Offline: Send SMS to all contacts automatically
        return await this.autoShareSMS(patientName, contacts, message);
      }
    } catch (error) {
      throw new Error(`Auto sharing failed: ${error.message}`);
    }
  }

  /**
   * Auto share via online methods using a single WhatsApp window
   */
  async autoShareOnline(patientName, contacts, message) {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    const opened = window.open(whatsappUrl, '_blank');
    if (!opened) {
      window.location.href = whatsappUrl;
    }

    return {
      success: true,
      method: 'WhatsApp',
      results: [
        {
          name: 'Emergency broadcast',
          method: 'WhatsApp',
          status: 'opened'
        }
      ],
      message: 'Opened a single WhatsApp share window. Select the emergency contact manually.'
    };
  }

  /**
   * Auto share via SMS to all contacts
   */
  async autoShareSMS(patientName, contacts, message) {
    const results = [];
    
    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      try {
        const contactMessage = message.replace(/🚨 EMERGENCY ALERT 🚨/, `🚨 EMERGENCY ALERT for ${patientName} 🚨`);
        const smsUrl = `sms:${contact.phone}?body=${encodeURIComponent(contactMessage)}`;
        
        // Open SMS app with pre-filled message
        window.open(smsUrl, '_blank');
        
        results.push({ contact: contact.name, method: 'SMS', status: 'opened' });
        
        // Small delay between SMS to prevent overwhelming
        if (i < contacts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        results.push({ contact: contact.name, method: 'SMS', status: 'failed', error: error.message });
      }
    }
    
    return {
      success: true,
      method: 'Auto SMS',
      results: results,
      message: `Opened SMS for ${results.filter(r => r.status === 'opened').length} emergency contacts`
    };
  }

  /**
   * Comprehensive location sharing with automatic option
   */
  async shareLocation(patientName, contacts, preferredMethod = 'auto') {
    try {
      // Get current location
      await this.getCurrentLocation();
      
      // Check connectivity
      const isOnline = this.checkConnectivity();
      
      if (preferredMethod === 'auto') {
        // Auto-share to all contacts
        return await this.autoShareToAllContacts(patientName, contacts);
      } else if (preferredMethod === 'online') {
        if (!isOnline) {
          throw new Error('No internet connection available');
        }
        return await this.autoShareOnline(patientName, contacts, this.generateLocationMessage(patientName, true));
      } else if (preferredMethod === 'sms') {
        return await this.autoShareSMS(patientName, contacts, this.generateLocationMessage(patientName, false));
      }

    } catch (error) {
      throw new Error(`Location sharing failed: ${error.message}`);
    }
  }

  /**
   * Get formatted location for display
   */
  getFormattedLocation() {
    if (!this.locationData) return null;
    
    return {
      coordinates: this.locationData.coordinates,
      accuracy: `±${Math.round(this.locationData.accuracy)}m`,
      time: new Date(this.locationData.timestamp).toLocaleTimeString(),
      mapsUrl: this.locationData.mapsUrl
    };
  }
}

// Export for use in other files
window.LocationSharingService = LocationSharingService;
