// Frontend configuration values
// Default is empty string so relative `/api` works when frontend and backend are on same origin.
// Set Cloudinary values for emergency photo upload:
// 1. Sign up free at https://cloudinary.com/
// 2. Copy your cloud name from the dashboard
// 3. Create an unsigned upload preset under Settings → Upload
// 4. Paste them below
(function () {
  'use strict';
  // Use empty string for same-origin deployment (Vercel, etc.)
  window.API_BASE = '';

  // Cloudinary configuration - your cloud name has been set below.
  // Create an unsigned upload preset in your Cloudinary dashboard (Settings → Upload)
  // and paste its name in `CLOUDINARY_UPLOAD_PRESET`.
  window.CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/dxnr97voo/upload';
  window.CLOUDINARY_UPLOAD_PRESET = '<your_unsigned_upload_preset>';
})();
