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
const UPLOAD_PASSWORD = process.env.UPLOAD_PASSWORD || 'academy2024';

// Verify storage is accessible
fs.mkdirSync(STORAGE_ROOT, { recursive: true });

try {
  fs.accessSync(STORAGE_ROOT, fs.constants.W_OK);
  console.log(`✅ Storage is writable: ${STORAGE_ROOT}`);
} catch (err) {
  console.error('❌ Storage is not writable!', err.message);
  console.error('   Please check drive permissions and connectivity.');
  process.exit(1);
}

const upload = multer({ dest: path.join(__dirname, 'temp') });

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

function safe(value = '') {
  return String(value).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
}

// Authentication middleware for upload endpoints
app.use('/api/upload', (req, res, next) => {
  const password = req.headers['x-upload-password'] || req.query.password;
  
  if (password !== UPLOAD_PASSWORD) {
    console.log(`❌ Unauthorized upload attempt from ${req.ip}`);
    return res.status(401).json({ 
      ok: false, 
      error: 'Unauthorized. Please contact administrator.' 
    });
  }
  
  next();
});

app.post('/api/upload', upload.single('recording'), async (req, res) => {
  try {
    const { device, session } = req.body;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ ok: false, error: 'No file uploaded' });
    }

    const safeDevice = safe(device);
    const date = session?.slice(0, 10) || new Date().toISOString().slice(0, 10);
    const dir = path.join(STORAGE_ROOT, safeDevice, date);
    fs.mkdirSync(dir, { recursive: true });
    
    const finalPath = path.join(dir, file.originalname);
    fs.renameSync(file.path, finalPath);
    
    console.log(`✅ Uploaded: ${file.originalname} (${(file.size / (1024 ** 2)).toFixed(2)} MB)`);
    res.json({ ok: true, file: finalPath });
    
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ ok: false, error: 'Upload failed' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, storage: STORAGE_ROOT, time: new Date().toISOString() });
});

// Storage information endpoint for admin dashboard
app.get('/api/storage-info', (_req, res) => {
  try {
    // Count recordings and calculate total size
    let totalFiles = 0;
    let totalSize = 0;
    
    function scanDirectory(dir) {
      if (!fs.existsSync(dir)) return;
      
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          scanDirectory(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.webm')) {
          totalFiles++;
          totalSize += fs.statSync(fullPath).size;
        }
      }
    }
    
    scanDirectory(STORAGE_ROOT);
    
    res.json({
      ok: true,
      storage: STORAGE_ROOT,
      recordings: {
        totalFiles,
        totalSizeGB: (totalSize / (1024 ** 3)).toFixed(2),
        totalSizeMB: (totalSize / (1024 ** 2)).toFixed(0)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting storage info:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});


const keyPath = path.join(__dirname, 'certs', 'server-key.pem');
const certPath = path.join(__dirname, 'certs', 'server-cert.pem');
if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
  console.error('Missing HTTPS certificate. Run setup-certificate.bat on Windows first.');
  process.exit(1);
}

const server = https.createServer({
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath)
}, app);

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please close the other application or set a different PORT.`);
  } else if (error.code === 'EACCES') {
    console.error(`❌ Permission denied to bind to port ${PORT}. Try a port above 1024 or run as administrator.`);
  } else {
    console.error('❌ Server error:', error);
  }
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`✅ Academy Recorder Server is running!`);
  console.log(`📁 Videos will be stored in: ${STORAGE_ROOT}`);
  console.log(`🌐 Open this URL on your Chromebook:`);
  console.log(`   https://<LAPTOP-IP>:${PORT}`);
  console.log(`\n💡 Find your laptop IP with: ipconfig`);
  console.log(`⚠️  You'll need to accept the security warning in Chrome (self-signed certificate)\n`);
});