/**
 * CARD.JS - INTERACTIVE RECIPIENT EXPERIENCE ENGINE
 * Petal Canvas, Rain of Wishes, Rain of Photos, 3D Envelope, Multi-track Synthesizer
 */

// Default Fallback Data if opened without parameters
const DEFAULT_CARD_DATA = {
  recipient: 'Người Phụ Nữ Tuyệt Vời 💖',
  title: 'Món quà bất ngờ và trọn vẹn yêu thương dành riêng cho bạn',
  message: `🌸 CHÚC MỪNG NGÀY PHỤ NỮ VIỆT NAM 20/10 🌸\n\nThân gửi ngàn lời chúc yêu thương và tốt đẹp nhất!\nChúc bạn luôn luôn xinh đẹp, rạng ngời, ngập tràn niềm vui và mỗi ngày đều hạnh phúc, bình yên, trọn vẹn yêu thương! 💖✨🌷\n\nCảm ơn vì đã luôn mang lại sự dịu dàng và ánh sáng ấm áp cho cuộc đời này!`,
  sender: 'Happy 20/10 with all my love ❤️',
  bouquet: 'assets/bouquet_red_roses.jpg',
  music: 'an_nut_nho',
  wishes: [
    'Luôn xinh đẹp rạng ngời 🌸',
    'Ngập tràn niềm vui & nụ cười ✨',
    'Bình an & Hạnh phúc viên mãn 💖',
    'Mỗi ngày đều là ngày rực rỡ 🌷',
    'Tự tin tỏa sáng theo cách của bạn 👑',
    'Được yêu thương và chiều chuộng hết mực 💕',
    'Mãi mãi trẻ trung yêu đời 🌹',
    'Vạn sự như ý, tỷ sự cát tường 🥳'
  ],
  photos: [
    'assets/sample_portrait.jpg'
  ]
};

// Web Audio API Synthesizer with 4 distinct romantic melodies
let audioCtx = null;
let currentMusicType = 'an_nut_nho';
let isMusicActive = false;
let melodyInterval = null;

class MultiTrackSynthesizer {
  constructor() {
    this.trackNames = {
      an_nut_nho: 'Ấn Nút Nhớ... Thả Giấc Mơ 🌸'
    };
  }

  init() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  playNote(freq, time, duration = 1.4, volume = 0.12, type = 'triangle') {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    // Warm envelope
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(volume, time + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(time);
    osc.stop(time + duration);
  }

  playOpenChime() {
    this.init();
    const now = audioCtx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
    notes.forEach((freq, idx) => {
      this.playNote(freq, now + idx * 0.09, 1.8, 0.16, 'sine');
    });
  }

  startMelody(type = 'an_nut_nho') {
    let audioSrc = 'assets/an_nut_nho_tha_giac_mo.mp3';
    let trackTitle = 'Ấn Nút Nhớ... Thả Giấc Mơ 🌸';

    if (typeof type === 'string' && (type.startsWith('data:audio') || type.includes('.mp3') || type.includes('.m4a') || type.startsWith('/uploads/'))) {
      audioSrc = type;
      trackTitle = 'Bài Hát Riêng 🎵';
    }

    let audioEl = document.getElementById('card-vocal-audio');
    if (!audioEl) {
      audioEl = document.createElement('audio');
      audioEl.id = 'card-vocal-audio';
      audioEl.loop = true;
      audioEl.preload = 'auto';
      document.body.appendChild(audioEl);
    }

    if (audioEl.src !== new URL(audioSrc, window.location.href).href) {
      audioEl.src = audioSrc;
    }

    audioEl.play().catch(e => console.log('Audio autoplay allowed after user interaction:', e));
    isMusicActive = true;
    currentMusicType = type;

    const discBtn = document.getElementById('music-disc-btn');
    const discLabel = document.getElementById('disc-track-name');
    if (discBtn) discBtn.classList.add('playing');
    if (discLabel) discLabel.textContent = trackTitle;
  }

  stopMelody() {
    isMusicActive = false;
    const audioEl = document.getElementById('card-vocal-audio');
    if (audioEl) {
      audioEl.pause();
    }
    const customAudio = document.getElementById('custom-audio-el');
    if (customAudio) {
      customAudio.pause();
    }
    if (melodyInterval) {
      clearInterval(melodyInterval);
      melodyInterval = null;
    }
    const discBtn = document.getElementById('music-disc-btn');
    if (discBtn) discBtn.classList.remove('playing');
  }
}

const synth = new MultiTrackSynthesizer();

/* ===================================================
   CANVAS PETALS ENGINE (Physics & Flutter Simulation)
   =================================================== */
class PetalCanvasEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.petals = [];
    this.numPetals = 45;
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

