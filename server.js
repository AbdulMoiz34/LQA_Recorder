import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { CONFIG } from './config.js';
import { logger, logRequest } from './logger.js';
import { sessionManager } from './session-manager.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

const PORT = CONFIG.PORT;
const STORAGE_ROOT = CONFIG.STORAGE_ROOT || path.join(__dirname, 'storage');
const TEMP_DIR = path.join(__dirname, 'temp');

fs.mkdirSync(STORAGE_ROOT, { recursive: true });
fs.mkdirSync(TEMP_DIR, { recursive: true });

const upload = multer({
  dest: TEMP_DIR,
  limits: { fileSize: CONFIG.MAX_SEGMENT_SIZE_BYTES }
});

// Rate limiting for uploads - prevent abuse
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { ok: false, error: 'Too many uploads, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', { ip: req.ip, url: req.url });
    res.status(429).json({ ok: false, error: 'Too many uploads, please try again later' });
  }
});

// General API rate limiting
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60,
  message: { ok: false, error: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(logRequest);
app.use('/api/', apiLimiter);

function sanitize(value = '') {
  return String(value).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
}

app.post('/api/upload-segment', uploadLimiter, upload.single('video'), async (req, res) => {
  try {
    const { device, session, segment } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ ok: false, error: 'No file' });
    }

    const date = new Date().toISOString().slice(0, 10);
    const finalDir = path.join(STORAGE_ROOT, sanitize(device), date, sanitize(session));
    fs.mkdirSync(finalDir, { recursive: true });

    const ext = file.originalname.endsWith('.mp4') ? 'mp4' : 'webm';
    const finalFilename = `segment-${String(segment).padStart(3, '0')}.${ext}`;
    const finalPath = path.join(finalDir, finalFilename);

    fs.renameSync(file.path, finalPath);

    const stats = fs.statSync(finalPath);
    const sizeMB = (stats.size / (1024 ** 2)).toFixed(2);

    // Update session tracking
    sessionManager.updateSession(sanitize(session), parseInt(segment), stats.size);

    logger.info('Segment uploaded successfully', {
      device: sanitize(device),
      session: sanitize(session),
      segment,
      filename: finalFilename,
      sizeMB: parseFloat(sizeMB)
    });

    res.json({
      ok: true,
      filename: finalFilename,
      sizeMB: parseFloat(sizeMB)
    });

  } catch (error) {
    logger.error('Upload error', { error: error.message, stack: error.stack });

    // Record failure in session manager
    if (req.body && req.body.session) {
      sessionManager.recordFailure(sanitize(req.body.session), error.message);
    }

    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        logger.error('Cleanup error', { error: cleanupError.message });
      }
    }

    res.status(500).json({ ok: false, error: error.message });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    storage: STORAGE_ROOT,
    time: new Date().toISOString(),
    segmentDuration: `${CONFIG.SEGMENT_DURATION_MINUTES} minutes`
  });
});

// Admin API endpoints
app.get('/api/admin/stats', (_req, res) => {
  try {
    const stats = sessionManager.getStats();
    res.json(stats);
  } catch (error) {
    logger.error('Failed to get stats', { error: error.message });
    res.status(500).json({ ok: false, error: 'Failed to retrieve stats' });
  }
});

app.get('/api/admin/sessions', (_req, res) => {
  try {
    const sessions = sessionManager.getActiveSessions();
    res.json(sessions);
  } catch (error) {
    logger.error('Failed to get sessions', { error: error.message });
    res.status(500).json({ ok: false, error: 'Failed to retrieve sessions' });
  }
});

app.get('/api/admin/sessions/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = sessionManager.getSession(sessionId);

    if (!session) {
      return res.status(404).json({ ok: false, error: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    logger.error('Failed to get session', { error: error.message });
    res.status(500).json({ ok: false, error: 'Failed to retrieve session' });
  }
});

app.get('/api/admin/recordings', (_req, res) => {
  try {
    const recordings = [];

    // Read storage directory structure
    if (!fs.existsSync(STORAGE_ROOT)) {
      return res.json(recordings);
    }

    const devices = fs.readdirSync(STORAGE_ROOT);

    for (const device of devices) {
      const devicePath = path.join(STORAGE_ROOT, device);
      if (!fs.statSync(devicePath).isDirectory()) continue;

      const dates = fs.readdirSync(devicePath);

      for (const date of dates) {
        const datePath = path.join(devicePath, date);
        if (!fs.statSync(datePath).isDirectory()) continue;

        const sessions = fs.readdirSync(datePath);

        for (const session of sessions) {
          const sessionPath = path.join(datePath, session);
          if (!fs.statSync(sessionPath).isDirectory()) continue;

          const files = fs.readdirSync(sessionPath);
          const segments = files.filter(f => f.startsWith('segment-'));

          let totalSize = 0;
          for (const file of segments) {
            const filePath = path.join(sessionPath, file);
            totalSize += fs.statSync(filePath).size;
          }

          recordings.push({
            device,
            date,
            session,
            segmentCount: segments.length,
            totalMB: (totalSize / (1024 ** 2)).toFixed(2),
            path: path.relative(STORAGE_ROOT, sessionPath)
          });
        }
      }
    }

    // Sort by date descending
    recordings.sort((a, b) => {
      const dateA = new Date(a.date + ' ' + a.session.replace(/-/g, ':'));
      const dateB = new Date(b.date + ' ' + b.session.replace(/-/g, ':'));
      return dateB - dateA;
    });

    res.json(recordings);
  } catch (error) {
    logger.error('Failed to list recordings', { error: error.message });
    res.status(500).json({ ok: false, error: 'Failed to list recordings' });
  }
});

const keyPath = path.join(__dirname, 'certs', 'server-key.pem');
const certPath = path.join(__dirname, 'certs', 'server-cert.pem');

if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
  logger.error('Missing certificate files. Run: setup-certificate.bat');
  process.exit(1);
}

const server = https.createServer({
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath)
}, app);

server.listen(PORT, () => {
  logger.info('Server started', {
    port: PORT,
    storage: STORAGE_ROOT,
    segmentDuration: `${CONFIG.SEGMENT_DURATION_MINUTES} minutes`,
    url: `https://<laptop-ip>:${PORT}`
  });
});
