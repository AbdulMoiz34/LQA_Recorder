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

// Verify storage is accessible
fs.mkdirSync(STORAGE_ROOT, { recursive: true });
fs.mkdirSync(TEMP_DIR, { recursive: true });

try {
  fs.accessSync(STORAGE_ROOT, fs.constants.W_OK);
  console.log(`✅ Storage is writable: ${STORAGE_ROOT}`);
} catch (err) {
  console.error('❌ Storage is not writable!', err.message);
  console.error('   Please check drive permissions and connectivity.');
  process.exit(1);
}

const upload = multer({ dest: TEMP_DIR });

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

function safe(value = '') {
  return String(value).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
}

// Upload chunk (5-second segments streaming in real-time)
app.post('/api/upload-chunk', upload.single('chunk'), async (req, res) => {
  try {
    const { device, session, segment, sequence } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ ok: false, error: 'No chunk uploaded' });
    }

    const safeDevice = safe(device);
    const safeSession = safe(session);
    const safeSegment = safe(segment);
    
    // Create directory for this segment's chunks
    const segmentDir = path.join(TEMP_DIR, safeDevice, safeSession, safeSegment);
    fs.mkdirSync(segmentDir, { recursive: true });

    // Save chunk with padded sequence number for proper sorting
    const chunkPath = path.join(segmentDir, `chunk-${String(sequence).padStart(6, '0')}.webm`);
    fs.renameSync(file.path, chunkPath);

    console.log(`📦 Chunk ${sequence} from ${safeDevice} (${(file.size / 1024).toFixed(0)} KB)`);
    
    res.json({ ok: true, sequence: parseInt(sequence) });

  } catch (error) {
    console.error('❌ Chunk upload error:', error);
    res.status(500).json({ ok: false, error: 'Chunk upload failed' });
  }
});

// Finalize segment: merge all chunks into final video file
app.post('/api/finalize-segment', async (req, res) => {
  try {
    const { device, session, segment } = req.body;

    const safeDevice = safe(device);
    const safeSession = safe(session);
    const safeSegment = safe(segment);

    const segmentDir = path.join(TEMP_DIR, safeDevice, safeSession, safeSegment);

    if (!fs.existsSync(segmentDir)) {
      return res.status(400).json({ ok: false, error: 'No chunks found for segment' });
    }

    // Get all chunks and sort by sequence
    const chunks = fs.readdirSync(segmentDir)
      .filter(f => f.startsWith('chunk-') && f.endsWith('.webm'))
      .sort();

    if (chunks.length === 0) {
      return res.status(400).json({ ok: false, error: 'No chunks to merge' });
    }

    // Create final storage directory
    const date = safeSession.slice(0, 10);
    const finalDir = path.join(STORAGE_ROOT, safeDevice, date);
    fs.mkdirSync(finalDir, { recursive: true });

    // Final video filename
    const finalFilename = `${safeDevice}__${safeSegment}.webm`;
    const finalPath = path.join(finalDir, finalFilename);

    // Merge all chunks into single file
    const writeStream = fs.createWriteStream(finalPath);
    
    for (const chunkFile of chunks) {
      const chunkPath = path.join(segmentDir, chunkFile);
      const chunkData = fs.readFileSync(chunkPath);
      writeStream.write(chunkData);
    }

    writeStream.end();

    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    // Get final file stats
    const stats = fs.statSync(finalPath);
    const sizeMB = (stats.size / (1024 ** 2)).toFixed(2);

    // Cleanup: delete temporary chunks
    for (const chunkFile of chunks) {
      fs.unlinkSync(path.join(segmentDir, chunkFile));
    }
    
    // Remove empty directories
    try {
      fs.rmdirSync(segmentDir);
      fs.rmdirSync(path.join(TEMP_DIR, safeDevice, safeSession));
      fs.rmdirSync(path.join(TEMP_DIR, safeDevice));
    } catch (e) {
      // Ignore if directories not empty
    }

    console.log(`✅ Finalized: ${finalFilename} (${sizeMB} MB from ${chunks.length} chunks)`);
    
    res.json({ 
      ok: true, 
      file: finalPath,
      filename: finalFilename,
      chunks: chunks.length,
      sizeMB: parseFloat(sizeMB)
    });

  } catch (error) {
    console.error('❌ Finalize error:', error);
    res.status(500).json({ ok: false, error: 'Finalization failed' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ 
    ok: true, 
    storage: STORAGE_ROOT, 
    time: new Date().toISOString(),
    mode: 'chunked-streaming'
  });
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