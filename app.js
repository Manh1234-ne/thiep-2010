/**
 * 20/10 PINK-RED QR CODE & INTERACTIVE GREETING CARD
 * JavaScript logic: Canvas Petals, QR Generator, Audio Synthesizer, 3D Envelope,
 * Web Card Generator with Bouquets, Music, Rain of Wishes & Photos
 */

// Preset Wishes
const WISH_PRESETS = {
  lover: {
    recipient: 'Em yêu 💖',
    wish: `🌸 CHÚC MỪNG NGÀY 20/10 - NGƯỜI YÊU CỦA ANH 🌸\n\nChúc em luôn xinh đẹp, rạng rỡ và ngập tràn hạnh phúc!\nCảm ơn em đã đến và mang lại sự dịu dàng, ấm áp nhất cho cuộc đời anh. Mong em mỗi ngày đều mỉm cười thật tươi, vì khi em cười là khoảnh khắc đẹp nhất thế gian! Yêu em thật nhiều! 💖🌹✨`
  },
  mom: {
    recipient: 'Mẹ kính yêu 🌷',
    wish: `🌸 KÍNH CHÚC MẸ YÊU NGÀY 20/10 THẬT NHIỀU SỨC KHỎE 🌸\n\nNhân ngày Phụ nữ Việt Nam, con chúc Mẹ luôn mạnh khỏe, bình an và ngập tràn niềm vui.\nCảm ơn Mẹ vì tất cả những hi sinh và tình yêu thương vô bờ bến dành cho gia đình. Mẹ mãi là người phụ nữ tuyệt vời nhất trong lòng con! 💖💐✨`
  },
  sister: {
    recipient: 'Chị/Em gái thân yêu ✨',
    wish: `🌸 CHÚC MỪNG 20/10 CÔ GÁI TUYỆT VỜI 🌸\n\nChúc bạn luôn xinh đẹp, trẻ trung, yêu đời và đạt được mọi ước mơ của mình!\nCầu chúc cho công việc luôn thuận lợi, tiền vô như nước và sớm có người yêu chiều chuộng hết mực nhé! Happy 20/10! 💖🥳🎉`
  },
  colleague: {
    recipient: 'Chị em Đồng nghiệp / Đối tác 🌸',
    wish: `🌸 CHÚC MỪNG NGÀY PHỤ NỮ VIỆT NAM 20/10 🌸\n\nKính chúc các chị em luôn xinh đẹp rạng ngời, tự tin tỏa sáng và gặt hái thật nhiều thành công rực rỡ trong công việc lẫn cuộc sống!\nChúc bạn có một ngày 20/10 ngập tràn hoa, quà và những lời yêu thương! 💐✨💖`
  },
  general: {
    recipient: 'Người phụ nữ tuyệt vời 💖',
    wish: `🌸 CHÚC MỪNG NGÀY PHỤ NỮ VIỆT NAM 20/10 🌸\n\nThân gửi ngàn lời chúc yêu thương và tốt đẹp nhất!\nChúc bạn luôn luôn xinh đẹp, rạng ngời, ngập tràn niềm vui và mỗi ngày đều hạnh phúc, bình yên, trọn vẹn yêu thương! 💖✨🌷`
  }
};

// Color Palettes for Pink-Red QR
const COLOR_PALETTES = {
  rose_red: {
    name: 'Hồng Đỏ Lãng Mạn',
    start: '#FF2A7A',
    mid: '#E11D48',
    end: '#BE123C',
    finder: '#E11D48'
  },
  ruby_crimson: {
    name: 'Đỏ Ruby Quyến Rũ',
    start: '#E11D48',
    mid: '#9F1239',
    end: '#881337',
    finder: '#9F1239'
  },
  berry_pink: {
    name: 'Hồng Dâu Ngọt Ngào',
    start: '#FF1493',
    mid: '#FF69B4',
    end: '#C2185B',
    finder: '#C2185B'
  },
  sakura_coral: {
    name: 'Đào San Hô Tươi Sáng',
    start: '#FB7185',
    mid: '#F43F5E',
    end: '#E11D48',
    finder: '#E11D48'
  }
};

// Global Studio State
let currentTab = 'card';
let currentPalette = 'rose_red';
let currentLogo = 'heart';
let currentShape = 'heart'; // 'heart' (Mặc định lãng mạn) | 'square'
let selectedMode = 'web'; // 'web' | 'text'
let selectedBouquet = 'assets/bouquet_red_roses.jpg';
let selectedMusic = 'an_nut_nho';
let activeWishes = [
  'Luôn xinh đẹp rạng ngời 🌸',
  'Ngập tràn niềm vui & nụ cười ✨',
  'Bình an & Hạnh phúc viên mãn 💖',
  'Mỗi ngày đều là ngày rực rỡ 🌷',
  'Tự tin tỏa sáng theo cách của bạn 👑',
  'Mãi mãi trẻ trung yêu đời 🌹',
  'Mãi yêu em thật nhiều 💕'
];
let activePhotos = [
  'assets/sample_portrait.jpg'
];
let pendingImageReads = [];
let generatedWebUrl = '';

let audioCtx = null;
let isMusicPlaying = false;
let musicInterval = null;
let previewTimeout = null;

/* ===================================================
   CANVAS PETALS ENGINE (Physics & Flutter Simulation)
   =================================================== */
class PetalEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.petals = [];
    this.numPetals = 40;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.resize();

    window.addEventListener('resize', () => this.resize());
    this.initPetals();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  initPetals() {
    this.petals = [];
    for (let i = 0; i < this.numPetals; i++) {
      this.petals.push(this.createPetal(true));
    }
  }

  createPetal(randomY = false) {
    return {
      x: Math.random() * this.width,
      y: randomY ? Math.random() * this.height : -30,
      size: 10 + Math.random() * 16,
      speedX: -1 + Math.random() * 2,
      speedY: 1.2 + Math.random() * 2.2,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.04,
      pitch: Math.random() * Math.PI,
      pitchSpeed: 0.02 + Math.random() * 0.03,
      opacity: 0.6 + Math.random() * 0.35,
      hue: Math.random() > 0.5 ? 345 : 355,
      lightness: 55 + Math.random() * 25
    };
  }

  burst(count = 50) {
    for (let i = 0; i < count; i++) {
      const p = this.createPetal(false);
      p.y = Math.random() * (this.height * 0.3);
      p.speedY = 2.5 + Math.random() * 3.5;
      this.petals.push(p);
    }
    if (this.petals.length > 120) {
      this.petals = this.petals.slice(-100);
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.petals.length; i++) {
      const p = this.petals[i];
      p.y += p.speedY;
      p.x += Math.sin(p.pitch) * 1.5 + p.speedX;
      p.rotation += p.rotSpeed;
      p.pitch += p.pitchSpeed;

      if (p.y > this.height + 40 || p.x < -40 || p.x > this.width + 40) {
        this.petals[i] = this.createPetal(false);
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);
      this.ctx.scale(1, Math.cos(p.pitch));

      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.bezierCurveTo(-p.size * 0.8, -p.size * 0.5, -p.size * 0.8, p.size, 0, p.size * 1.3);
      this.ctx.bezierCurveTo(p.size * 0.8, p.size, p.size * 0.8, -p.size * 0.5, 0, 0);

      const grad = this.ctx.createLinearGradient(-p.size, 0, p.size, p.size);
      grad.addColorStop(0, `hsla(${p.hue}, 90%, ${p.lightness}%, ${p.opacity})`);
      grad.addColorStop(1, `hsla(${p.hue - 15}, 85%, ${p.lightness - 20}%, ${p.opacity * 0.85})`);

      this.ctx.fillStyle = grad;
      this.ctx.fill();
      this.ctx.restore();
    }

    requestAnimationFrame(this.animate);
  }
}

