# 🎓 ACADEMY PRODUCTION DEPLOYMENT - COMPLETE GUIDE

## 📊 SYSTEM OVERVIEW

**Environment:** 10+ Teacher Windows Laptops → 1 Admin Laptop (Server) → External 1TB HDD

**Recording Flow:**
```
Teacher opens Chrome → Starts recording → Every 30 minutes:
  1. Recording downloads to teacher's Downloads folder
  2. Auto-upload to admin server
  3. Delete from teacher's laptop
  4. Admin server saves to external HDD
```

---

## 🎯 ARCHITECTURE DESIGN

### **Current System Analysis**

**What Works:**
- ✅ Browser-based recording (works on Windows laptops too!)
- ✅ 30-minute auto-segmentation
- ✅ Chunked upload (every 5 seconds)
- ✅ Server receives and stores files

**What Needs Fixing:**
- ❌ Files save to teacher's Downloads folder (wrong!)
- ❌ No automatic upload after 30-min segment
- ❌ No automatic deletion from teacher's laptop
- ❌ Server not connected to external HDD

**What Needs Adding:**
- ➕ Direct upload to server (skip Downloads folder)
- ➕ Auto-cleanup on teacher's laptop
- ➕ External HDD storage configuration
- ➕ Authentication (prevent unauthorized uploads)
- ➕ Disk space monitoring
- ➕ Auto-start server on admin laptop boot

---

## 🔧 REQUIRED CHANGES

### **1. Change Upload Strategy**

**Current (WRONG):**
```
Recording → Downloads folder → Manual transfer → Server
```

**New (CORRECT):**
```
Recording → Upload chunks every 5 seconds → Server → External HDD
```

**Good News:** Your current code ALREADY does this! The chunked upload works.

**The Problem:** The `app.js` ALSO downloads files locally. We need to make that optional.

### **2. Configure External HDD Storage**

**Admin laptop setup:**
```cmd
# Connect 1TB external HDD
# Assign drive letter: E:\

# Create storage folder
mkdir E:\AcademyRecordings

# Configure server to use it
set STORAGE_ROOT=E:\AcademyRecordings
```

### **3. Add Authentication**

**Why?** Prevent unauthorized devices from uploading.

**How?** Simple password in environment variable.

### **4. Add Auto-Cleanup**

**Why?** Teacher laptops have limited storage.

**How?** Browser automatically clears after successful upload.

---

## 📝 IMPLEMENTATION STEPS

---

## STEP 1: MODIFY SERVER FOR EXTERNAL HDD

### **Edit server.js - Add External Storage Configuration**

```javascript
// At the top of server.js
const STORAGE_ROOT = process.env.STORAGE_ROOT || path.join(__dirname, 'storage');
const UPLOAD_PASSWORD = process.env.UPLOAD_PASSWORD || 'academy2024';

console.log(`📁 Storage configured at: ${STORAGE_ROOT}`);

// Verify storage is writable
try {
  fs.accessSync(STORAGE_ROOT, fs.constants.W_OK);
  console.log('✅ Storage is writable');
} catch (err) {
  console.error('❌ Storage is not writable!', err.message);
  process.exit(1);
}
```

### **Add Authentication Middleware**

```javascript
// Add BEFORE your /api/upload endpoint
app.use('/api', (req, res, next) => {
  const password = req.headers['x-upload-password'] || req.query.password;
  
  if (password !== UPLOAD_PASSWORD) {
    console.log('❌ Unauthorized upload attempt');
    return res.status(401).json({ 
      ok: false, 
      error: 'Unauthorized. Please contact administrator.' 
    });
  }
  
  next();
});
```

### **Add Disk Space Monitoring**

```javascript
import os from 'node:os';

// Add new endpoint
app.get('/api/storage-info', (req, res) => {
  try {
    const stats = fs.statfsSync ? fs.statfsSync(STORAGE_ROOT) : null;
    
    let diskInfo = { available: 'unknown' };
    
    if (stats) {
      const totalGB = (stats.blocks * stats.bsize) / (1024 ** 3);
      const freeGB = (stats.bfree * stats.bsize) / (1024 ** 3);
      const usedGB = totalGB - freeGB;
      const usedPercent = (usedGB / totalGB) * 100;
      
      diskInfo = {
        totalGB: totalGB.toFixed(2),
        usedGB: usedGB.toFixed(2),
        freeGB: freeGB.toFixed(2),
        usedPercent: usedPercent.toFixed(1),
        warning: usedPercent > 80,
        critical: usedPercent > 90
      };
    }
    
    res.json({ ok: true, storage: STORAGE_ROOT, disk: diskInfo });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});
```