  createPetal(randomY = false) {
    return {
      x: Math.random() * this.width,
      y: randomY ? Math.random() * this.height : -30,
      size: 10 + Math.random() * 16,
      speedY: 1.2 + Math.random() * 2.2,
      speedX: (Math.random() - 0.5) * 1.5,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.04,
      oscillation: Math.random() * Math.PI * 2,
      oscSpeed: 0.02 + Math.random() * 0.03,
      color: Math.random() > 0.4 ? 'rgba(244, 63, 94, 0.72)' : 'rgba(255, 42, 122, 0.65)'
    };
  }

  initPetals() {
    this.petals = [];
    for (let i = 0; i < this.numPetals; i++) {
      this.petals.push(this.createPetal(true));
    }
  }

  burst(count = 35) {
    for (let i = 0; i < count; i++) {
      const p = this.createPetal(false);
      p.x = this.width / 2 + (Math.random() - 0.5) * 200;
      p.y = this.height / 2 + (Math.random() - 0.5) * 200;
      p.speedY = (Math.random() - 0.5) * 8;
      p.speedX = (Math.random() - 0.5) * 8;
      this.petals.push(p);
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.petals.length; i++) {
      const p = this.petals[i];
      p.y += p.speedY;
      p.oscillation += p.oscSpeed;
      p.x += Math.sin(p.oscillation) * 1.2 + p.speedX;
      p.rotation += p.rotSpeed;

      // Draw Rose Petal (Organic teardrop curve)
      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);

      this.ctx.beginPath();
      this.ctx.moveTo(0, -p.size * 0.6);
      this.ctx.bezierCurveTo(p.size * 0.8, -p.size * 0.4, p.size * 0.6, p.size * 0.6, 0, p.size);
      this.ctx.bezierCurveTo(-p.size * 0.6, p.size * 0.6, -p.size * 0.8, -p.size * 0.4, 0, -p.size * 0.6);
      this.ctx.fillStyle = p.color;
      this.ctx.fill();

      this.ctx.restore();

      // Reset when falling out of bounds
      if (p.y > this.height + 40 || p.x < -40 || p.x > this.width + 40) {
        if (this.petals.length > this.numPetals) {
          this.petals.splice(i, 1);
          i--;
        } else {
          this.petals[i] = this.createPetal(false);
        }
      }
    }

    requestAnimationFrame(this.animate);
  }
}

/* ===================================================
   RAIN OF WISHES & RAIN OF PHOTOS ENGINE
   =================================================== */
class RainEngine {
  constructor(container, wishes, photos) {
    this.container = container;
    this.wishes = wishes || [];
    this.photos = photos || [];
    this.wishTimer = null;
    this.photoTimer = null;
  }

  start() {
    // Spawn wish bubble every 2.8 seconds
    if (this.wishes.length > 0) {
      this.spawnWish();
      this.wishTimer = setInterval(() => this.spawnWish(), 2800);
    }
    // Spawn photo bubble every 4.5 seconds
    if (this.photos.length > 0) {
      setTimeout(() => {
        this.spawnPhoto();
        this.photoTimer = setInterval(() => this.spawnPhoto(), 4500);
      }, 1200);
    }
  }

