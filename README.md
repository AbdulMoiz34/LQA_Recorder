# Academy Chromebook Recorder — Production-Grade

## 🎯 What it does

**Zero Chromebook Storage Solution:**
- Teacher opens web app and clicks **Start recording**
- Records screen + microphone + system audio (calls, videos)
- **Streams video in 5-second chunks directly to server**
- **Zero Downloads folder usage - nothing saved locally!**
- Automatically creates 30-minute segments
- Server assembles chunks into final video files
- Stored on admin laptop with external HDD support

**Perfect for:**
- 10+ teacher Chromebooks with limited storage
- All-day recording sessions
- WhatsApp call recording, online classes, meetings
- Minimal IT management required

## 💻 System Requirements

### Admin Laptop (Server)
- Windows 10/11
- Node.js 18+ LTS
- External HDD (1TB recommended) OR internal storage
- Stable power supply (UPS recommended)
- Same Wi-Fi/LAN network as Chromebooks

### Teacher Chromebooks
- Chrome browser (any version)
- Network access to admin laptop
- **No installation required!**
- **No storage space required!**

### Network
- Stable Wi-Fi or LAN
- ~200-400 KB/s upload per active recording
- Admin laptop must have static or reserved IP

## 🚀 Quick Start (5 Minutes)

### 1. Install Node.js on Admin Laptop
Download from: https://nodejs.org/ (LTS version)

### 2. Setup Project
```bash
# Download/extract project to: C:\Users\DELL\Desktop\chromebook-recorder
cd C:\Users\DELL\Desktop\chromebook-recorder
npm install
```

### 3. Generate HTTPS Certificate
```bash
# Find laptop IP first
ipconfig
# Look for IPv4 Address (e.g., 192.168.1.20)

# Generate certificate
setup-certificate.bat
# Enter your laptop IP when prompted
```

### 4. Configure Storage

**Edit `start-admin-server.bat`:**

```bat
REM Change storage location (external HDD)
set STORAGE_ROOT=E:\AcademyRecordings
```

That's it! No passwords needed for local network.

### 5. Start Server
```bash
start-admin-server.bat
```

**Expected output:**
```
✅ Storage is writable: E:\AcademyRecordings
✅ Academy Recorder Server is running!
🌐 Open this URL on your Chromebook:
   https://192.168.1.20:3443
```

### 6. Open on Chromebook

**URL:** `https://192.168.1.20:3443` (use your laptop IP)

**First time only:**
1. You'll see security warning (self-signed certificate)
2. Click "Advanced"
3. Click "Proceed to [IP] (unsafe)"
4. Bookmark the page!

### 7. Start Recording

**First Time Setup (Once Only):**
1. Enter device ID: `teacher-01`
2. Browser will remember this ID forever!

**Every Day After:**
1. Open URL → Device ID already filled in! ✅
2. Click "Start recording"
3. Select what to share:
   - **Chrome Tab** (for recording specific tab/call)
   - **Entire Screen** (for recording everything)
   - ✅ Enable "Share tab audio" (for call/video audio)
4. Click "Share"

**Done! Recording now streams to server!** 🎉

**Note:** Device ID is saved in browser. If teacher uses different Chromebook, they'll need to enter ID once on that device too.

## 📁 Storage Structure

Videos are saved in organized folders:

```
E:\AcademyRecordings\
├── teacher-01\
│   └── 2026-09-04\
│       ├── teacher-01__2026-09-04T09-00-00__30min.webm  (400-600 MB)
│       ├── teacher-01__2026-09-04T09-30-00__30min.webm
│       └── teacher-01__2026-09-04T10-00-00__30min.webm
├── teacher-02\
│   └── 2026-09-04\
│       └── teacher-02__2026-09-04T09-00-00__30min.webm
└── ...
```

**Each file:**
- Named with device ID, timestamp, and duration
- Automatically created every 30 minutes
- ~400-600 MB per 30-minute segment
- WebM format (plays in Chrome, VLC, Windows Media Player with codecs)

