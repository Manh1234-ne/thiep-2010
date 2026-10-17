const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data', 'cards');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(path.join(__dirname, 'data'))) fs.mkdirSync(path.join(__dirname, 'data'));
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Detect Local LAN IP
function getLocalLanIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '127.0.0.1';
}

const LAN_IP = getLocalLanIp();
let currentTunnelUrl = null;
let cloudflaredProcess = null;

// Auto-start cloudflared tunnel if available
const cloudflaredExePath = path.join(__dirname, 'cloudflared.exe');
if (fs.existsSync(cloudflaredExePath)) {
  function startCloudflared() {
    console.log('[Cloudflare] Đang khởi động đường hầm trực tuyến Cloudflare...');
    try {
      cloudflaredProcess = spawn(cloudflaredExePath, ['tunnel', '--url', `http://127.0.0.1:${PORT}`]);

      const onData = (data) => {
        const text = data.toString();
        // Look for trycloudflare URL
        const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
        if (match && match[0]) {
          currentTunnelUrl = match[0];
          console.log(`[Cloudflare] 🌐 Đường hầm trực tuyến sẵn sàng: ${currentTunnelUrl}`);
        }
      };

      cloudflaredProcess.stdout.on('data', onData);
      cloudflaredProcess.stderr.on('data', onData);

      cloudflaredProcess.on('exit', (code) => {
        console.log(`[Cloudflare] Tunnel exited with code ${code}. Sẽ thử lại sau 5s...`);
        currentTunnelUrl = null;
        setTimeout(startCloudflared, 5000);
      });
    } catch (e) {
      console.error('[Cloudflare] Không thể khởi động cloudflared:', e);
    }
  }

  startCloudflared();

  // Cleanup on process exit
  const cleanup = () => {
    if (cloudflaredProcess) {
      try { cloudflaredProcess.kill(); } catch (e) {}
    }
    process.exit();
  };
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('exit', cleanup);
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg'
};

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // API: Get Server Info & Tunnel Status
  if (req.method === 'GET' && pathname === '/api/info') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      port: PORT,
      lanIp: LAN_IP,
      localUrl: `http://localhost:${PORT}`,
      lanUrl: `http://${LAN_IP}:${PORT}`,
      tunnelUrl: currentTunnelUrl,
      cloudUrl: 'https://manh1234-ne.github.io/thiep-2010'
    }));
    return;
  }

  // API: Save Card
  if (req.method === 'POST' && pathname === '/api/save-card') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      // 25MB limit
      if (body.length > 25 * 1024 * 1024) {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Payload too large' }));
        req.connection.destroy();
      }
    });

    req.on('end', () => {
      try {
        const cardData = JSON.parse(body);
        const cardId = 'card_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);

        // Process custom uploaded photos (if base64, save to /uploads/)
        if (Array.isArray(cardData.photos)) {
          cardData.photos = cardData.photos.map((photo, idx) => {
            if (typeof photo === 'string' && photo.startsWith('data:image')) {
              const match = photo.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
              if (match) {
                const ext = match[1] === 'jpeg' ? '.jpg' : `.${match[1]}`;
                const filename = `photo_${cardId}_${idx}${ext}`;
                const filePath = path.join(UPLOADS_DIR, filename);
                fs.writeFileSync(filePath, Buffer.from(match[2], 'base64'));
                return `/uploads/${filename}`;
              }
            }
            return photo;
          });
        }

        // Process custom uploaded bouquet (if base64)
        if (typeof cardData.bouquet === 'string' && cardData.bouquet.startsWith('data:image')) {
          const match = cardData.bouquet.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
          if (match) {
            const ext = match[1] === 'jpeg' ? '.jpg' : `.${match[1]}`;
            const filename = `bouquet_${cardId}${ext}`;
            const filePath = path.join(UPLOADS_DIR, filename);
            fs.writeFileSync(filePath, Buffer.from(match[2], 'base64'));
            cardData.bouquet = `/uploads/${filename}`;
          }
        }

        cardData.id = cardId;
        cardData.createdAt = new Date().toISOString();

        // Save card JSON
        fs.writeFileSync(path.join(DATA_DIR, `${cardId}.json`), JSON.stringify(cardData, null, 2));

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          id: cardId,
          card: cardData,
          tunnelUrl: currentTunnelUrl,
          lanUrl: `http://${LAN_IP}:${PORT}`
        }));
      } catch (err) {
        console.error('Save card error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // API: Get Card by ID
  if (req.method === 'GET' && pathname.startsWith('/api/card/')) {
    const id = pathname.replace('/api/card/', '').replace(/[^a-zA-Z0-9_-]/g, '');
    const cardFile = path.join(DATA_DIR, `${id}.json`);

    if (fs.existsSync(cardFile)) {
      const content = fs.readFileSync(cardFile, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(content);
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Card not found' }));
    }
    return;
  }

  // Static File Serving
  let relativePath = pathname;
  if (relativePath === '/' || relativePath === '') {
    relativePath = '/index.html';
  }

  let filePath = path.join(__dirname, relativePath);

  fs.stat(filePath, (err, stats) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    if (stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // HTTP Range Support for Audio Streaming
    if (req.headers.range && (ext === '.mp3' || ext === '.m4a' || ext === '.wav' || ext === '.ogg')) {
      const range = req.headers.range;
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
      const chunksize = (end - start) + 1;
      const fileStream = fs.createReadStream(filePath, { start, end });
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stats.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
      });
      fileStream.pipe(res);
      return;
    }

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
      } else {
        res.writeHead(200, {
          'Content-Type': contentType,
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'no-cache'
        });
        res.end(content);
      }
    });
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] Web running at http://localhost:${PORT}/ and http://${LAN_IP}:${PORT}/`);
});