  spawnWish(textOverride) {
    if (!this.wishes.length && !textOverride) return;
    const text = textOverride || this.wishes[Math.floor(Math.random() * this.wishes.length)];

    const el = document.createElement('div');
    el.className = 'falling-wish-item';
    el.textContent = text;

    const startX = 20 + Math.random() * (window.innerWidth - 220);
    const duration = 7 + Math.random() * 5; // 7-12s
    el.style.left = `${startX}px`;
    el.style.animationDuration = `${duration}s`;

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      this.burstHeartAt(e.clientX, e.clientY);
      synth.init();
      synth.playNote(880, audioCtx ? audioCtx.currentTime : 0, 0.8, 0.1, 'sine');
      el.style.transform = 'scale(1.4) rotate(10deg)';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 300);
    });

    this.container.appendChild(el);
    setTimeout(() => {
      if (el.parentNode) el.remove();
    }, duration * 1000);
  }

  spawnPhoto(urlOverride) {
    if (!this.photos.length && !urlOverride) return;
    const url = urlOverride || this.photos[Math.floor(Math.random() * this.photos.length)];

    const el = document.createElement('div');
    el.className = 'falling-photo-item';
    const img = document.createElement('img');
    img.src = url;
    img.alt = 'Ảnh kỷ niệm';
    el.appendChild(img);

    const startX = 30 + Math.random() * (window.innerWidth - 120);
    const duration = 8 + Math.random() * 6; // 8-14s
    el.style.left = `${startX}px`;
    el.style.animationDuration = `${duration}s`;

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      this.burstHeartAt(e.clientX, e.clientY);
      openPhotoModal(url);
    });

    this.container.appendChild(el);
    setTimeout(() => {
      if (el.parentNode) el.remove();
    }, duration * 1000);
  }

  burstWishes(count = 6) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => this.spawnWish(), i * 350);
    }
  }

  burstPhotos(count = 4) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => this.spawnPhoto(), i * 400);
    }
  }

  burstHeartAt(x, y) {
    const emojis = ['💖', '🌹', '✨', '💕', '🌷', '🥰'];
    for (let i = 0; i < 4; i++) {
      const heart = document.createElement('div');
      heart.className = 'heart-particle';
      heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      heart.style.left = `${x + (Math.random() - 0.5) * 30}px`;
      heart.style.top = `${y + (Math.random() - 0.5) * 30}px`;
      document.body.appendChild(heart);
      setTimeout(() => heart.remove(), 2500);
    }
  }
}

/* ===================================================
   PHOTO LIGHTBOX MODAL
   =================================================== */
function openPhotoModal(imgSrc) {
  const modal = document.getElementById('photo-modal');
  const modalImg = document.getElementById('modal-photo-img');
  if (modal && modalImg) {
    modalImg.src = imgSrc;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
  }
}