## 🔐 Security

**Network Security:**
- Server only accessible on local network
- HTTPS encryption for data transmission
- Physical security (only accessible if you know the IP)
- No internet exposure

**Why no password?**
- Local network only (admin + teachers on same network)
- IP address itself provides access control
- Simpler = fewer things to break
- Professional networks use physical/network security, not app-level passwords for internal tools

## ⚠️ Important Notes

### What Teachers Need to Know

**Starting Recording:**
1. Open bookmarked URL
2. Enter your device ID (teacher-01, teacher-02, etc.)
3. Click "Start recording"
4. Share your screen/tab + audio
5. Watch "Chunks uploaded" counter increase

**During Recording:**
- Keep browser tab open
- Don't close laptop lid (Chromebook may sleep)
- Watch for "Upload queue" - should stay at "0 chunks queued"
- If queue grows, check internet connection

**Stopping Recording:**
- Click "Stop recording"
- Wait for "All chunks uploaded" message
- Safe to close tab after that

**What NOT to Do:**
- ❌ Don't close tab while recording (will lose current segment)
- ❌ Don't let Chromebook sleep/hibernate
- ❌ Don't disconnect from Wi-Fi during recording

### Technical Details

**Chunked Streaming:**
- Records in 5-second chunks
- Each chunk uploaded immediately (~1 MB)
- Chunks stored temporarily on server
- Merged into final video every 30 minutes
- **Zero Chromebook storage used!**

**Retry Logic:**
- Failed uploads retry 3 times automatically
- Exponential backoff (2s, 4s, 8s delays)
- Queue system prevents data loss during temporary network issues

**30-Minute Segments:**
- Recording auto-splits into 30-min files
- Prevents huge file sizes
- Easier to manage and transfer
- Recording continues across segments automatically

**Browser Support:**
- Chrome/Chromium only (uses MediaRecorder API)
- Requires HTTPS (security requirement for screen capture)
- Modern Chrome versions (2020+)

## 🐛 Troubleshooting

### "Failed to start recording" or "Permission denied"

**Solution:** Browser needs HTTPS and user permission
- Verify URL starts with `https://` (not `http://`)
- Click "Allow" when Chrome asks for permissions
- Try refreshing page (Ctrl+Shift+R)

### Chunks not uploading (queue growing)

**Symptoms:** "Upload queue: 10 chunks queued" keeps increasing

**Solutions:**
1. Check internet connection between Chromebook and laptop
2. Verify server is running (check server console)
3. Check firewall isn't blocking connections
4. Verify both devices on same network

### "Unauthorized" error in server console

**This error is removed - no authentication needed on local network!**

### Video won't play

**Solutions:**
1. Try different player:
   - Chrome browser (best for WebM)
   - VLC Media Player (free, supports everything)
   - Windows Media Player (may need codecs)

2. Check file size isn't 0 KB

3. Verify recording didn't stop prematurely

### Server won't start: "Port already in use"

**Solution:** Another instance is running

```bash
# Find and kill Node.js process
tasklist | findstr node
taskkill /F /PID [process_id]
```

Or restart computer.

### External drive not detected

**Symptoms:**
```
❌ ERROR: Storage drive not accessible!
```

**Solutions:**
1. Verify drive is connected
2. Check drive letter in `start-admin-server.bat`
3. Ensure you have write permissions
4. Try different USB port

### Recording has no audio

**Common causes:**
1. ❌ "Share tab audio" not enabled during screen selection
2. ❌ System audio muted
3. ❌ Microphone permission denied

**Solution:** Stop and restart recording, enable "Share tab audio"

## 📊 Performance & Capacity

### Storage Requirements

**Per teacher per day:**
- 8 hours recording = 16 segments × 500 MB = ~8 GB
- 1 week = ~40 GB
- 1 month = ~160 GB

