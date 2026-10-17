const QRCode = require('qrcode');
const sharp = require('sharp');
const jsQR = require('jsqr');
const fs = require('fs');

const PUBLIC_URL = 'https://manh1234-ne.github.io/thiep-2010/card.html';

function isFinderPattern(r, c, size) {
  if (r <= 7 && c <= 7) return true;
  if (r <= 7 && c >= size - 8) return true;
  if (r >= size - 8 && c <= 7) return true;
  return false;
}

function isInCenterLogo(r, c, size, logoRadiusInModules) {
  const center = (size - 1) / 2;
  const dist = Math.hypot(r - center, c - center);
  return dist <= logoRadiusInModules;
}

function generateWebQRSVG(url, options = {}) {
  const {
    gradientStart = '#FF2A7A',
    gradientMid = '#E11D48',
    gradientEnd = '#BE123C',
    bg = '#FFFFFF',
    centerLogoRadius = 3.6,
    errorCorrectionLevel = 'H'
  } = options;

  const qr = QRCode.create(url, { errorCorrectionLevel });
  const size = qr.modules.size;
  const margin = 4;
  const totalSize = size + margin * 2;
  const viewBoxSize = 1200;
  const moduleSize = viewBoxSize / totalSize;

  let elements = [];

  const defs = `
  <defs>
    <linearGradient id="qrGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${gradientStart}" />
      <stop offset="50%" stop-color="${gradientMid}" />
      <stop offset="100%" stop-color="${gradientEnd}" />
    </linearGradient>
    <linearGradient id="finderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${gradientStart}" />
      <stop offset="100%" stop-color="${gradientEnd}" />
    </linearGradient>
    <radialGradient id="badgeGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFF1F2" />
      <stop offset="100%" stop-color="#FFE4E6" />
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#BE123C" flood-opacity="0.25"/>
    </filter>
  </defs>`;

  // Background
  elements.push(`<rect width="${viewBoxSize}" height="${viewBoxSize}" fill="${bg}" rx="48"/>`);
  elements.push(`<rect x="18" y="18" width="${viewBoxSize - 36}" height="${viewBoxSize - 36}" fill="none" stroke="#FECDD3" stroke-width="3" rx="36"/>`);
  elements.push(`<rect x="26" y="26" width="${viewBoxSize - 52}" height="${viewBoxSize - 52}" fill="none" stroke="#FFE4E6" stroke-width="1.5" rx="30"/>`);

  function drawFinderPattern(ox, oy) {
    const x = (ox + margin) * moduleSize;
    const y = (oy + margin) * moduleSize;
    const w = 7 * moduleSize;

    elements.push(`<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${w.toFixed(2)}" height="${w.toFixed(2)}" rx="${(moduleSize * 1.5).toFixed(2)}" fill="url(#finderGrad)"/>`);
    const hollowW = 5 * moduleSize;
    const hollowOffset = 1 * moduleSize;
    elements.push(`<rect x="${(x + hollowOffset).toFixed(2)}" y="${(y + hollowOffset).toFixed(2)}" width="${hollowW.toFixed(2)}" height="${hollowW.toFixed(2)}" rx="${(moduleSize * 1.1).toFixed(2)}" fill="${bg}"/>`);
    const coreW = 3 * moduleSize;
    const coreOffset = 2 * moduleSize;
    elements.push(`<rect x="${(x + coreOffset).toFixed(2)}" y="${(y + coreOffset).toFixed(2)}" width="${coreW.toFixed(2)}" height="${coreW.toFixed(2)}" rx="${(moduleSize * 0.8).toFixed(2)}" fill="url(#finderGrad)"/>`);
  }

  drawFinderPattern(0, 0);
  drawFinderPattern(size - 7, 0);
  drawFinderPattern(0, size - 7);

  const roundRadius = moduleSize * 0.25;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (isFinderPattern(r, c, size)) continue;
      if (isInCenterLogo(r, c, size, centerLogoRadius)) continue;

      if (qr.modules.get(r, c)) {
        const x = (c + margin) * moduleSize;
        const y = (r + margin) * moduleSize;
        elements.push(`<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${(moduleSize * 0.95).toFixed(2)}" height="${(moduleSize * 0.95).toFixed(2)}" rx="${roundRadius.toFixed(2)}" fill="url(#qrGrad)"/>`);
      }
    }
  }

  const centerX = viewBoxSize / 2;
  const centerY = viewBoxSize / 2;
  const badgeRadius = (centerLogoRadius + 0.5) * moduleSize;

  elements.push(`
    <g filter="url(#shadow)">
      <circle cx="${centerX.toFixed(2)}" cy="${centerY.toFixed(2)}" r="${badgeRadius.toFixed(2)}" fill="#FFFFFF" stroke="#FDA4AF" stroke-width="4"/>
      <circle cx="${centerX.toFixed(2)}" cy="${centerY.toFixed(2)}" r="${(badgeRadius - 4).toFixed(2)}" fill="url(#badgeGlow)"/>
    </g>
    <g transform="translate(${centerX}, ${centerY})">
      <text x="0" y="-${(badgeRadius * 0.08).toFixed(2)}" font-size="${(badgeRadius * 0.85).toFixed(2)}" text-anchor="middle" dominant-baseline="central">🌹</text>
      <text x="0" y="${(badgeRadius * 0.58).toFixed(2)}" font-family="'Segoe UI', Roboto, sans-serif" font-size="${(badgeRadius * 0.32).toFixed(2)}" font-weight="900" fill="#9F1239" text-anchor="middle">20/10</text>
    </g>
  `);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" width="${viewBoxSize}" height="${viewBoxSize}">
    ${defs}
    ${elements.join('\n')}
  </svg>`;
}

async function verifyScan(imageBuffer, name) {
  const { data, info } = await sharp(imageBuffer)
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true });

  const code = jsQR(new Uint8ClampedArray(data), info.width, info.height);
  if (code) {
    console.log(`[PASS] ${name} -> Decoded: ${code.data}`);
    return true;
  } else {
    console.error(`[FAIL] ${name} -> Could not decode QR`);
    return false;
  }
}

async function main() {
  console.log('Generating QR code for live URL:', PUBLIC_URL);

  const qrSvg = generateWebQRSVG(PUBLIC_URL);
  const qrPngBuffer = await sharp(Buffer.from(qrSvg)).png({ quality: 95 }).toBuffer();
  fs.writeFileSync('e:\\2010\\ma_qr_thiep_online_2010.png', qrPngBuffer);
  console.log('Saved e:\\2010\\ma_qr_thiep_online_2010.png');

  await verifyScan(qrPngBuffer, 'ma_qr_thiep_online_2010.png');

  // Now create the complete Greeting Card Poster (1200x1600)
  const cardWidth = 1200;
  const cardHeight = 1600;
  const bgPath = 'e:\\2010\\assets\\vietnam_womens_day_bg.jpg';

  const cardOverlaySVG = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cardWidth} ${cardHeight}" width="${cardWidth}" height="${cardHeight}">
    <defs>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFDF73"/>
        <stop offset="40%" stop-color="#FFEAA7"/>
        <stop offset="70%" stop-color="#D4AF37"/>
        <stop offset="100%" stop-color="#AA771C"/>
      </linearGradient>
      <linearGradient id="cardBgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.96"/>
        <stop offset="100%" stop-color="#FFF5F7" stop-opacity="0.94"/>
      </linearGradient>
      <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000000" flood-opacity="0.4"/>
      </filter>
    </defs>

    <g filter="url(#cardShadow)">
      <rect x="90" y="80" width="1020" height="1440" rx="40" fill="url(#cardBgGrad)"/>
      <rect x="105" y="95" width="990" height="1410" rx="32" fill="none" stroke="url(#goldGrad)" stroke-width="3"/>
      <rect x="116" y="106" width="968" height="1388" rx="24" fill="none" stroke="#FECDD3" stroke-width="1.5" stroke-dasharray="6,6"/>
    </g>

    <!-- Top Ribbon -->
    <g transform="translate(600, 165)">
      <rect x="-190" y="-22" width="380" height="44" rx="22" fill="#FFE4E6" stroke="#FDA4AF" stroke-width="2"/>
      <text x="0" y="6" font-family="'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" fill="#BE123C" letter-spacing="4" text-anchor="middle">VIETNAMESE WOMEN'S DAY</text>
    </g>

    <!-- Main Title -->
    <g transform="translate(600, 275)">
      <text x="0" y="0" font-family="'Playfair Display', Georgia, serif" font-size="44" font-weight="900" fill="#881337" text-anchor="middle">CHÚC MỪNG NGÀY 20/10</text>
      <text x="0" y="42" font-family="'Segoe UI', Roboto, sans-serif" font-size="20" font-style="italic" fill="#9F1239" text-anchor="middle">Dành trọn yêu thương cho người phụ nữ tuyệt vời nhất ✨</text>
    </g>

    <!-- Divider -->
    <g transform="translate(600, 360)">
      <line x1="-180" y1="0" x2="-25" y2="0" stroke="url(#goldGrad)" stroke-width="2"/>
      <circle cx="0" cy="0" r="8" fill="#E11D48"/>
      <circle cx="0" cy="0" r="14" fill="none" stroke="url(#goldGrad)" stroke-width="2"/>
      <line x1="25" y1="0" x2="180" y2="0" stroke="url(#goldGrad)" stroke-width="2"/>
    </g>

    <!-- Scan Instruction -->
    <g transform="translate(600, 1260)">
      <rect x="-310" y="-28" width="620" height="56" rx="28" fill="#BE123C"/>
      <text x="0" y="7" font-family="'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="700" fill="#FFFFFF" text-anchor="middle">
        📱 Dùng Camera hoặc Zalo quét để mở thiệp 3D 💖
      </text>
    </g>

    <!-- Footer -->
    <g transform="translate(600, 1370)">
      <text x="0" y="0" font-family="'Segoe UI', Roboto, sans-serif" font-size="18" fill="#4B5563" text-anchor="middle">
        Quét mã để mở phong bì thư 3D, ngắm mưa hoa hồng và nghe nhạc du dương 🎵
      </text>
      <text x="0" y="30" font-family="'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#E11D48" text-anchor="middle">
        Chúc bạn luôn rạng ngời và hạnh phúc trọn vẹn! 🌷
      </text>
    </g>
  </svg>`;

  const qrResized = await sharp(qrPngBuffer)
    .resize(720, 720)
    .toBuffer();

  const baseBg = await sharp(bgPath)
    .resize(cardWidth, cardHeight, { fit: 'cover' })
    .blur(2)
    .toBuffer();

  await sharp(baseBg)
    .composite([
      { input: Buffer.from(cardOverlaySVG), top: 0, left: 0 },
      { input: qrResized, top: 430, left: 240 }
    ])
    .png({ quality: 95 })
    .toFile('e:\\2010\\thiep_2010_online_hoan_chinh.png');

  console.log('Saved e:\\2010\\thiep_2010_online_hoan_chinh.png');

  const croppedQR = await sharp('e:\\2010\\thiep_2010_online_hoan_chinh.png')
    .extract({ left: 240, top: 430, width: 720, height: 720 })
    .toBuffer();

  await verifyScan(croppedQR, 'QR inside thiep_2010_online_hoan_chinh.png');
}

main().catch(console.error);