/* ===================================================
   WEB AUDIO API MULTI-TRACK ROMANTIC SYNTHESIZER
   =================================================== */
class RomanticMusicBox {
  constructor() {
    this.isPlaying = false;
    this.audioEl = null;
  }

  init() {
    if (!this.audioEl) {
      this.audioEl = new Audio('assets/an_nut_nho_tha_giac_mo.mp3');
      this.audioEl.preload = 'auto';
    }
  }

  playChime() {
    this.init();
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.08 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 1.2);
    });
  }

  startTrack(trackKey) {
    this.stopMelody();
    this.init();
    this.isPlaying = true;
    const src = (trackKey && (trackKey.startsWith('data:audio') || trackKey.includes('.mp3') || trackKey.includes('.m4a')))
      ? trackKey
      : 'assets/an_nut_nho_tha_giac_mo.mp3';
    this.audioEl.src = src;
    this.audioEl.currentTime = 0;
    this.audioEl.play().catch(e => console.log('Audio preview error:', e));
  }

  startMelody() {
    this.startTrack(selectedMusic || 'an_nut_nho');
  }

  stopMelody() {
    this.isPlaying = false;
    if (this.audioEl) {
      this.audioEl.pause();
    }
    if (musicInterval) {
      clearInterval(musicInterval);
      musicInterval = null;
    }
  }
}

const musicBox = new RomanticMusicBox();

/* ===================================================
   QR CODE STUDIO RENDERER (SVG & Canvas)
   =================================================== */
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

function getHeartClipPath(cx, cy, w, h) {
  const topCuspY = cy - h * 0.28;
  const topLobeY = cy - h * 0.48;
  const bottomTipY = cy + h * 0.48;
  const leftX = cx - w * 0.5;
  const rightX = cx + w * 0.5;

  return `M ${cx} ${bottomTipY}
    C ${cx - w * 0.22} ${cy + h * 0.30}, ${leftX} ${cy + h * 0.12}, ${leftX} ${cy - h * 0.12}
    C ${leftX} ${topLobeY}, ${cx - w * 0.08} ${topLobeY}, ${cx} ${topCuspY}
    C ${cx + w * 0.08} ${topLobeY}, ${rightX} ${topLobeY}, ${rightX} ${cy - h * 0.12}
    C ${rightX} ${cy + h * 0.12}, ${cx + w * 0.22} ${cy + h * 0.30}, ${cx} ${bottomTipY} Z`;
}