**10 teachers:**
- 1 week = ~400 GB
- 1 month = ~1.6 TB
- **1TB HDD = ~3 weeks of recordings for 10 teachers**

### Network Usage

**Per active recording:**
- Sustained: ~200-400 KB/s upload
- Peak: ~1-2 MB per 5 seconds

**10 simultaneous recordings:**
- Total: ~2-4 MB/s network usage
- Most home/academy Wi-Fi can handle this easily

### Chromebook Requirements

**Storage:** 0 MB (nothing saved to disk!) ✅  
**Memory:** ~50-100 MB browser memory (temporary)  
**CPU:** Low (handled by browser efficiently)

## 🔄 Daily Operations

### For Admin

**Morning (5 minutes):**
1. Connect external HDD
2. Run `start-admin-server.bat`
3. Verify server started successfully
4. Share IP address with new teachers if needed

**During Day:**
- Monitor server console for errors
- Check disk space occasionally

**Evening:**
- Review/backup recordings if needed
- Keep server running or stop (Ctrl+C)

### For Teachers

**Morning (30 seconds):**
1. Open bookmarked URL
2. Enter device ID
3. Click "Start recording"
4. Share screen + audio

**During Day:**
- Recording runs automatically
- Check occasionally that "Chunks uploaded" is increasing

**Evening (10 seconds):**
1. Click "Stop recording"
2. Wait for upload complete
3. Close browser

## 📚 Additional Documentation

- **[CHUNKED_STREAMING_TEST.md](CHUNKED_STREAMING_TEST.md)** - Detailed testing guide
- **[QUICK_START.md](QUICK_START.md)** - Simplified setup instructions
- **[PRODUCTION_AUDIT.md](PRODUCTION_AUDIT.md)** - Security and production readiness
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Comprehensive testing procedures

## 🎯 Production Deployment Checklist

- [ ] Node.js installed on admin laptop
- [ ] External HDD connected and tested
- [ ] HTTPS certificate generated with laptop IP
- [ ] Storage path configured in `start-admin-server.bat`
- [ ] Server starts without errors
- [ ] Firewall allows connections on port 3443
- [ ] Tested recording from one Chromebook
- [ ] Verified Downloads folder stays empty
- [ ] Video plays correctly with audio
- [ ] All 10 Chromebooks have URL bookmarked
- [ ] Teachers trained on start/stop procedure
- [ ] Backup plan for recordings (copy to cloud/second drive)

## 🆘 Support

**Common Questions:**

**Q: Can we use this over the internet (remote teachers)?**  
A: Technically yes (using ngrok/port forwarding), but not recommended. Large video uploads over internet are unreliable.

**Q: Can admin laptop be turned off at night?**  
A: Yes! No need to run 24/7. Start server each morning.

**Q: What if internet goes down during recording?**  
A: Chunks queue in browser memory and auto-retry. When internet returns, uploads resume. If tab closes before queue clears, those chunks are lost.

**Q: Can we record longer than 30 minutes?**  
A: Yes! Recording continues automatically. It just splits into multiple 30-minute files.

**Q: Why 30-minute segments?**  
A: Easier to manage, transfer, and recover from failures. One file is never huge.

**Q: Can we change password without breaking existing recordings?**  
A: No passwords needed! Works on local network only.

**Q: How do we share recordings with teachers?**  
A: Copy files from external HDD to USB drive, or use network file sharing.

---

## 🏆 Why This Solution Works

✅ **Zero Chromebook storage** - streams directly to server  
✅ **No manual cleanup** - nothing to delete  
✅ **Production-grade** - retry logic, error handling  
✅ **Easy deployment** - just share URL, no installation  
✅ **Reliable** - chunks ensure no data loss  
✅ **Scalable** - 10+ teachers simultaneously  
✅ **Maintainable** - simple architecture, clear code  

---

**Built for educational institutions with limited device storage!** 🎓
