/**
 * Camera Service for Emergency Photo Capture
 * Handles photo capture, upload, and secure sharing
 */

// Set your Cloudinary free account details here or in frontend/js/config.js
const CLOUDINARY_UPLOAD_URL = window.CLOUDINARY_UPLOAD_URL || 'https://api.cloudinary.com/v1_1/<your_cloud_name>/upload';
const CLOUDINARY_UPLOAD_PRESET = window.CLOUDINARY_UPLOAD_PRESET || '<your_unsigned_upload_preset>';

class EmergencyCameraService {
  constructor() {
    this.photoData = null;
    this.photoUrl = null;
    this.isPhotoShared = false;
  }

  /**
   * Check if camera is available
   */
  isCameraAvailable() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  /**
   * Request camera permission
   */
  async requestCameraPermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      // Stop the stream immediately (just checking permission)
      stream.getTracks().forEach(track => track.stop());
      return { success: true };
    } catch (error) {
      console.error('Camera permission error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Capture photo from camera
   */
  async capturePhoto() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      return new Promise((resolve, reject) => {
        navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        })
        .then(stream => {
          const video = document.createElement('video');
          video.srcObject = stream;
          video.play();

          video.onloadedmetadata = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0);
            
            // Stop camera stream
            stream.getTracks().forEach(track => track.stop());
            
            // Convert to blob and data URL
            canvas.toBlob((blob) => {
              this.photoData = blob;
              this.photoUrl = canvas.toDataURL('image/jpeg', 0.8);
              resolve({
                success: true,
                photoUrl: this.photoUrl,
                photoData: blob
              });
            }, 'image/jpeg', 0.8);
          };
        })
        .catch(error => {
          reject(error);
        });
      });
    }

    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*;capture=camera';
      input.style.display = 'none';
      document.body.appendChild(input);

      input.onchange = async () => {
        const file = input.files && input.files[0];
        document.body.removeChild(input);

        if (!file) {
          reject(new Error('No photo selected'));
          return;
        }

        this.photoData = file;
        this.photoUrl = URL.createObjectURL(file);
        resolve({
          success: true,
          photoUrl: this.photoUrl,
          photoData: file
        });
      };

      input.click();
    });
  }

  /**
   * Upload photo to Cloudinary and get secure URL
   */
  async uploadPhoto(token, patientName) {
    if (!this.photoData) {
      throw new Error('No photo data to upload');
    }

    if (CLOUDINARY_UPLOAD_URL.includes('<your_cloud_name>') || CLOUDINARY_UPLOAD_PRESET.includes('<your_unsigned_upload_preset>')) {
      throw new Error('Cloudinary upload settings are not configured. Set CLOUDINARY_UPLOAD_URL and CLOUDINARY_UPLOAD_PRESET in /frontend/js/emergency-camera.js or /frontend/js/config.js with your free Cloudinary values.');
    }

    const formData = new FormData();
    formData.append('file', this.photoData, `emergency-${Date.now()}.jpg`);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Cloudinary upload failed (${response.status}): ${body}`);
      }

      const result = await response.json();
      return {
        success: true,
        photoUrl: result.secure_url || result.url,
        secureUrl: result.secure_url || result.url
      };
    } catch (error) {
      throw new Error(`Photo upload failed: ${error.message}`);
    }
  }

  /**
   * Generate photo sharing message
   */
  generatePhotoMessage(patientName, photoUrl, mapsUrl) {
    return `🚨 Accident Photo Alert\n\nPhoto:\n${photoUrl}\n\n📍 Location:\n${mapsUrl}`;
  }

  /**
   * Get current location for photo sharing
   */
  async getLocationData() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            mapsUrl: `https://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`
          });
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
   * Share photo to all emergency contacts
   */
  async sharePhotoToAllContacts(patientName, contacts, photoUrl, secureUrl) {
    let mapsUrl = 'Location not available';

    try {
      const locationData = await this.getLocationData();
      mapsUrl = locationData.mapsUrl;
    } catch (error) {
      console.warn('Unable to retrieve location for photo share:', error.message);
    }

    const message = this.generatePhotoMessage(patientName, photoUrl, mapsUrl);
    const isOnline = navigator.onLine;
    
    if (isOnline) {
      return await this.sharePhotoOnline(patientName, contacts, message, photoUrl);
    } else {
      return await this.sharePhotoSMS(patientName, contacts, message);
    }
  }

  /**
   * Share photo via WhatsApp (online)
   */
  async sharePhotoOnline(patientName, contacts, message, photoUrl) {
    const results = [];
    
    if (!contacts || contacts.length === 0) {
      throw new Error('No emergency contacts selected for photo share');
    }

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

  /**
   * Share photo via SMS (offline)
   */
  async sharePhotoSMS(patientName, contacts, message) {
    const results = [];
    
    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      try {
        const smsUrl = `sms:${contact.phone}?body=${encodeURIComponent(message)}`;
        
        window.open(smsUrl, '_blank');
        results.push({ contact: contact.name, method: 'SMS', status: 'opened' });
        
        // Small delay between SMS
        if (i < contacts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        results.push({ contact: contact.name, method: 'SMS', status: 'failed', error: error.message });
      }
    }
    
    return {
      success: true,
      method: 'SMS Photo Sharing',
      results: results,
      message: `Photo shared via SMS to ${results.filter(r => r.status === 'opened').length} contacts`
    };
  }

  /**
   * Complete photo capture and sharing workflow
   */
  async captureAndSharePhoto(token, patientName, contacts) {
    try {
      // Step 1: Check camera permission
      const permission = await this.requestCameraPermission();
      if (!permission.success) {
        throw new Error(`Camera permission denied: ${permission.error}`);
      }

      // Step 2: Capture photo
      const captureResult = await this.capturePhoto();
      if (!captureResult.success) {
        throw new Error('Failed to capture photo');
      }

      // Step 3: Upload photo
      const uploadResult = await this.uploadPhoto(token, patientName);
      if (!uploadResult.success) {
        throw new Error('Failed to upload photo');
      }

      // Step 4: Share photo
      const shareResult = await this.sharePhotoToAllContacts(
        patientName, 
        contacts, 
        uploadResult.photoUrl, 
        uploadResult.secureUrl
      );

      this.isPhotoShared = true;

      return {
        success: true,
        photoUrl: uploadResult.photoUrl,
        secureUrl: uploadResult.secureUrl,
        viewToken: null,
        shareResult: shareResult
      };

    } catch (error) {
      throw new Error(`Photo capture and sharing failed: ${error.message}`);
    }
  }

  /**
   * Clear photo data
   */
  clearPhoto() {
    this.photoData = null;
    this.photoUrl = null;
    this.isPhotoShared = false;
  }
}

// Export for use in other files
window.EmergencyCameraService = EmergencyCameraService;
