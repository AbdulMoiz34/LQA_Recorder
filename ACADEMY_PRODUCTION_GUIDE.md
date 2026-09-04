# 🎓 Academy Production Deployment Guide

## Critical Improvements Needed

### 1. **Authentication System** (HIGH PRIORITY)
Currently ANYONE can upload recordings. Add password protection.

### 2. **Storage Management** (HIGH PRIORITY)
- Add disk space monitoring
- Auto-delete old recordings
- Backup system

### 3. **Better Logging** (MEDIUM)
- Track who recorded what and when
- Error logs to file

### 4. **Session Recovery** (MEDIUM)
- Resume failed uploads
- Don't lose recordings on network issues

### 5. **Real Certificate** (HIGH)
- Use Let's Encrypt for proper SSL
- No more security warnings

### 6. **Device Registration** (MEDIUM)
- Pre-register valid device IDs
- Prevent unauthorized devices

### 7. **Web Dashboard** (LOW)
- View all recordings
- Download/delete files
- See active recordings

## Quick Fixes to Apply Now

### Fix 1: Add Basic Password Protection

Add this to `server.js`:

```javascript
const UPLOAD_PASSWORD = process.env.UPLOAD_PASSWORD || 'academy2024';

app.post('/api/chunk', async (req, res) => {
  const password = req.query.password;
  if (password !== UPLOAD_PASSWORD) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }
  // ... rest of code
});
```

Update `app.js` to send password:
```javascript
const url = `/api/chunk?device=${encodeURIComponent(device)}&session=${encodeURIComponent(sessionId)}&segment=${encodeURIComponent(segmentId)}&sequence=${seq}&password=academy2024`;
```

### Fix 2: Add Disk Space Check

```javascript
import { statfsSync } from 'node:fs';

app.get('/api/storage-status', (req, res) => {
  const stats = statfsSync(STORAGE_ROOT);
  const totalGB = (stats.blocks * stats.bsize) / (1024 ** 3);
  const freeGB = (stats.bfree * stats.bsize) / (1024 ** 3);
  const usedPercent = ((totalGB - freeGB) / totalGB) * 100;
  
  res.json({
    ok: true,
    totalGB: totalGB.toFixed(2),
    freeGB: freeGB.toFixed(2),
    usedPercent: usedPercent.toFixed(1),
    warning: usedPercent > 80
  });
});
```

### Fix 3: Session Metadata Logging

```javascript
import fs from 'node:fs';

app.post('/api/chunk', async (req, res) => {
  // ... existing code ...
  
  // Log session info
  const logFile = path.join(dir, '_session.json');
  if (!fs.existsSync(logFile)) {
    fs.writeFileSync(logFile, JSON.stringify({
      device,
      session,
      startTime: new Date().toISOString(),
      chunks: []
    }, null, 2));
  }
  
  // Update log
  const log = JSON.parse(fs.readFileSync(logFile));
  log.chunks.push({ sequence, bytes: req.body.length, time: new Date().toISOString() });
  log.lastUpdate = new Date().toISOString();
  fs.writeFileSync(logFile, JSON.stringify(log, null, 2));
  
  // ... rest of code
});
```

## Recommended Architecture

```
ACADEMY NETWORK
├── Central Laptop (Windows)
│   ├── Node.js Server (port 3443)
│   ├── Storage Drive (E:\ or external)
│   └── Backup Script (daily)
│
├── Multiple Chromebooks
│   ├── academy-01 (Teacher A)
│   ├── academy-02 (Teacher B)
│   └── academy-03 (Teacher C)
│
└── Router Configuration
    ├── Static IP for laptop
    ├── Port forwarding (optional)
    └── Local DNS (optional)
```

## Production Checklist

- [ ] Add authentication
- [ ] Configure storage to external drive
- [ ] Set up automatic backups
- [ ] Add disk space monitoring
- [ ] Use static IP for laptop
- [ ] Test with 3+ simultaneous recordings
- [ ] Create teacher training guide
- [ ] Set up log rotation
- [ ] Test 4+ hour recording sessions
- [ ] Verify video playback quality
- [ ] Document recovery procedures
- [ ] Create admin dashboard

## For Academy IT Team

**Server Requirements:**
- Windows 10/11 laptop (8GB+ RAM)
- External HDD (1TB+ for storage)
- Stable power supply (UPS recommended)
- Gigabit ethernet connection
- Node.js LTS installed

**Network Requirements:**
- All devices on same network
- Laptop has static IP or DHCP reservation
- Windows Firewall allows Node.js
- Minimum 10 Mbps upload per recording

**Training Needed:**
- Teachers: How to start/stop recording
- IT: How to start server, monitor storage
- IT: Backup and recovery procedures

## Cost-Effective Improvements

**Free:**
- Add authentication (30 min dev)
- Storage monitoring (1 hour dev)
- Better logging (1 hour dev)

**Low Cost:**
- External 2TB HDD ($60)
- UPS for laptop ($80)
- Network switch if needed ($30)

**Worth Considering:**
- Dedicated mini PC for server ($200-300)
- NAS for centralized storage ($300-500)
- Paid ngrok plan for remote access ($8/month)

## Support & Maintenance

**Weekly:**
- Check storage space
- Verify backups running
- Review error logs

**Monthly:**
- Test recovery procedures
- Update Node.js/dependencies
- Review recording quality

**As Needed:**
- Add new device IDs
- Adjust storage policies
- Train new teachers