function renderQRCodeSVG(text, options = {}) {
  const {
    palette = COLOR_PALETTES[currentPalette],
    logo = currentLogo,
    shape = currentShape || 'heart',
    centerRadius = 3.8
  } = options;

  if (typeof QRCodeBundle === 'undefined' || !QRCodeBundle.create) {
    console.warn('QRCodeBundle not loaded yet');
    return '';
  }

  let qr;
  try {
    qr = QRCodeBundle.create(text, { errorCorrectionLevel: 'H' });
  } catch (e1) {
    try {
      qr = QRCodeBundle.create(text, { errorCorrectionLevel: 'M' });
    } catch (e2) {
      try {
        qr = QRCodeBundle.create(text, { errorCorrectionLevel: 'L' });
      } catch (e3) {
        console.error('QR code generation failed:', e3);
        return '';
      }
    }
  }
  const size = qr.modules.size;

  if (shape === 'heart') {
    // Pure Heart-Shaped QR Code (Mã QR hình trái tim thực thụ)
    // Toàn bộ các chấm dữ liệu được tạo hình ôm trọn đường cong Trái Tim mềm mại
    const viewBoxSize = 1000;
    const margin = 2.0;
    const total = size + margin * 2;
    const m = viewBoxSize / total;

    const hScale = 1.30;
    const hw = viewBoxSize * hScale;
    const hh = viewBoxSize * hScale;
    const heartPath = getHeartClipPath(viewBoxSize / 2, viewBoxSize / 2 + 10, hw, hh);

    let elements = [];

    const defs = `
    <defs>
      <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${palette.start}" />
        <stop offset="50%" stop-color="${palette.mid}" />
        <stop offset="100%" stop-color="${palette.end}" />
      </linearGradient>
      <linearGradient id="heartFinderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${palette.start}" />
        <stop offset="100%" stop-color="${palette.end}" />
      </linearGradient>
      <filter id="heartShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="${palette.end}" flood-opacity="0.25"/>
      </filter>
      <clipPath id="pureHeartClip">
        <path d="${heartPath}"/>
      </clipPath>
    </defs>`;

    // Nền trắng tinh khôi sát với mã QR, không viền rườm rà
    elements.push(`<rect width="${viewBoxSize}" height="${viewBoxSize}" fill="#FFFFFF"/>`);

    // 1. Dữ liệu các chấm được cắt/tạo hình theo dáng Trái Tim (Heart Contour)
    let dataModules = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if ((r <= 7 && c <= 7) || (r <= 7 && c >= size - 8) || (r >= size - 8 && c <= 7)) continue;
        if (Math.hypot(r - (size - 1) / 2, c - (size - 1) / 2) <= 3.8) continue;
        if (qr.modules.get(r, c)) {
          const x = (c + margin) * m;
          const y = (r + margin) * m;
          dataModules.push(`<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${(m * 0.95).toFixed(2)}" height="${(m * 0.95).toFixed(2)}" rx="${(m * 0.35).toFixed(2)}" fill="url(#heartGrad)"/>`);
        }
      }
    }

    elements.push(`<g clip-path="url(#pureHeartClip)">${dataModules.join('')}</g>`);

    // 2. Ba mắt định vị (Finder patterns) được giữ nguyên chuẩn 100% để quét nhạy trên mọi dòng máy
    function drawFinderPattern(ox, oy) {
      const x = (ox + margin) * m;
      const y = (oy + margin) * m;
      const w = 7 * m;
      elements.push(`<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${w.toFixed(2)}" height="${w.toFixed(2)}" rx="${(m * 1.6).toFixed(2)}" fill="url(#heartFinderGrad)"/>`);
      const hollowW = 5 * m;
      const hollowOffset = 1 * m;
      elements.push(`<rect x="${(x + hollowOffset).toFixed(2)}" y="${(y + hollowOffset).toFixed(2)}" width="${hollowW.toFixed(2)}" height="${hollowW.toFixed(2)}" rx="${(m * 1.1).toFixed(2)}" fill="#FFFFFF"/>`);
      const coreW = 3 * m;
      const coreOffset = 2 * m;
      elements.push(`<rect x="${(x + coreOffset).toFixed(2)}" y="${(y + coreOffset).toFixed(2)}" width="${coreW.toFixed(2)}" height="${coreW.toFixed(2)}" rx="${(m * 0.8).toFixed(2)}" fill="url(#heartFinderGrad)"/>`);
    }

    drawFinderPattern(0, 0);
    drawFinderPattern(size - 7, 0);
    drawFinderPattern(0, size - 7);

    // 3. Đường cong viền nét đứt nhẹ nhàng tôn dáng Trái Tim cho mã QR
    elements.push(`
      <path d="${heartPath}" fill="none" stroke="url(#heartFinderGrad)" stroke-width="2.5" stroke-dasharray="10 7" opacity="0.45"/>
    `);

    // 4. Biểu tượng trung tâm (Emblem Badge)
    const centerX = viewBoxSize / 2;
    const centerY = viewBoxSize / 2;
    const badgeRadius = 3.9 * m;

    elements.push(`
      <g filter="url(#heartShadow)">
        <circle cx="${centerX.toFixed(2)}" cy="${centerY.toFixed(2)}" r="${badgeRadius.toFixed(2)}" fill="#FFFFFF" stroke="#FDA4AF" stroke-width="3"/>
        <circle cx="${centerX.toFixed(2)}" cy="${centerY.toFixed(2)}" r="${(badgeRadius - 3.5).toFixed(2)}" fill="#FFF1F2"/>
      </g>
    `);

    if (logo === 'heart') {
      const scale = badgeRadius * 0.040;
      elements.push(`
        <g transform="translate(${centerX}, ${centerY - badgeRadius * 0.08}) scale(${scale})">
          <path d="M 0 -8 C -1 -18 -18 -18 -18 -4 C -18 7 -3 16 0 20 C 3 16 18 7 18 -4 C 18 -18 1 -18 0 -8 Z" fill="url(#heartGrad)" transform="scale(1.15)"/>
          <text x="0" y="32" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="900" fill="${palette.end}" text-anchor="middle">20/10</text>
        </g>
      `);
    } else if (logo === 'rose') {
      elements.push(`
        <g transform="translate(${centerX}, ${centerY})">
          <text x="0" y="-${(badgeRadius * 0.08).toFixed(2)}" font-size="${(badgeRadius * 0.85).toFixed(2)}" text-anchor="middle" dominant-baseline="central">🌹</text>
          <text x="0" y="${(badgeRadius * 0.58).toFixed(2)}" font-family="'Segoe UI', Roboto, sans-serif" font-size="${(badgeRadius * 0.32).toFixed(2)}" font-weight="900" fill="${palette.end}" text-anchor="middle">20/10</text>
        </g>
      `);
    } else if (logo === 'crown') {
      elements.push(`
        <g transform="translate(${centerX}, ${centerY})">
          <text x="0" y="-${(badgeRadius * 0.08).toFixed(2)}" font-size="${(badgeRadius * 0.85).toFixed(2)}" text-anchor="middle" dominant-baseline="central">👑</text>
          <text x="0" y="${(badgeRadius * 0.58).toFixed(2)}" font-family="'Segoe UI', Roboto, sans-serif" font-size="${(badgeRadius * 0.32).toFixed(2)}" font-weight="900" fill="${palette.end}" text-anchor="middle">20/10</text>
        </g>
      `);
    } else {
      elements.push(`
        <g transform="translate(${centerX}, ${centerY})">
          <text x="0" y="-${(badgeRadius * 0.1).toFixed(2)}" font-family="'Playfair Display', Georgia, serif" font-size="${(badgeRadius * 0.65).toFixed(2)}" font-weight="900" fill="url(#heartGrad)" text-anchor="middle" dominant-baseline="central">20/10</text>
          <text x="0" y="${(badgeRadius * 0.58).toFixed(2)}" font-family="'Segoe UI', Roboto, sans-serif" font-size="${(badgeRadius * 0.28).toFixed(2)}" font-weight="700" fill="${palette.end}" text-anchor="middle">L O V E</text>
        </g>
      `);
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" width="${viewBoxSize}" height="${viewBoxSize}">
      ${defs}
      ${elements.join('\n')}
    </svg>`;
  }

  // Otherwise shape === 'square'
  const margin = options.margin !== undefined ? options.margin : 1.8;
  const totalSize = size + margin * 2;
  const viewBoxSize = 1000;
  const moduleSize = viewBoxSize / totalSize;

  let elements = [];

  const defs = `
  <defs>
    <linearGradient id="qrStudioGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.start}" />
      <stop offset="50%" stop-color="${palette.mid}" />
      <stop offset="100%" stop-color="${palette.end}" />
    </linearGradient>
    <linearGradient id="finderStudioGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.start}" />
      <stop offset="100%" stop-color="${palette.end}" />
    </linearGradient>
    <filter id="studioShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="${palette.end}" flood-opacity="0.28"/>
    </filter>
  </defs>`;

  // Card Background: Trắng tinh khôi, sát với mã QR
  elements.push(`<rect width="${viewBoxSize}" height="${viewBoxSize}" fill="#FFFFFF"/>`);

  // Draw Finders
  function drawFinderPatternSquare(ox, oy) {
    const x = (ox + margin) * moduleSize;
    const y = (oy + margin) * moduleSize;
    const w = 7 * moduleSize;

    elements.push(`<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${w.toFixed(2)}" height="${w.toFixed(2)}" rx="${(moduleSize * 1.5).toFixed(2)}" fill="url(#finderStudioGrad)"/>`);
    const hollowW = 5 * moduleSize;
    const hollowOffset = 1 * moduleSize;
    elements.push(`<rect x="${(x + hollowOffset).toFixed(2)}" y="${(y + hollowOffset).toFixed(2)}" width="${hollowW.toFixed(2)}" height="${hollowW.toFixed(2)}" rx="${(moduleSize * 1.1).toFixed(2)}" fill="#FFFFFF"/>`);
    const coreW = 3 * moduleSize;
    const coreOffset = 2 * moduleSize;
    elements.push(`<rect x="${(x + coreOffset).toFixed(2)}" y="${(y + coreOffset).toFixed(2)}" width="${coreW.toFixed(2)}" height="${coreW.toFixed(2)}" rx="${(moduleSize * 0.8).toFixed(2)}" fill="url(#finderStudioGrad)"/>`);
  }

  drawFinderPatternSquare(0, 0);
  drawFinderPatternSquare(size - 7, 0);
  drawFinderPatternSquare(0, size - 7);

  // Draw regular modules
  const roundRadius = moduleSize * 0.25;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (isFinderPattern(r, c, size)) continue;
      if (isInCenterLogo(r, c, size, centerRadius)) continue;

      if (qr.modules.get(r, c)) {
        const x = (c + margin) * moduleSize;
        const y = (r + margin) * moduleSize;
        elements.push(`<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${(moduleSize * 0.95).toFixed(2)}" height="${(moduleSize * 0.95).toFixed(2)}" rx="${roundRadius.toFixed(2)}" fill="url(#qrStudioGrad)"/>`);
      }
    }
  }

  // Center Emblem
  const centerX = viewBoxSize / 2;
  const centerY = viewBoxSize / 2;
  const badgeRadius = (centerRadius + 0.4) * moduleSize;

  elements.push(`
    <g filter="url(#studioShadow)">
      <circle cx="${centerX.toFixed(2)}" cy="${centerY.toFixed(2)}" r="${badgeRadius.toFixed(2)}" fill="#FFFFFF" stroke="#FDA4AF" stroke-width="3"/>
      <circle cx="${centerX.toFixed(2)}" cy="${centerY.toFixed(2)}" r="${(badgeRadius - 3).toFixed(2)}" fill="#FFF1F2"/>
    </g>
  `);

  if (logo === 'heart') {
    const scale = badgeRadius * 0.038;
    elements.push(`
      <g transform="translate(${centerX}, ${centerY - badgeRadius * 0.08}) scale(${scale})">
        <path d="M 0 -8 C -1 -18 -18 -18 -18 -4 C -18 7 -3 16 0 20 C 3 16 18 7 18 -4 C 18 -18 1 -18 0 -8 Z" fill="url(#finderStudioGrad)" transform="scale(1.1)"/>
        <text x="0" y="32" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="900" fill="${palette.end}" text-anchor="middle">20/10</text>
      </g>
    `);
  } else if (logo === 'rose') {
    elements.push(`
      <g transform="translate(${centerX}, ${centerY})">
        <text x="0" y="-${(badgeRadius * 0.08).toFixed(2)}" font-size="${(badgeRadius * 0.85).toFixed(2)}" text-anchor="middle" dominant-baseline="central">🌹</text>
        <text x="0" y="${(badgeRadius * 0.58).toFixed(2)}" font-family="'Segoe UI', Roboto, sans-serif" font-size="${(badgeRadius * 0.32).toFixed(2)}" font-weight="900" fill="${palette.end}" text-anchor="middle">20/10</text>
      </g>
    `);
  } else if (logo === 'crown') {
    elements.push(`
      <g transform="translate(${centerX}, ${centerY})">
        <text x="0" y="-${(badgeRadius * 0.08).toFixed(2)}" font-size="${(badgeRadius * 0.85).toFixed(2)}" text-anchor="middle" dominant-baseline="central">👑</text>
        <text x="0" y="${(badgeRadius * 0.58).toFixed(2)}" font-family="'Segoe UI', Roboto, sans-serif" font-size="${(badgeRadius * 0.32).toFixed(2)}" font-weight="900" fill="${palette.end}" text-anchor="middle">20/10</text>
      </g>
    `);
  } else {
    elements.push(`
      <g transform="translate(${centerX}, ${centerY})">
        <text x="0" y="-${(badgeRadius * 0.1).toFixed(2)}" font-family="'Playfair Display', Georgia, serif" font-size="${(badgeRadius * 0.65).toFixed(2)}" font-weight="900" fill="url(#finderStudioGrad)" text-anchor="middle" dominant-baseline="central">20/10</text>
        <text x="0" y="${(badgeRadius * 0.58).toFixed(2)}" font-family="'Segoe UI', Roboto, sans-serif" font-size="${(badgeRadius * 0.28).toFixed(2)}" font-weight="700" fill="${palette.end}" text-anchor="middle">L O V E</text>
      </g>
    `);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" width="${viewBoxSize}" height="${viewBoxSize}">
    ${defs}
    ${elements.join('\n')}
  </svg>`;
}

/* Dynamic Server Info and Live Cloud 24/7 Deployment */
const CLOUD_PERMANENT_ORIGIN = 'https://manh1234-ne.github.io/thiep-2010';

let serverInfo = {
  localUrl: window.location.origin,
  lanUrl: window.location.origin,
  tunnelUrl: null,
  cloudUrl: CLOUD_PERMANENT_ORIGIN
};

function updateMobileConnectUI() {
  const mobileUrlDisplay = document.getElementById('mobile-url-display');
  const mobileModalUrlText = document.getElementById('mobile-modal-url-text');
  const mobileEntryQR = document.getElementById('mobile-entry-qr');

  // Prefer permanent 24/7 cloud URL so phones can access anytime even when PC is off
  const targetUrl = CLOUD_PERMANENT_ORIGIN || serverInfo.tunnelUrl || serverInfo.lanUrl || window.location.origin;

  if (mobileUrlDisplay) {
    mobileUrlDisplay.textContent = targetUrl;
  }
  if (mobileModalUrlText) {
    mobileModalUrlText.textContent = targetUrl;
  }
  if (mobileEntryQR && window.QRCode) {
    mobileEntryQR.innerHTML = '';
    new QRCode(mobileEntryQR, {
      text: targetUrl,
      width: 190,
      height: 190,
      colorDark: '#be123c',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });
  }
}

async function fetchServerInfo() {
  try {
    const res = await fetch('/api/info');
    if (res.ok) {
      serverInfo = await res.json();
      updateQRPreview();
      updateMobileConnectUI();
    }
  } catch (e) { }
}
fetchServerInfo();
setInterval(fetchServerInfo, 8000);

/* Update Live Preview */
function getActiveQRText() {
  if (selectedMode === 'web') {
    if (generatedWebUrl) return generatedWebUrl;
    // Default preview URL points to permanent 24/7 cloud web card
    return `${CLOUD_PERMANENT_ORIGIN}/card.html`;
  }
  const wishInput = document.getElementById('qr-wish-text');
  return (wishInput ? wishInput.value.trim() : '') || 'Chúc mừng ngày Phụ nữ Việt Nam 20/10!';
}

function updateQRPreview() {
  const previewContainer = document.getElementById('qr-preview-box');
  const densityIndicator = document.getElementById('density-indicator');
  const charCounter = document.getElementById('char-count');
  const subInstruction = document.getElementById('qr-sub-instruction');

  if (!previewContainer) return;

  const text = getActiveQRText();
  if (charCounter) charCounter.textContent = `${text.length} ký tự`;

  if (densityIndicator) {
    if (selectedMode === 'web') {
      densityIndicator.textContent = 'Mã Web Link (quét mở trang thiệp trực tuyến)';
      densityIndicator.className = 'density-ok';
    } else if (text.length > 350) {
      densityIndicator.textContent = 'Mã rất dày (vẫn quét tốt, nên thu gọn để đẹp hơn)';
      densityIndicator.className = 'density-warn';
    } else {
      densityIndicator.textContent = 'Độ nét tối ưu (quét cực nhanh)';
      densityIndicator.className = 'density-ok';
    }
  }

  if (subInstruction) {
    subInstruction.innerHTML = selectedMode === 'web'
      ? `<span>💖</span> Quét mã ${currentShape === 'heart' ? 'trái tim' : ''} bằng Camera hoặc Zalo để mở Web Thiệp 20/10 <span>✨</span>`
      : `<span>💖</span> Quét mã ${currentShape === 'heart' ? 'trái tim' : ''} bằng Camera hoặc Zalo để đọc trực tiếp lời chúc <span>✨</span>`;
  }

  const svgString = renderQRCodeSVG(text, {
    palette: COLOR_PALETTES[currentPalette],
    logo: currentLogo,
    shape: currentShape
  });

  previewContainer.innerHTML = svgString;
}

/* ===================================================
/* ===================================================
   OPTIMIZED QR CODE PNG EXPORTER (Tải sát mã QR, Siêu Nét HD)
   =================================================== */
function downloadPNG(size = 1200) {
  const btn = document.getElementById('btn-download-png');
  const originalHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.innerHTML = '<span>⏳</span> Đang chuẩn bị ảnh tải về...';
    btn.disabled = true;
  }

  const text = getActiveQRText();
  let svgString = '';
  try {
    svgString = renderQRCodeSVG(text, {
      palette: COLOR_PALETTES[currentPalette],
      logo: currentLogo,
      shape: currentShape,
      margin: currentShape === 'heart' ? 2.0 : 1.8
    });
  } catch (err) {
    console.error('Error generating QR SVG:', err);
  }

  if (!svgString) {
    if (btn) {
      btn.innerHTML = '<span>⚠️</span> Không thể tạo mã tải về!';
      btn.disabled = false;
      setTimeout(() => { btn.innerHTML = originalHtml; }, 2500);
    }
    return;
  }

  const recipientInput = document.getElementById('qr-recipient-name');
  const recipientName = recipientInput ? recipientInput.value.trim() : '';
  // Convert Vietnamese accented letters to clean ascii filename
  const cleanName = recipientName
    ? recipientName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
    : '';
  const prefix = currentShape === 'heart' ? 'ma_qr_trai_tim_2010' : 'ma_qr_2010';
  const fileName = cleanName ? `${prefix}_${cleanName}.png` : `${prefix}_hong_do.png`;

  function finishDownload(blobOrUrl) {
    try {
      const downloadUrl = typeof blobOrUrl === 'string' ? blobOrUrl : URL.createObjectURL(blobOrUrl);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      if (typeof blobOrUrl !== 'string') {
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 15000);
      }

      if (btn) {
        btn.innerHTML = '<span>✅</span> ĐÃ TẢI XONG ẢNH MÃ QR!';
        btn.disabled = false;
        setTimeout(() => {
          btn.innerHTML = originalHtml || (currentShape === 'heart'
            ? '<span>📥</span> TẢI MÃ QR TRÁI TIM VỀ MÁY (Ảnh Sắc Nét HD)'
            : '<span>📥</span> TẢI MÃ QR VỀ MÁY (Ảnh Sắc Nét HD)');
        }, 2500);
      }

      // Celebration burst around the button
      heartBurst(8);
    } catch (e) {
      console.error('Download execution error:', e);
      if (btn) {
        btn.innerHTML = originalHtml;
        btn.disabled = false;
      }
    }
  }

  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const blobUrl = URL.createObjectURL(svgBlob);
  const img = new Image();

  img.onload = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(blobUrl);

      if (canvas.toBlob) {
        canvas.toBlob(blob => {
          if (blob) {
            finishDownload(blob);
          } else {
            finishDownload(canvas.toDataURL('image/png'));
          }
        }, 'image/png');
      } else {
        finishDownload(canvas.toDataURL('image/png'));
      }
    } catch (e) {
      console.warn('Canvas export failed, using direct SVG blob fallback:', e);
      URL.revokeObjectURL(blobUrl);
      const directSvgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      finishDownload(directSvgBlob);
    }
  };

  img.onerror = () => {
    URL.revokeObjectURL(blobUrl);
    try {
      const base64Svg = btoa(unescape(encodeURIComponent(svgString)));
      const fallbackImg = new Image();
      fallbackImg.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(fallbackImg, 0, 0, size, size);
          finishDownload(canvas.toDataURL('image/png'));
        } catch (err) {
          finishDownload(svgBlob);
        }
      };
      fallbackImg.onerror = () => {
        finishDownload(svgBlob);
      };
      fallbackImg.src = 'data:image/svg+xml;base64,' + base64Svg;
    } catch (err) {
      finishDownload(svgBlob);
    }
  };

  img.src = blobUrl;
}

function downloadCardPoster() {
  const a = document.createElement('a');
  a.href = 'thiep_2010_online_hoan_chinh.png';
  a.download = 'thiep_2010_online_hoan_chinh.png';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/* ===================================================
   FLOATING HEARTS EFFECT
   =================================================== */
function spawnFloatingHeart(x, y) {
  const heart = document.createElement('div');
  heart.className = 'floating-heart';
  const emojis = ['💖', '🌹', '✨', '💐', '🌷', '💕', '🥰'];
  heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];
  heart.style.left = `${x || Math.random() * window.innerWidth}px`;
  document.body.appendChild(heart);

  setTimeout(() => {
    if (heart.parentNode) {
      heart.parentNode.removeChild(heart);
    }
  }, 4000);
}

function heartBurst(count = 20) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      spawnFloatingHeart(Math.random() * window.innerWidth, null);
    }, i * 100);
  }
}

/* ===================================================
   RAIN WISHES & PHOTOS DOM HELPERS
   =================================================== */
function renderWishChips() {
  const container = document.getElementById('wishes-chips-list');
  if (!container) return;
  container.innerHTML = '';

  activeWishes.forEach((wish, idx) => {
    const chip = document.createElement('div');
    chip.className = 'wish-chip';
    chip.innerHTML = `
      <span>${wish}</span>
      <button type="button" class="remove-chip-btn" data-idx="${idx}" title="Xóa">&times;</button>
    `;
    container.appendChild(chip);
  });

  container.querySelectorAll('.remove-chip-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.idx, 10);
      activeWishes.splice(idx, 1);
      renderWishChips();
    });
  });
}

function renderPhotoThumbnails() {
  const container = document.getElementById('photo-thumbnails-list');
  if (!container) return;
  container.innerHTML = '';

  activePhotos.forEach((photo, idx) => {
    const thumb = document.createElement('div');
    thumb.className = 'photo-thumb-item';
    thumb.innerHTML = `
      <img src="${photo}" alt="Ảnh ${idx + 1}">
      <button type="button" class="remove-photo-btn" data-idx="${idx}" title="Xóa ảnh">&times;</button>
    `;
    container.appendChild(thumb);
  });

  container.querySelectorAll('.remove-photo-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.idx, 10);
      activePhotos.splice(idx, 1);
      renderPhotoThumbnails();
    });
  });
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => resolve(ev.target.result);
    reader.onerror = () => reject(reader.error || new Error('Không đọc được file ảnh'));
    reader.readAsDataURL(file);
  });
}

async function waitForPendingImageReads() {
  if (!pendingImageReads.length) return;
  await Promise.allSettled(pendingImageReads);
  pendingImageReads = [];
}

/* ===================================================
   INITIALIZATION & EVENT BINDINGS
   =================================================== */
document.addEventListener('DOMContentLoaded', () => {
  // Init Petal Canvas
  const petalCanvas = document.getElementById('petal-canvas');
  const petalEngine = new PetalEngine(petalCanvas);

  // Tab Switching
  const navTabs = document.querySelectorAll('.nav-tab-btn');
  const tabViews = document.querySelectorAll('.tab-view');

  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      currentTab = target;

      navTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      tabViews.forEach(view => {
        if (view.id === `view-${target}`) {
          view.classList.add('active');
        } else {
          view.classList.remove('active');
        }
      });

      if (target === 'studio') {
        updateQRPreview();
      }
    });
  });

  // Music Button
  const musicBtn = document.getElementById('music-toggle-btn');
  if (musicBtn) {
    musicBtn.addEventListener('click', () => {
      if (isMusicPlaying) {
        musicBox.stopMelody();
        isMusicPlaying = false;
        musicBtn.classList.remove('playing');
        musicBtn.title = 'Bật nhạc lãng mạn 🎵';
      } else {
        musicBox.startMelody();
        isMusicPlaying = true;
        musicBtn.classList.add('playing');
        musicBtn.title = 'Tắt nhạc 🎵';
      }
    });
  }

  // Handle URL query parameters for personalized web greeting
  const urlParams = new URLSearchParams(window.location.search);
  const paramTo = urlParams.get('to');
  const paramMsg = urlParams.get('msg');
  if (paramTo) {
    const recipientEl = document.getElementById('letter-recipient');
    if (recipientEl) recipientEl.textContent = `Gửi ${paramTo} 💖`;
    const qrRecipInput = document.getElementById('qr-recipient-name');
    if (qrRecipInput) qrRecipInput.value = paramTo;
  }
  if (paramMsg) {
    const msgEl = document.getElementById('letter-message-body');
    if (msgEl) msgEl.textContent = paramMsg;
    const qrWishInput = document.getElementById('qr-wish-text');
    if (qrWishInput) qrWishInput.value = paramMsg;
  }

  // Auto-switch to Studio tab if requested via URL hash (#studio) or query (?tab=studio)
  if (window.location.hash === '#studio' || urlParams.get('tab') === 'studio') {
    const studioTabBtn = document.getElementById('tab-studio-btn');
    if (studioTabBtn) studioTabBtn.click();
  }

  // Custom MP3 Upload Handler
  const customMusicInput = document.getElementById('input-custom-music');
  const customMusicName = document.getElementById('custom-music-name');
  if (customMusicInput) {
    customMusicInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          selectedMusic = ev.target.result; // Data URL for MP3
          document.querySelectorAll('.music-choice-card').forEach(c => c.classList.remove('active'));
          if (customMusicName) customMusicName.textContent = `✓ Đã chọn file: ${file.name}`;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // 3D Envelope Interaction on View 1
  const envelope = document.getElementById('interactive-envelope');
  const openCardBtn = document.getElementById('btn-open-card');
  const resetCardBtn = document.getElementById('btn-reset-card');

  function openEnvelope() {
    if (!envelope) return;
    envelope.classList.add('open');
    musicBox.playChime();
    if (!isMusicPlaying) {
      musicBox.startMelody();
      isMusicPlaying = true;
      if (musicBtn) {
        musicBtn.classList.add('playing');
        musicBtn.title = 'Tắt nhạc 🎵';
      }
    }
    petalEngine.burst(30);
    heartBurst(15);
  }

  if (envelope) {
    envelope.addEventListener('click', () => {
      if (!envelope.classList.contains('open')) openEnvelope();
    });
  }
  if (openCardBtn) openCardBtn.addEventListener('click', openEnvelope);
  if (resetCardBtn) {
    resetCardBtn.addEventListener('click', () => {
      if (envelope) envelope.classList.remove('open');
    });
  }

  // Interactive Buttons on Card Experience
  const btnMorePetals = document.getElementById('btn-more-petals');
  if (btnMorePetals) {
    btnMorePetals.addEventListener('click', () => {
      petalEngine.burst(50);
      heartBurst(12);
    });
  }

  const btnCopyWish = document.getElementById('btn-copy-wish');
  if (btnCopyWish) {
    btnCopyWish.addEventListener('click', () => {
      const letterBody = document.getElementById('letter-message-body');
      const letterText = letterBody ? letterBody.innerText : '';
      navigator.clipboard.writeText(letterText).then(() => {
        const originalText = btnCopyWish.innerHTML;
        btnCopyWish.innerHTML = 'Đã sao chép! 💖';
        setTimeout(() => {
          btnCopyWish.innerHTML = originalText;
        }, 2000);
      });
    });
  }

  /* ===================================================
     MODE SELECTOR: WEB vs TEXT
     =================================================== */
  const modeBtns = document.querySelectorAll('.mode-tab-btn');
  const webOnlySections = document.querySelectorAll('.web-only-section');

  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedMode = btn.dataset.mode;

      webOnlySections.forEach(sec => {
        sec.style.display = selectedMode === 'web' ? 'block' : 'none';
      });

      updateQRPreview();
    });
  });

  /* ===================================================
     BOUQUET SELECTOR & UPLOAD
     =================================================== */
  const bouquetCards = document.querySelectorAll('.bouquet-choice-card');
  bouquetCards.forEach(card => {
    card.addEventListener('click', () => {
      bouquetCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      selectedBouquet = card.dataset.bouquet;
    });
  });

  const customBouquetInput = document.getElementById('input-custom-bouquet');
  const customBouquetName = document.getElementById('custom-bouquet-name');
  if (customBouquetInput) {
    customBouquetInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const readerPromise = readFileAsDataUrl(file).then((dataUrl) => {
        selectedBouquet = dataUrl;
        bouquetCards.forEach(c => c.classList.remove('active'));
        if (customBouquetName) customBouquetName.textContent = `✓ Đã chọn: ${file.name}`;
        return dataUrl;
      });

      pendingImageReads.push(readerPromise);
      await readerPromise;
    });
  }

  /* ===================================================
     MUSIC SELECTOR & INLINE PREVIEW
     =================================================== */
  const musicCards = document.querySelectorAll('.music-choice-card');
  musicCards.forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.classList.contains('preview-play-btn')) return;
      musicCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      selectedMusic = card.dataset.music;
    });
  });

  const previewPlayBtns = document.querySelectorAll('.preview-play-btn');
  previewPlayBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const track = btn.dataset.preview;

      if (btn.classList.contains('playing')) {
        musicBox.stopMelody();
        btn.classList.remove('playing');
        btn.textContent = '▶';
        if (previewTimeout) clearTimeout(previewTimeout);
      } else {
        previewPlayBtns.forEach(b => {
          b.classList.remove('playing');
          b.textContent = '▶';
        });
        btn.classList.add('playing');
        btn.textContent = '⏸';
        musicBox.startTrack(track);

        if (previewTimeout) clearTimeout(previewTimeout);
        // Preview vocal music for 30 seconds
        previewTimeout = setTimeout(() => {
          musicBox.stopMelody();
          btn.classList.remove('playing');
          btn.textContent = '▶';
        }, 30000);
      }
    });
  });

  /* ===================================================
     RAIN OF WISHES EDITOR
     =================================================== */
  renderWishChips();

  const inputNewWish = document.getElementById('input-new-wish');
  const btnAddWish = document.getElementById('btn-add-wish');

  function addNewWish(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (!activeWishes.includes(trimmed)) {
      activeWishes.push(trimmed);
      renderWishChips();
    }
  }

  if (btnAddWish && inputNewWish) {
    btnAddWish.addEventListener('click', () => {
      addNewWish(inputNewWish.value);
      inputNewWish.value = '';
    });
    inputNewWish.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        addNewWish(inputNewWish.value);
        inputNewWish.value = '';
      }
    });
  }

  const suggChips = document.querySelectorAll('.sugg-chip');
  suggChips.forEach(chip => {
    chip.addEventListener('click', () => {
      addNewWish(chip.dataset.wish);
    });
  });

  /* ===================================================
     RAIN OF PHOTOS EDITOR
     =================================================== */
  renderPhotoThumbnails();

  async function uploadClientImage(dataUrl) {
    if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image')) return dataUrl;
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const formData = new FormData();
      formData.append('file', blob, 'photo.jpg');
      const uploadRes = await fetch('https://tmpfiles.org/api/v1/upload', {
        method: 'POST',
        body: formData
      });
      if (uploadRes.ok) {
        const json = await uploadRes.json();
        if (json && json.status === 'success' && json.data && json.data.url) {
          const uploadedUrl = new URL(json.data.url);
          if (uploadedUrl.protocol === 'https:' && uploadedUrl.hostname === 'tmpfiles.org') {
            if (!uploadedUrl.pathname.startsWith('/dl/')) {
              uploadedUrl.pathname = `/dl${uploadedUrl.pathname}`;
            }
            return uploadedUrl.href;
          }
        }
      }
    } catch (err) {
      console.warn('Client upload to tmpfiles failed:', err);
    }
    return null;
  }

  const inputRainPhotos = document.getElementById('input-rain-photos');
  if (inputRainPhotos) {
    inputRainPhotos.addEventListener('change', async (e) => {
      const files = Array.from(e.target.files);
      if (!files.length) return;
      // If currently only the default sample photo is in the list, replace it with the new uploads
      if (activePhotos.length === 1 && activePhotos[0] === 'assets/sample_portrait.jpg') {
        activePhotos = [];
      }

      const readPromises = files.map(file => readFileAsDataUrl(file));
      pendingImageReads.push(...readPromises);

      const results = await Promise.all(readPromises);
      activePhotos.push(...results);
      renderPhotoThumbnails();
    });
  }

  const btnUseSamplePhoto = document.getElementById('btn-use-sample-photo');
  if (btnUseSamplePhoto) {
    btnUseSamplePhoto.addEventListener('click', () => {
      if (!activePhotos.includes('assets/sample_portrait.jpg')) {
        activePhotos.push('assets/sample_portrait.jpg');
        renderPhotoThumbnails();
      }
    });
  }

  /* ===================================================
     GENERATE WEB CARD QR & LINK
     =================================================== */
  const btnGenerateWebQR = document.getElementById('btn-generate-web-qr');
  const webLinkBox = document.getElementById('web-link-display-box');
  const generatedWebUrlInput = document.getElementById('generated-web-url');
  const btnCopyWebUrl = document.getElementById('btn-copy-web-url');
  const btnOpenWebUrl = document.getElementById('btn-open-web-url');
  const btnPreviewWebCard = document.getElementById('btn-preview-web-card');
  const recipientInput = document.getElementById('qr-recipient-name');
  const wishInput = document.getElementById('qr-wish-text');

  async function generateWebCard() {
    btnGenerateWebQR.innerHTML = '<span>⏳</span> Đang tạo thiệp & mã QR...';
    await waitForPendingImageReads();

    const cardPayload = {
      recipient: recipientInput.value.trim() || 'Người phụ nữ tuyệt vời 💖',
      title: 'Món quà bất ngờ và trọn vẹn yêu thương dành riêng cho bạn',
      message: wishInput.value.trim() || 'Chúc mừng ngày 20/10!',
      sender: 'Happy 20/10 with all my love ❤️',
      bouquet: selectedBouquet,
      music: selectedMusic,
      wishes: [...activeWishes],
      photos: [...activePhotos]
    };

    // Save full data to localStorage immediately for instant local preview
    localStorage.setItem('preview_card_2010', JSON.stringify(cardPayload));

    let savedCard = null;

    // Save a local copy when the app is running with its Node server.
    try {
      const res = await fetch('/api/save-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardPayload)
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.card) {
          savedCard = data.card;
        }
      }
    } catch (e) {
      console.warn('API save-card failed:', e);
    }

    // Use only portable data in the public card: local /uploads paths stop working
    // when this computer is off, so keep the originals for client-side cloud upload.
    const cloudPayload = { ...cardPayload, ...(savedCard || {}) };
    if (Array.isArray(cardPayload.photos)) {
      cloudPayload.photos = cardPayload.photos.map((photo, index) => {
        const savedPhoto = savedCard && Array.isArray(savedCard.photos) ? savedCard.photos[index] : null;
        return typeof savedPhoto === 'string' && !savedPhoto.startsWith('/uploads/') && !savedPhoto.startsWith('data:')
          ? savedPhoto
          : photo;
      });
    }

    if (savedCard && typeof savedCard.bouquet === 'string'
      && !savedCard.bouquet.startsWith('/uploads/') && !savedCard.bouquet.startsWith('data:')) {
      cloudPayload.bouquet = savedCard.bouquet;
    }

    // Upload custom images so they fit in a static link and remain available offline.
    if (Array.isArray(cloudPayload.photos)) {
      cloudPayload.photos = await Promise.all(cloudPayload.photos.map(async (photo) => {
        if (typeof photo === 'string' && photo.startsWith('data:image')) {
          return await uploadClientImage(photo);
        }
        return photo;
      }));
    }

    if (typeof cloudPayload.bouquet === 'string' && cloudPayload.bouquet.startsWith('data:image')) {
      cloudPayload.bouquet = await uploadClientImage(cloudPayload.bouquet);
    }

    const photosNotUploaded = cloudPayload.photos.some(photo =>
      photo === null || (typeof photo === 'string' && photo.startsWith('data:image'))
    );
    const bouquetNotUploaded = cloudPayload.bouquet === null
      || (typeof cloudPayload.bouquet === 'string' && cloudPayload.bouquet.startsWith('data:image'));
    if (photosNotUploaded || bouquetNotUploaded) {
      generatedWebUrl = '';
      if (webLinkBox) webLinkBox.style.display = 'none';
      if (generatedWebUrlInput) generatedWebUrlInput.value = '';
      btnGenerateWebQR.innerHTML = '<span>✨</span> TẠO MÃ QR & LINK WEB THIỆP ✨';
      window.alert('Không tải được ảnh lên kho ảnh online nên chưa thể tạo link thiệp. Ảnh bạn đã chọn vẫn được giữ lại; vui lòng thử lại khi kết nối ổn định.');
      return;
    }

    // Filter any leftover invalid values to avoid oversized QR codes.
    const safePhotos = cloudPayload.photos.filter(p => typeof p === 'string' && !p.startsWith('data:'));
    if (!safePhotos.length) {
      safePhotos.push('assets/sample_portrait.jpg');
    }
    cloudPayload.photos = safePhotos;

    if (typeof cloudPayload.bouquet === 'string' && cloudPayload.bouquet.startsWith('data:')) {
      cloudPayload.bouquet = 'assets/bouquet_red_roses.jpg';
    }

    const hashStr = btoa(unescape(encodeURIComponent(JSON.stringify(cloudPayload))));
    const finalCardUrl = `${CLOUD_PERMANENT_ORIGIN}/card.html#data=${hashStr}`;

    generatedWebUrl = finalCardUrl;

    // Show generated link box
    if (webLinkBox && generatedWebUrlInput) {
      webLinkBox.style.display = 'block';
      generatedWebUrlInput.value = finalCardUrl;
      if (btnOpenWebUrl) {
        btnOpenWebUrl.href = finalCardUrl;
      }
    }

    const tunnelBadge = document.getElementById('tunnel-badge');
    if (tunnelBadge) {
      if (finalCardUrl.includes('trycloudflare.com')) {
        tunnelBadge.textContent = '🌐 Link Online Toàn Cầu (Cloudflare 4G/Wi-Fi)';
        tunnelBadge.style.background = '#ecfdf5';
        tunnelBadge.style.color = '#059669';
        tunnelBadge.style.border = '1px solid #10b981';
      } else if (finalCardUrl.includes('github.io')) {
        tunnelBadge.textContent = '🟢 Vĩnh Viễn 24/7 (Đám Mây Tự Động)';
        tunnelBadge.style.background = '#ecfdf5';
        tunnelBadge.style.color = '#059669';
        tunnelBadge.style.border = '1px solid #10b981';
      } else {
        tunnelBadge.textContent = '🏠 Mạng Nội Bộ (Wi-Fi) / Máy Của Bạn';
        tunnelBadge.style.background = '#eff6ff';
        tunnelBadge.style.color = '#1d4ed8';
        tunnelBadge.style.border = '1px solid #93c5fd';
      }
    }

    updateQRPreview();

    btnGenerateWebQR.innerHTML = '<span>✅</span> ĐÃ TẠO XONG MÃ QR THIỆP!';
    setTimeout(() => {
      btnGenerateWebQR.innerHTML = '<span>✨</span> TẠO MÃ QR & LINK WEB THIỆP ✨';
    }, 2500);

    // Show success banner & highlight the download button
    const downloadSuccessBanner = document.getElementById('download-success-banner');
    if (downloadSuccessBanner) {
      downloadSuccessBanner.style.display = 'flex';
    }

    const btnDownload = document.getElementById('btn-download-png');
    if (btnDownload) {
      btnDownload.classList.add('pulse-download-highlight');
      btnDownload.innerHTML = currentShape === 'heart'
        ? '<span>📥</span> TẢI MÃ QR TRÁI TIM VỀ MÁY (Ảnh HD) ✨'
        : '<span>📥</span> TẢI MÃ QR VỀ MÁY NGAY (Ảnh HD) ✨';
    }

    // Auto-scroll smoothly to the QR code and download section
    const qrPreviewBox = document.getElementById('qr-preview-box');
    if (qrPreviewBox) {
      setTimeout(() => {
        qrPreviewBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 350);
    }

    // Burst celebration
    petalEngine.burst(40);
    heartBurst(15);
  }

  if (btnGenerateWebQR) {
    btnGenerateWebQR.addEventListener('click', generateWebCard);
  }

  if (btnCopyWebUrl) {
    btnCopyWebUrl.addEventListener('click', () => {
      if (generatedWebUrlInput && generatedWebUrlInput.value) {
        navigator.clipboard.writeText(generatedWebUrlInput.value).then(() => {
          btnCopyWebUrl.textContent = 'Đã chép! ✓';
          setTimeout(() => { btnCopyWebUrl.textContent = 'Sao Chép'; }, 2000);
        });
      }
    });
  }

  if (btnPreviewWebCard) {
    btnPreviewWebCard.addEventListener('click', () => {
      const url = generatedWebUrl || 'card.html?preview=1';
      window.open(url, '_blank');
    });
  }

  // Textarea input watcher
  if (wishInput) {
    wishInput.addEventListener('input', updateQRPreview);
  }

  // Color Palette Selector
  const paletteCards = document.querySelectorAll('.palette-card');
  paletteCards.forEach(card => {
    card.addEventListener('click', () => {
      paletteCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      currentPalette = card.dataset.palette;
      updateQRPreview();
    });
  });

  // Center Logo Selector
  const iconChoiceBtns = document.querySelectorAll('.icon-choice-btn');
  iconChoiceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      iconChoiceBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentLogo = btn.dataset.logo;
      updateQRPreview();
    });
  });

  // Shape Selector (Heart vs Square)
  const shapeChoiceBtns = document.querySelectorAll('.shape-choice-btn');
  shapeChoiceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      shapeChoiceBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentShape = btn.dataset.shape;

      // Update download button text based on shape
      const btnDownload = document.getElementById('btn-download-png');
      if (btnDownload) {
        btnDownload.innerHTML = currentShape === 'heart'
          ? '<span>📥</span> TẢI MÃ QR TRÁI TIM VỀ MÁY (Ảnh Sắc Nét HD)'
          : '<span>📥</span> TẢI MÃ QR VỀ MÁY (Ảnh Sắc Nét HD)';
      }

      updateQRPreview();
      heartBurst(6);
    });
  });

  // Download Action Buttons
  const btnDownloadPng = document.getElementById('btn-download-png');
  if (btnDownloadPng) {
    btnDownloadPng.addEventListener('click', () => downloadPNG(1200));
  }

  const btnDownloadCard = document.getElementById('btn-download-card');
  if (btnDownloadCard) {
    btnDownloadCard.addEventListener('click', downloadCardPoster);
  }

  // Mobile Connect Bar & Modal handlers
  const btnCopyMobileLink = document.getElementById('btn-copy-mobile-link');
  const btnShowMobileQR = document.getElementById('btn-show-mobile-qr');
  const closeMobileQRModal = document.getElementById('close-mobile-qr-modal');
  const mobileQRModal = document.getElementById('mobile-qr-modal');
  const btnCopyMobileModal = document.getElementById('btn-copy-mobile-modal');

  function copyMobileUrl(btn) {
    const targetUrl = serverInfo.tunnelUrl || serverInfo.lanUrl || window.location.origin;
    navigator.clipboard.writeText(targetUrl).then(() => {
      const orig = btn.textContent;
      btn.textContent = 'Đã chép! ✓';
      setTimeout(() => { btn.textContent = orig; }, 2000);
    });
  }

  if (btnCopyMobileLink) {
    btnCopyMobileLink.addEventListener('click', () => copyMobileUrl(btnCopyMobileLink));
  }
  if (btnCopyMobileModal) {
    btnCopyMobileModal.addEventListener('click', () => copyMobileUrl(btnCopyMobileModal));
  }
  if (btnShowMobileQR) {
    btnShowMobileQR.addEventListener('click', () => {
      updateMobileConnectUI();
      if (mobileQRModal) mobileQRModal.classList.add('active');
    });
  }
  if (closeMobileQRModal) {
    closeMobileQRModal.addEventListener('click', () => {
      if (mobileQRModal) mobileQRModal.classList.remove('active');
    });
  }
  if (mobileQRModal) {
    mobileQRModal.addEventListener('click', (e) => {
      if (e.target === mobileQRModal) mobileQRModal.classList.remove('active');
    });
  }

  // Initial QR render
  updateQRPreview();
  updateMobileConnectUI();
});