---

## STEP 2: MODIFY CLIENT TO UPLOAD DIRECTLY

### **Edit public/app.js - Add Upload Configuration**

The current code downloads files locally. We need to:
1. Keep chunked upload (already working)
2. Make local download optional
3. Add cleanup after upload

**Current behavior:** Files download AND upload
**New behavior:** Files ONLY upload (no local copy)

**Add at the top of app.js:**

```javascript
// Configuration
const UPLOAD_MODE = 'server-only'; // or 'local-and-server'
const UPLOAD_PASSWORD = 'academy2024'; // CHANGE THIS!
const SERVER_URL = window.location.origin;
```

**Modify the saveSegment() function:**

```javascript
function saveSegment() {
  if (recordedChunks.length === 0) return;
  
  const device = el('device').value.trim();
  const blob = new Blob(recordedChunks, { type: chooseMimeType() });
  const filename = `${device}_${sessionId}_${segmentId}.webm`;
  
  // Upload to server
  uploadToServer(blob, filename);
  
  // Optional: Download locally (for debugging)
  if (UPLOAD_MODE === 'local-and-server') {
    downloadRecording(blob, filename);
  }
  
  console.log(`✅ Uploaded: ${filename} (${(blob.size / (1024 ** 2)).toFixed(2)} MB)`);
  
  el('chunks').textContent = parseInt(el('chunks').textContent || '0') + 1;
  recordedChunks = [];
}

async function uploadToServer(blob, filename) {
  const device = el('device').value.trim();
  
  const formData = new FormData();
  formData.append('recording', blob, filename);
  formData.append('device', device);
  formData.append('session', sessionId);
  
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'X-Upload-Password': UPLOAD_PASSWORD
      },
      body: formData
    });
    
    const result = await response.json();
    
    if (!result.ok) {
      console.error('Upload failed:', result.error);
      setStatus('Upload failed - check password');
    } else {
      console.log('✅ Upload successful:', filename);
    }
  } catch (error) {
    console.error('Upload error:', error);
    setStatus('Upload error - check connection');
  }
}
```

---

## STEP 3: CREATE STARTUP SCRIPTS

### **For Admin Laptop - Auto-Start Server**

**File: `start-admin-server.bat`**

```batch
@echo off
echo ========================================
echo   ACADEMY RECORDING SERVER
echo   Admin Laptop - Starting...
echo ========================================

cd /d %~dp0

REM Configure external HDD storage
set STORAGE_ROOT=E:\AcademyRecordings
set UPLOAD_PASSWORD=academy2024
set PORT=3443

REM Check if external drive exists
if not exist E:\ (
  echo ❌ ERROR: External HDD (E:\) not connected!
  echo Please connect the 1TB hard disk and restart.
  pause
  exit /b 1
)

REM Create storage folder
if not exist %STORAGE_ROOT% mkdir %STORAGE_ROOT%

echo ✅ Storage: %STORAGE_ROOT%
echo 🔐 Password: %UPLOAD_PASSWORD%
echo 🌐 Port: %PORT%
echo.

REM Install dependencies if needed
if not exist node_modules (
  echo Installing dependencies...
  call npm install
)

echo Starting server...
npm start

pause
```

### **Create Windows Task Scheduler Entry**

Create file: `install-auto-start.bat`

```batch
@echo off
echo Installing auto-start service...

set SCRIPT_PATH=%~dp0start-admin-server.bat

schtasks /create /tn "AcademyRecordingServer" /tr "%SCRIPT_PATH%" /sc onlogon /rl highest /f

echo.
echo ✅ Auto-start installed!
echo Server will start automatically when admin logs in.
echo.
pause
```

---

## STEP 4: CREATE TEACHER LAPTOP SHORTCUTS

### **File: `open-recording-app.bat` (for teachers)**

