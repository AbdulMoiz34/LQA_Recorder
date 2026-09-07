import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { fileURLToPath } from 'node:url';
import multer from 'multer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

const PORT = process.env.PORT || 3443;
const STORAGE_ROOT = process.env.STORAGE_ROOT || path.join(__dirname, 'storage');
const TEMP_DIR = path.join(__dirname, 'temp');

fs.mkdirSync(STORAGE_ROOT, { recursive: true });
fs.mkdirSync(TEMP_DIR, { recursive: true });

const upload = multer({ dest: TEMP_DIR });

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

function sanitize(value = '') {
  return String(value).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
}

app.post('/api/upload-video', upload.single('video'), async (req, res) => {
  try {
    const { device, session } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ ok: false, error: 'No file' });
    }

    const date = new Date().toISOString().slice(0, 10);
    const finalDir = path.join(STORAGE_ROOT, sanitize(device), date);
    fs.mkdirSync(finalDir, { recursive: true });

    const finalFilename = `${sanitize(device)}__${sanitize(session)}.webm`;
    const finalPath = path.join(finalDir, finalFilename);
    
    fs.renameSync(file.path, finalPath);

    const stats = fs.statSync(finalPath);
    const sizeMB = (stats.size / (1024 ** 2)).toFixed(2);

    console.log(`✅ ${finalFilename} (${sizeMB}MB)`);
    
    res.json({ 
      ok: true, 
      filename: finalFilename,
      sizeMB: parseFloat(sizeMB)
    });

  } catch (error) {
    console.error('Upload error:', error.message);
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, storage: STORAGE_ROOT, time: new Date().toISOString() });
});

const keyPath = path.join(__dirname, 'certs', 'server-key.pem');
const certPath = path.join(__dirname, 'certs', 'server-cert.pem');

if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
  console.error('❌ Missing certificate. Run: setup-certificate.bat');
  process.exit(1);
}

const server = https.createServer({
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath)
}, app);

server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📁 Storage: ${STORAGE_ROOT}`);
  console.log(`🌐 Access: https://<laptop-ip>:${PORT}`);
});
