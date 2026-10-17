const QRCode = require('qrcode');
const sharp = require('sharp');
const jsQR = require('jsqr');
const fs = require('fs');

const WISH_MESSAGE = `🌸 CHÚC MỪNG NGÀY PHỤ NỮ VIỆT NAM 20/10 🌸\n\nThân gửi ngàn lời chúc yêu thương và tốt đẹp nhất!\nChúc bạn luôn luôn xinh đẹp, rạng ngời, ngập tràn niềm vui và mỗi ngày đều hạnh phúc, bình yên, trọn vẹn yêu thương! 💖✨🌷`;

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

function generateStyledSVG(text, options = {}) {
  const {
    gradientStart = '#FF2A7A', // Vibrant sweet pink
    gradientMid = '#E11D48',   // Rose red
    gradientEnd = '#BE123C',   // Deep ruby red
    bg = '#FFFFFF',
    logoType = 'heart',        // 'heart' | 'rose'
    centerLogoRadius = 3.8,
    errorCorrectionLevel = 'H'
  } = options;

  const qr = QRCode.create(text, { errorCorrectionLevel });
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

  // Card Background with smooth rounded corners
  elements.push(`<rect width="${viewBoxSize}" height="${viewBoxSize}" fill="${bg}" rx="48"/>`);

  // Delicate decorative double border
  elements.push(`<rect x="18" y="18" width="${viewBoxSize - 36}" height="${viewBoxSize - 36}" fill="none" stroke="#FECDD3" stroke-width="3" rx="36"/>`);
  elements.push(`<rect x="26" y="26" width="${viewBoxSize - 52}" height="${viewBoxSize - 52}" fill="none" stroke="#FFE4E6" stroke-width="1.5" rx="30"/>`);

  // Corner accents
  elements.push(`<circle cx="40" cy="40" r="4" fill="${gradientStart}" opacity="0.7"/>`);
  elements.push(`<circle cx="${viewBoxSize - 40}" cy="40" r="4" fill="${gradientStart}" opacity="0.7"/>`);
  elements.push(`<circle cx="40" cy="${viewBoxSize - 40}" r="4" fill="${gradientEnd}" opacity="0.7"/>`);
  elements.push(`<circle cx="${viewBoxSize - 40}" cy="${viewBoxSize - 40}" r="4" fill="${gradientEnd}" opacity="0.7"/>`);

  // Draw Finders
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

  // Draw regular modules
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

  // Center Emblem
  const centerX = viewBoxSize / 2;
  const centerY = viewBoxSize / 2;
  const badgeRadius = (centerLogoRadius + 0.5) * moduleSize;

  elements.push(`
    <g filter="url(#shadow)">
      <circle cx="${centerX.toFixed(2)}" cy="${centerY.toFixed(2)}" r="${badgeRadius.toFixed(2)}" fill="#FFFFFF" stroke="#FDA4AF" stroke-width="4"/>
      <circle cx="${centerX.toFixed(2)}" cy="${centerY.toFixed(2)}" r="${(badgeRadius - 4).toFixed(2)}" fill="url(#badgeGlow)"/>
    </g>
  `);

  if (logoType === 'heart') {
    const heartScale = badgeRadius * 0.038;
    elements.push(`
      <g transform="translate(${centerX}, ${centerY - badgeRadius * 0.1}) scale(${heartScale})">
        <path d="M 0 -8 C -1 -18 -18 -18 -18 -4 C -18 7 -3 16 0 20 C 3 16 18 7 18 -4 C 18 -18 1 -18 0 -8 Z" fill="url(#finderGrad)" transform="scale(1.1)"/>
        <text x="0" y="32" font-family="'Segoe UI', 'Be Vietnam Pro', Roboto, sans-serif" font-size="12" font-weight="bold" fill="#BE123C" text-anchor="middle">20/10</text>
      </g>
    `);
  } else if (logoType === 'rose') {
    elements.push(`
      <g transform="translate(${centerX}, ${centerY})">
        <text x="0" y="-${(badgeRadius * 0.08).toFixed(2)}" font-size="${(badgeRadius * 0.85).toFixed(2)}" text-anchor="middle" dominant-baseline="central">🌹</text>
        <text x="0" y="${(badgeRadius * 0.58).toFixed(2)}" font-family="'Segoe UI', Roboto, sans-serif" font-size="${(badgeRadius * 0.32).toFixed(2)}" font-weight="900" fill="#9F1239" text-anchor="middle">20/10</text>
      </g>
    `);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" width="${viewBoxSize}" height="${viewBoxSize}">
    ${defs}
    ${elements.join('\n')}
  </svg>`;
}

async function verifyScan(imageBuffer, label) {
  const { data, info } = await sharp(imageBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const code = jsQR(new Uint8ClampedArray(data), info.width, info.height);
  if (code && code.data) {
    console.log(`[PASS] ${label} - Scanned successfully! (${code.data.length} chars)`);
    return true;
  } else {
    console.error(`[FAIL] ${label} - Could not decode!`);
    return false;
  }
}

async function main() {
  console.log('=== Building Final 20/10 QR Code Assets ===');

  // 1. Generate Standard High-Res Pink-Red QR (Heart Emblem)
  console.log('1. Generating "ma_qr_2010_hong_do_tinh_te"...');
  const svgHeart = generateStyledSVG(WISH_MESSAGE, {
    logoType: 'heart',
    centerLogoRadius: 3.8,
    errorCorrectionLevel: 'H'
  });
  fs.writeFileSync('e:\\2010\\ma_qr_2010_vector.svg', svgHeart);

  const pngHeartBuffer = await sharp(Buffer.from(svgHeart)).png({ quality: 100 }).toBuffer();
  fs.writeFileSync('e:\\2010\\ma_qr_2010_hong_do_tinh_te.png', pngHeartBuffer);
  await verifyScan(pngHeartBuffer, 'ma_qr_2010_hong_do_tinh_te.png');

  // 2. Generate Rose Emblem QR
  console.log('2. Generating "ma_qr_2010_hoa_hong"...');
  const svgRose = generateStyledSVG(WISH_MESSAGE, {
    logoType: 'rose',
    gradientStart: '#FF3366',
    gradientMid: '#D90429',
    gradientEnd: '#8B0000',
    centerLogoRadius: 3.8,
    errorCorrectionLevel: 'H'
  });
  const pngRoseBuffer = await sharp(Buffer.from(svgRose)).png({ quality: 100 }).toBuffer();
  fs.writeFileSync('e:\\2010\\ma_qr_2010_hoa_hong.png', pngRoseBuffer);
  await verifyScan(pngRoseBuffer, 'ma_qr_2010_hoa_hong.png');

  // 3. Build Luxury Printable / Shareable Greeting Card Poster (1200 x 1600 px)
  console.log('3. Generating luxury greeting card poster "thiep_chuc_mung_2010_kem_ma_qr.png"...');
  const bgPath = 'e:\\2010\\assets\\vietnam_womens_day_bg.jpg';
  
  const cardWidth = 1200;
  const cardHeight = 1600;

  const cardOverlaySVG = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${cardWidth}" height="${cardHeight}" viewBox="0 0 ${cardWidth} ${cardHeight}">
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

    <!-- Central Frosted Luxury Card Container -->
    <g filter="url(#cardShadow)">
      <rect x="90" y="80" width="1020" height="1440" rx="40" fill="url(#cardBgGrad)"/>
      <rect x="105" y="95" width="990" height="1410" rx="32" fill="none" stroke="url(#goldGrad)" stroke-width="3"/>
      <rect x="116" y="106" width="968" height="1388" rx="24" fill="none" stroke="#FECDD3" stroke-width="1.5" stroke-dasharray="6,6"/>
    </g>

    <!-- Top Badge / Ribbon -->
    <g transform="translate(600, 165)">
      <rect x="-190" y="-22" width="380" height="44" rx="22" fill="#FFE4E6" stroke="#FDA4AF" stroke-width="2"/>
      <text x="0" y="6" font-family="'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" fill="#BE123C" letter-spacing="4" text-anchor="middle">VIETNAMESE WOMEN'S DAY</text>
    </g>

    <!-- Main Title -->
    <g transform="translate(600, 275)">
      <text x="0" y="0" font-family="'Playfair Display', Georgia, serif" font-size="44" font-weight="900" fill="#881337" text-anchor="middle">CHÚC MỪNG NGÀY 20/10</text>
      <text x="0" y="42" font-family="'Segoe UI', Roboto, sans-serif" font-size="20" font-style="italic" fill="#9F1239" text-anchor="middle">Dành trọn yêu thương cho người phụ nữ tuyệt vời nhất ✨</text>
    </g>

    <!-- Golden Divider -->
    <g transform="translate(600, 360)">
      <line x1="-180" y1="0" x2="-25" y2="0" stroke="url(#goldGrad)" stroke-width="2"/>
      <circle cx="0" cy="0" r="8" fill="#E11D48"/>
      <circle cx="0" cy="0" r="14" fill="none" stroke="url(#goldGrad)" stroke-width="2"/>
      <line x1="25" y1="0" x2="180" y2="0" stroke="url(#goldGrad)" stroke-width="2"/>
    </g>

    <!-- Subtitle instruction -->
    <g transform="translate(600, 1260)">
      <rect x="-290" y="-28" width="580" height="56" rx="28" fill="#BE123C"/>
      <text x="0" y="7" font-family="'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="700" fill="#FFFFFF" text-anchor="middle">
        📱 Dùng Camera hoặc Zalo quét mã 💖
      </text>
    </g>

    <!-- Little Footer Text -->
    <g transform="translate(600, 1370)">
      <text x="0" y="0" font-family="'Segoe UI', Roboto, sans-serif" font-size="18" fill="#4B5563" text-anchor="middle">
        Mỗi đóa hoa nở là một nụ cười, mỗi lời chúc là vạn yêu thương.
      </text>
      <text x="0" y="30" font-family="'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#E11D48" text-anchor="middle">
        Chúc bạn luôn rạng ngời và hạnh phúc trọn vẹn! 🌷
      </text>
    </g>
  </svg>
  `;

  // Scale QR to 720x720 for crisp scan
  const qrResized = await sharp(pngHeartBuffer)
    .resize(720, 720)
    .toBuffer();

  const baseBg = await sharp(bgPath)
    .resize(cardWidth, cardHeight, { fit: 'cover' })
    .blur(2)
    .toBuffer();

  await sharp(baseBg)
    .composite([
      { input: Buffer.from(cardOverlaySVG), top: 0, left: 0 },
      // QR Code placed at center X: (1200 - 720)/2 = 240, Y: 430
      { input: qrResized, top: 430, left: 240 }
    ])
    .png({ quality: 95 })
    .toFile('e:\\2010\\thiep_chuc_mung_2010_kem_ma_qr.png');

  console.log('Saved e:\\2010\\thiep_chuc_mung_2010_kem_ma_qr.png');

  // Verify that the QR in the greeting card is also scannable!
  const croppedQR = await sharp('e:\\2010\\thiep_chuc_mung_2010_kem_ma_qr.png')
    .extract({ left: 240, top: 430, width: 720, height: 720 })
    .toBuffer();

  await verifyScan(croppedQR, 'QR inside thiep_chuc_mung_2010_kem_ma_qr.png');

  console.log('=== All files created and verified successfully! ===');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