```batch
@echo off
echo Opening Academy Recording System...

REM Admin laptop IP (configure this)
set ADMIN_IP=192.168.1.100
set PORT=3443

start chrome --new-window "https://%ADMIN_IP%:%PORT%"

echo.
echo ✅ Recording system opened in Chrome
echo.
echo Instructions:
echo 1. Enter your teacher ID (e.g., teacher-01)
echo 2. Click "Start Recording"
echo 3. Select your screen
echo 4. Keep this Chrome tab OPEN all day
echo 5. DO NOT close Chrome until end of day
echo.
pause
```

---

## STEP 5: NETWORK CONFIGURATION

### **Admin Laptop - Static IP Configuration**

**Windows Settings:**
1. Open Settings → Network & Internet → Change adapter options
2. Right-click your network adapter → Properties
3. Select "Internet Protocol Version 4 (TCP/IPv4)" → Properties
4. Select "Use the following IP address":
   ```
   IP address: 192.168.1.100
   Subnet mask: 255.255.255.0
   Default gateway: 192.168.1.1
   Preferred DNS: 8.8.8.8
   ```

### **Router Configuration (Optional but Recommended)**

**DHCP Reservations for Teacher Laptops:**
```
teacher-laptop-01 → 192.168.1.101
teacher-laptop-02 → 192.168.1.102
...
teacher-laptop-10 → 192.168.1.110
```

**Why?** Consistent IPs make troubleshooting easier.

---

## STEP 6: SECURITY HARDENING

### **Change Default Password**

**In start-admin-server.bat:**
```batch
set UPLOAD_PASSWORD=YourSecurePassword123!
```

**In teacher's app.js:**
```javascript
const UPLOAD_PASSWORD = 'YourSecurePassword123!';
```

### **Add Device Whitelist (Optional)**

**In server.js:**

```javascript
const ALLOWED_DEVICES = [
  'teacher-01', 'teacher-02', 'teacher-03', 'teacher-04', 'teacher-05',
  'teacher-06', 'teacher-07', 'teacher-08', 'teacher-09', 'teacher-10'
];

app.post('/api/upload', upload.single('recording'), async (req, res) => {
  const { device } = req.body;
  
  if (!ALLOWED_DEVICES.includes(device)) {
    return res.status(403).json({ 
      ok: false, 
      error: 'Device not registered. Contact administrator.' 
    });
  }
  
  // ... rest of upload logic
});
```

---

## STEP 7: MONITORING & MAINTENANCE

### **Admin Dashboard (Simple HTML)**

**File: `public/admin.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Admin Dashboard</title>
  <style>
    body { font-family: system-ui; padding: 20px; background: #f0f0f0; }
    .card { background: white; padding: 20px; margin: 10px 0; border-radius: 8px; }
    .status { font-size: 24px; font-weight: bold; }
    .ok { color: green; }
    .warning { color: orange; }
    .critical { color: red; }
  </style>
</head>
<body>
  <h1>🎓 Academy Recording System - Admin Dashboard</h1>
  
  <div class="card">
    <h2>Server Status</h2>
    <div id="status" class="status">Checking...</div>
  </div>
  
  <div class="card">
    <h2>Storage Information</h2>
    <div id="storage">Loading...</div>
  </div>
  
  <div class="card">
    <h2>Active Recordings</h2>
    <div id="recordings">Loading...</div>
  </div>
  
  <script>
    async function updateStatus() {
      try {
        const res = await fetch('/api/storage-info');
        const data = await res.json();
        
        document.getElementById('status').textContent = '✅ Online';
        document.getElementById('status').className = 'status ok';
        
        const disk = data.disk;
        let storageHTML = `
          <p><strong>Location:</strong> ${data.storage}</p>
          <p><strong>Total:</strong> ${disk.totalGB} GB</p>
          <p><strong>Used:</strong> ${disk.usedGB} GB (${disk.usedPercent}%)</p>
          <p><strong>Free:</strong> ${disk.freeGB} GB</p>
        `;
        
        if (disk.critical) {
          storageHTML += '<p class="critical">⚠️ CRITICAL: Disk almost full!</p>';
        } else if (disk.warning) {
          storageHTML += '<p class="warning">⚠️ WARNING: Disk space low</p>';
        }
        
        document.getElementById('storage').innerHTML = storageHTML;
        
      } catch (error) {
        document.getElementById('status').textContent = '❌ Offline';
        document.getElementById('status').className = 'status critical';
      }
    }
    
    updateStatus();
    setInterval(updateStatus, 10000); // Update every 10 seconds
  </script>
</body>
</html>
```

