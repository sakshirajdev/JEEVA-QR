/**
 * QR Display Page JavaScript
 * Shows the generated QR code for download/print
 */

(function () {
  'use strict';

  function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  const qrImage = document.getElementById('qrImage');
  const qrInfo = document.getElementById('qrInfo');
  const downloadLink = document.getElementById('downloadLink');
  const token = getQueryParam('token');
  const API_BASE = window.API_BASE || '';

  function drawCenteredText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    const lines = [];

    words.forEach((word) => {
      const testLine = line ? line + ' ' + word : word;
      if (ctx.measureText(testLine).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    });

    if (line) {
      lines.push(line);
    }

    lines.forEach((lineText, index) => {
      ctx.fillText(lineText, x, y + index * lineHeight);
    });

    return lines.length * lineHeight;
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });
  }

  function triggerDownload(url, filename) {
    const tempLink = document.createElement('a');
    tempLink.href = url;
    tempLink.download = filename;
    document.body.appendChild(tempLink);
    tempLink.click();
    tempLink.remove();
  }

  async function createEmergencyQrCard(qrSrc) {
    const qr = await loadImage(qrSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 900;
    canvas.height = 1200;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#d00000';
    ctx.fillRect(0, 0, canvas.width, 230);

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(105, 92, 48, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#d00000';
    ctx.fillRect(82, 84, 46, 16);
    ctx.fillRect(97, 69, 16, 46);

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.font = '700 48px Arial, sans-serif';
    ctx.fillText('EMERGENCY QR CODE', 180, 95);
    ctx.font = '700 30px Arial, sans-serif';
    ctx.fillText('आपातकालीन QR कोड', 180, 142);
    ctx.font = '700 28px Arial, sans-serif';
    ctx.fillText('Road Accident Help / सड़क दुर्घटना सहायता', 180, 188);

    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 8;
    ctx.strokeRect(32, 32, canvas.width - 64, canvas.height - 64);

    ctx.fillStyle = '#111111';
    ctx.textAlign = 'center';
    ctx.font = '700 36px Arial, sans-serif';
    ctx.fillText('Scan this QR to see emergency details', canvas.width / 2, 310);

    ctx.fillStyle = '#d00000';
    ctx.font = '700 28px Arial, sans-serif';
    ctx.fillText('Emergency information for accident help', canvas.width / 2, 354);
    ctx.font = '700 27px Arial, sans-serif';
    ctx.fillText('दुर्घटना में मदद के लिए आपातकालीन जानकारी', canvas.width / 2, 390);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(208, 425, 484, 484);
    ctx.strokeStyle = '#d00000';
    ctx.lineWidth = 10;
    ctx.strokeRect(208, 425, 484, 484);
    ctx.drawImage(qr, 238, 455, 424, 424);

    ctx.fillStyle = '#111111';
    ctx.font = '700 29px Arial, sans-serif';
    ctx.fillText('Do not remove this QR', canvas.width / 2, 955);
    ctx.fillText('कृपया इस QR को न हटाएं', canvas.width / 2, 993);

    ctx.font = '500 24px Arial, sans-serif';
    drawCenteredText(
      ctx,
      'Scan to contact family, emergency contacts and helplines during an accident.',
      canvas.width / 2,
      1038,
      720,
      32
    );

    ctx.font = '500 23px Arial, sans-serif';
    drawCenteredText(
      ctx,
      'दुर्घटना के समय परिवार, आपातकालीन संपर्क और हेल्पलाइन से जुड़ने के लिए स्कैन करें।',
      canvas.width / 2,
      1098,
      760,
      31
    );

    ctx.fillStyle = '#d00000';
    ctx.fillRect(0, 1110, canvas.width, 90);
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 28px Arial, sans-serif';
    ctx.fillText('JeevanQR - Emergency Road Safety', canvas.width / 2, 1150);
    ctx.font = '700 24px Arial, sans-serif';
    ctx.fillText('जीवनQR - आपातकालीन सड़क सुरक्षा', canvas.width / 2, 1182);

    return canvas.toDataURL('image/png');
  }

  async function downloadQrImage(e) {
    e.preventDefault();

    if (!downloadLink.href || downloadLink.href.endsWith('#')) {
      return;
    }

    try {
      const cardUrl = await createEmergencyQrCard(downloadLink.href);
      triggerDownload(cardUrl, 'jeevanqr-emergency-qr.png');
    } catch (err) {
      console.error('Emergency QR card download failed:', err);
      window.open(downloadLink.href, '_blank');
    }
  }

  if (!token) {
    qrInfo.innerHTML = '<span class="error">Missing token. Please generate your QR again.</span>';
    qrImage.style.display = 'none';
    downloadLink.classList.add('hidden');
  } else {
    const qrSrc = API_BASE + '/api/qr/' + encodeURIComponent(token);
    qrImage.src = qrSrc;
    downloadLink.href = qrSrc;
    downloadLink.addEventListener('click', downloadQrImage);

    qrImage.onerror = function () {
      qrInfo.innerHTML = '<span class="error">Unable to load QR code. Please try again.</span>';
      qrImage.style.display = 'none';
      downloadLink.classList.add('hidden');
    };

    qrImage.onload = function () {
      qrInfo.innerHTML = `
        <p class="info-text">
          Click Download Emergency QR Card to save a bilingual emergency card.
        </p>
      `;
      downloadLink.classList.remove('hidden');
    };
  }
})();