function closePhotoModal() {
  const modal = document.getElementById('photo-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  }
}

/* ===================================================
   INITIALIZATION & DATA LOADING
   =================================================== */
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Initialize Canvas Petals
  const petalCanvas = document.getElementById('petal-canvas');
  const petalEngine = new PetalCanvasEngine(petalCanvas);

  // 2. Resolve Card Data
  let cardData = { ...DEFAULT_CARD_DATA };

  const urlParams = new URLSearchParams(window.location.search);
  const cardId = urlParams.get('id');

  if (cardId) {
    try {
      const res = await fetch(`/api/card/${cardId}`);
      if (res.ok) {
        const fetched = await res.json();
        cardData = { ...cardData, ...fetched };
      }
    } catch (err) {
      console.warn('Could not fetch card from API, checking local fallback:', err);
    }
  }

  // Hash Data Fallback (Base64 JSON encoded)
  if (window.location.hash && window.location.hash.startsWith('#data=')) {
    try {
      const jsonStr = decodeURIComponent(escape(atob(window.location.hash.replace('#data=', ''))));
      const parsed = JSON.parse(jsonStr);
      cardData = { ...cardData, ...parsed };
    } catch (e) {
      console.warn('Could not parse hash data:', e);
    }
  }

  // Local Storage preview fallback
  if (!cardId && window.location.search.includes('preview=1')) {
    try {
      const local = localStorage.getItem('preview_card_2010');
      if (local) {
        cardData = { ...cardData, ...JSON.parse(local) };
      }
    } catch (e) {}
  }

  // 3. Render Card Data to DOM
  const elRecipient = document.getElementById('display-recipient');
  const elTitle = document.getElementById('display-title');
  const elBouquetImg = document.getElementById('display-bouquet-img');
  const elLetterTo = document.getElementById('letter-to-heading');
  const elLetterMsg = document.getElementById('letter-full-text');
  const elLetterSender = document.getElementById('letter-from-sender');

  if (elRecipient) elRecipient.textContent = cardData.recipient || DEFAULT_CARD_DATA.recipient;
  if (elTitle) elTitle.textContent = cardData.title || DEFAULT_CARD_DATA.title;
  if (elBouquetImg && cardData.bouquet) elBouquetImg.src = cardData.bouquet;
  if (elLetterTo) elLetterTo.textContent = `Thân gửi ${cardData.recipient || 'Em yêu 💖'}`;
  if (elLetterMsg) elLetterMsg.textContent = cardData.message || DEFAULT_CARD_DATA.message;
  if (elLetterSender) elLetterSender.textContent = cardData.sender || DEFAULT_CARD_DATA.sender;

  // 4. Initialize Rain of Wishes & Photos (Paused initially until flower is tapped)
  const rainContainer = document.getElementById('rain-container');
  const rainEngine = new RainEngine(rainContainer, cardData.wishes, cardData.photos);

  // Set initial stage: Bouquet centered with tap prompt
  document.body.classList.add('stage-initial');
  let isBloomed = false;

  // 5. Flower Tap Interaction Flow
  function triggerBloom(e) {
    if (isBloomed) {
      // Subsequent clicks: burst flowers and hearts
      petalEngine.burst(25);
      const clientX = e && e.clientX ? e.clientX : window.innerWidth / 2;
      const clientY = e && e.clientY ? e.clientY : window.innerHeight / 2;
      rainEngine.burstHeartAt(clientX, clientY);
      return;
    }
    isBloomed = true;

    // 1. Bouquet shrinks, prompt hides
    document.body.classList.remove('stage-initial');
    document.body.classList.add('stage-bloomed');

    // 2. Music plays immediately (gesture-unlocked for mobile iOS/Android)
    synth.init();
    synth.playOpenChime();
    if (!isMusicActive) {
      synth.startMelody(cardData.music || 'an_nut_nho');
    }

    // 3. Rain of wishes, photos, and petals begin
    const clientX = e && e.clientX ? e.clientX : window.innerWidth / 2;
    const clientY = e && e.clientY ? e.clientY : window.innerHeight / 2;
    rainEngine.burstHeartAt(clientX, clientY);
    petalEngine.burst(50);

    rainEngine.start();
    rainEngine.burstWishes(5);
    rainEngine.burstPhotos(3);

    // 4. Approximately 3 seconds later: Reveal the 3D letter & envelope
    setTimeout(() => {
      const envelopePresentation = document.getElementById('envelope-presentation');
      if (envelopePresentation) {
        envelopePresentation.classList.add('revealed');
        document.body.classList.add('stage-letter-ready');
        petalEngine.burst(35);
        rainEngine.burstWishes(3);

        // Smooth scroll on mobile to bring the envelope into clear focus
        if (window.innerWidth <= 768) {
          envelopePresentation.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 3000);
  }

  // Attach tap events to both the bouquet and the "Nhấn vào hoa" prompt
  const bouquetImgBox = document.getElementById('bouquet-img-box');
  const bouquetPrompt = document.getElementById('bouquet-tap-prompt');
  const bouquetCard = document.getElementById('bouquet-card');

  if (bouquetImgBox) {
    bouquetImgBox.addEventListener('click', triggerBloom);
    bouquetImgBox.addEventListener('touchend', (e) => { e.preventDefault(); triggerBloom(e); }, { passive: false });
  }
  if (bouquetPrompt) {
    bouquetPrompt.addEventListener('click', triggerBloom);
    bouquetPrompt.addEventListener('touchend', (e) => { e.preventDefault(); triggerBloom(e); }, { passive: false });
  }

  // 6. Envelope Open / Close Interaction
  const envelope = document.getElementById('card-envelope');
  const waxSeal = document.getElementById('card-wax-seal');
  const btnTouchOpen = document.getElementById('btn-touch-open');
  const openHelper = document.getElementById('open-helper');

  function openEnvelope() {
    if (!envelope.classList.contains('open')) {
      envelope.classList.add('open');
      if (openHelper) openHelper.style.display = 'none';
      synth.playOpenChime();
      petalEngine.burst(35);
      rainEngine.burstWishes(4);
      rainEngine.burstPhotos(2);

      // Ensure music is active
      if (!isMusicActive) {
        synth.startMelody(cardData.music || 'an_nut_nho');
      }
    }
  }

  if (envelope) {
    envelope.addEventListener('click', openEnvelope);
    envelope.addEventListener('touchend', (e) => { e.preventDefault(); openEnvelope(); }, { passive: false });
  }
  if (waxSeal) {
    waxSeal.addEventListener('click', (e) => { e.stopPropagation(); openEnvelope(); });
    waxSeal.addEventListener('touchend', (e) => { e.stopPropagation(); e.preventDefault(); openEnvelope(); }, { passive: false });
  }
  if (btnTouchOpen) {
    btnTouchOpen.addEventListener('click', openEnvelope);
    btnTouchOpen.addEventListener('touchend', (e) => { e.preventDefault(); openEnvelope(); }, { passive: false });
  }

  // 6. Floating Music Disc Toggle
  const musicDiscBtn = document.getElementById('music-disc-btn');
  if (musicDiscBtn) {
    musicDiscBtn.addEventListener('click', () => {
      if (isMusicActive) {
        synth.stopMelody();
      } else {
        synth.startMelody(cardData.music || 'an_nut_nho');
      }
    });
  }

  // 7. Bottom Action Dock Buttons
  const btnBurstWishes = document.getElementById('btn-burst-wishes');
  if (btnBurstWishes) {
    btnBurstWishes.addEventListener('click', () => {
      rainEngine.burstWishes(6);
      petalEngine.burst(20);
    });
  }

  const btnBurstPhotos = document.getElementById('btn-burst-photos');
  if (btnBurstPhotos) {
    btnBurstPhotos.addEventListener('click', () => {
      rainEngine.burstPhotos(5);
    });
  }

  const btnHeartBurst = document.getElementById('btn-heart-burst');
  if (btnHeartBurst) {
    btnHeartBurst.addEventListener('click', (e) => {
      petalEngine.burst(35);
      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          rainEngine.burstHeartAt(
            window.innerWidth * (0.2 + Math.random() * 0.6),
            window.innerHeight * (0.4 + Math.random() * 0.4)
          );
        }, i * 120);
      }
    });
  }

  // 8. Photo Modal Close handlers
  const closePhotoBtn = document.getElementById('close-photo-modal');
  const photoModal = document.getElementById('photo-modal');
  if (closePhotoBtn) closePhotoBtn.addEventListener('click', closePhotoModal);
  if (photoModal) {
    photoModal.addEventListener('click', (e) => {
      if (e.target === photoModal) closePhotoModal();
    });
  }
});