### **Access Dashboard**

Open: `https://192.168.1.100:3443/admin.html`

---

## STEP 8: BACKUP STRATEGY

### **Daily Backup Script**

**File: `backup-recordings.bat`**

```batch
@echo off
echo ========================================
echo   DAILY BACKUP - Academy Recordings
echo ========================================

set SOURCE=E:\AcademyRecordings
set BACKUP=F:\Backup\Academy_%DATE:~-4,4%-%DATE:~-10,2%-%DATE:~-7,2%

echo Backing up from: %SOURCE%
echo Backing up to: %BACKUP%
echo.

REM Create backup directory
if not exist F:\Backup mkdir F:\Backup
if not exist %BACKUP% mkdir %BACKUP%

REM Copy files
xcopy %SOURCE% %BACKUP% /E /I /Y /D

echo.
echo ✅ Backup completed!
echo Location: %BACKUP%
echo.
pause
```

**Schedule with Task Scheduler:**
- Run daily at 11:00 PM
- Only when admin is logged in

---

## 📋 DEPLOYMENT CHECKLIST

### **ADMIN LAPTOP SETUP**

- [ ] Install Node.js LTS
- [ ] Install Git for Windows (for OpenSSL)
- [ ] Connect external 1TB HDD (assign as E:\)
- [ ] Configure static IP: 192.168.1.100
- [ ] Run: `setup-certificate.bat`
- [ ] Edit `start-admin-server.bat` (set password)
- [ ] Run: `install-auto-start.bat`
- [ ] Test server: `npm start`
- [ ] Verify storage: Check E:\AcademyRecordings folder
- [ ] Test dashboard: Open https://localhost:3443/admin.html
- [ ] Configure Windows Firewall (allow port 3443)
- [ ] Test from another laptop
- [ ] Set up backup script (Task Scheduler)

### **TEACHER LAPTOP SETUP (Each of 10+ laptops)**

- [ ] Install Chrome browser
- [ ] Copy `open-recording-app.bat` to desktop
- [ ] Edit batch file: Set ADMIN_IP=192.168.1.100
- [ ] Create desktop shortcut
- [ ] Test: Open Chrome → Recording page loads
- [ ] Test: Start recording → Chunks upload
- [ ] Train teacher: How to use system
- [ ] Label laptop: teacher-01, teacher-02, etc.

### **NETWORK SETUP**

- [ ] Configure router DHCP reservations
- [ ] Test connectivity between all laptops
- [ ] Verify admin laptop is reachable: ping 192.168.1.100
- [ ] Test upload from teacher laptop
- [ ] Verify file appears in E:\AcademyRecordings

---

## 🎓 TEACHER TRAINING GUIDE

### **Daily Usage Instructions**

