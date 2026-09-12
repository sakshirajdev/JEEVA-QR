# RakshaQR Emergency Favicon Implementation

## Files Created
- `favicon.ico` - Main favicon (empty placeholder - needs your SOS image)
- `favicon-16x16.png` - 16x16 PNG favicon
- `favicon-32x32.png` - 32x32 PNG favicon  
- `apple-touch-icon.png` - Apple touch icon for iOS
- `favicon.svg` - SVG favicon (red background with "SOS" text)

## HTML Implementation
All HTML files now include:
```html
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
```

## Backend Configuration
Updated `backend/server.js` to serve favicon files:
```javascript
// Serve favicon files
app.use(express.static(FRONTEND_DIR));
```

## Next Steps - Replace with Your SOS Image

1. **Convert your SOS image** to these formats:
   - `favicon.ico` (16x16 or 32x32 pixels)
   - `favicon-16x16.png` (16x16 pixels)
   - `favicon-32x32.png` (32x32 pixels)
   - `apple-touch-icon.png` (180x180 pixels)

2. **Online Tools**:
   - Use favicon.io/favicon-converter/
   - Or realfavicongenerator.net

3. **Replace the placeholder files** in `frontend/` folder

## Browser Compatibility
- ✅ Desktop browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers (Chrome Mobile, Safari Mobile)
- ✅ QR scanning apps (Google Camera, Google Lens, UPI apps)
- ✅ iOS home screen bookmarks

## Cache Refresh Instructions
After updating favicon files:
1. **Hard refresh**: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
2. **Clear browser cache** if favicon doesn't update
3. **Test on mobile** - QR scan with different apps

## Emergency Design Best Practices
- Red background (#DC2626) for urgency
- White text for contrast
- "SOS" clearly visible
- Simple, recognizable at small sizes
- Works in both light and dark browser themes

## Testing
1. Start server: `npm start`
2. Open `http://localhost:3000`
3. Check browser tab for emergency favicon
4. Test QR scan on mobile device
5. Verify favicon appears in scan page