**MORNING (When arriving):**
1. Turn on laptop
2. Double-click "Academy Recording" icon on desktop
3. Chrome opens automatically
4. Enter your teacher ID (e.g., `teacher-01`)
5. Click "Start Recording"
6. Select "Entire screen" or your teaching application window
7. Check "Record microphone"
8. Click "Share"
9. **Minimize Chrome (don't close!)**
10. Start teaching

**DURING DAY:**
- ✅ Keep Chrome running (minimized is OK)
- ✅ Recording happens automatically
- ❌ DON'T close Chrome tab
- ❌ DON'T shut down laptop (sleep is OK)

**EVENING (When leaving):**
1. Open Chrome
2. Go to recording tab
3. Click "Stop Recording"
4. Wait for "Pending uploads: 0"
5. Close Chrome
6. Shut down laptop

---

## 🔥 TROUBLESHOOTING GUIDE

### **Issue: "Cannot connect to server"**

**Check:**
1. Is admin laptop ON?
2. Are both laptops on same Wi-Fi?
3. Ping test: `ping 192.168.1.100`
4. Is server running on admin laptop?

### **Issue: "Unauthorized upload"**

**Check:**
1. Password mismatch in app.js vs server
2. Check browser console for errors

### **Issue: "Disk full"**

**Solution:**
1. Open admin dashboard
2. Check storage percentage
3. Move old recordings to backup
4. Delete unnecessary files

### **Issue: "Recording stopped unexpectedly"**

**Common causes:**
1. Teacher closed Chrome tab
2. Laptop went to sleep
3. Network disconnected
4. Browser crashed

**Prevention:**
- Train teachers: Keep Chrome open
- Disable laptop sleep during work hours
- Use Ethernet instead of Wi-Fi (if possible)

---

## 💰 COST BREAKDOWN

| Item | Quantity | Unit Cost | Total |
|------|----------|-----------|-------|
| External 1TB HDD | 1 | $50 | $50 |
| Backup 1TB HDD | 1 | $50 | $50 |
| Network Switch (if needed) | 1 | $30 | $30 |
| UPS for admin laptop | 1 | $80 | $80 |
| **Total** | | | **$210** |

**Software:** $0 (all free/open source)

---

## 📊 CAPACITY PLANNING

**Recording Settings:**
- Resolution: 1920x1080 (Full HD)
- Bitrate: 1.8 Mbps
- Frame rate: 15 fps
- Codec: VP9/VP8 + Opus

**File Sizes:**
- 30-minute segment: ~400-500 MB
- 1-hour teaching: ~900 MB
- 8-hour day: ~7 GB per teacher
- 10 teachers: ~70 GB per day
- 1 week: ~350 GB
- 1 month: ~1.4 TB (exceeds 1TB HDD!)

**⚠️ RECOMMENDATION:**
- Use 2TB HDD instead of 1TB
- Or: Delete recordings after 2 weeks
- Or: Move old recordings to separate archive drive

---

## 🎯 SUCCESS CRITERIA

**System is working if:**
- ✅ All 10 teachers can record simultaneously
- ✅ Recordings save to E:\AcademyRecordings
- ✅ Files are playable (video + audio)
- ✅ No files accumulate on teacher laptops
- ✅ Admin can monitor storage via dashboard
- ✅ System runs for full work day without issues
- ✅ Backups complete automatically

---

## 🚀 GO-LIVE PLAN

### **Week 1: Pilot (3 teachers)**
- Deploy to 3 teacher laptops
- Monitor closely
- Fix any issues
- Collect feedback

### **Week 2: Rollout (All teachers)**
- Deploy to remaining 7+ laptops
- Morning briefing: Usage instructions
- Active monitoring first 3 days

### **Week 3: Stabilization**
- Address any issues
- Optimize settings
- Train admin on maintenance

### **Week 4: Business as Usual**
- System runs independently
- Admin checks dashboard daily
- Weekly backup verification

---

## 📚 MAINTENANCE SCHEDULE

**Daily:**
- [ ] Check admin dashboard (storage space)
- [ ] Verify server is running

**Weekly:**
- [ ] Verify backups completed
- [ ] Review error logs (if any)
- [ ] Test recovery procedure

**Monthly:**
- [ ] Archive old recordings
- [ ] Update Node.js/dependencies
- [ ] Clean up temp files
- [ ] Check disk health

---

## ⚡ PERFORMANCE OPTIMIZATION

**If system is slow:**

1. **Reduce bitrate:**
   ```javascript
   videoBitsPerSecond: 1200000  // 1.2 Mbps instead of 1.8
   ```

2. **Lower frame rate:**
   ```javascript
   frameRate: 12  // instead of 15
   ```

3. **Use Ethernet:**
   - Connect admin laptop via cable
   - Faster + more reliable than Wi-Fi

4. **Upgrade network:**
   - Use gigabit switch
   - Ensure router supports 10+ devices

---

## 🎓 WHAT YOU LEARNED (Senior Engineer Lessons)

1. **Requirements Gathering:** Always clarify deployment environment
2. **Architecture Design:** System design must match actual use case
3. **Scalability:** Plan for growth (10 users today, 20 tomorrow?)
4. **Reliability:** Single point of failure (admin laptop)
5. **Monitoring:** Always include observability from day 1
6. **Security:** Authentication, whitelisting, password protection
7. **Maintenance:** Plan for backups, updates, troubleshooting
8. **User Training:** Technical solution ≠ adopted solution
9. **Cost Analysis:** Balance features vs budget
10. **Iterative Deployment:** Pilot → Rollout → Stabilize

---

**System Ready for Deployment! 🚀**

