# Chunked Streaming Test Guide

## ✅ System Architecture

**Flow:**
```
Record 30 min → Upload 5-sec chunks → Server assembles → Final video saved
                      ↓
               Zero Downloads usage!
               No manual cleanup!
```

## 🧪 Testing Steps

### 1. Start Server

```bash
# Run this on Admin laptop
start-admin-server.bat
```

**Expected output:**
```
✅ Storage is writable: D:\AdminRecordings
✅ Academy Recorder Server is running!
📁 Videos will be stored in: D:\AdminRecordings
🌐 Open this URL on your Chromebook:
   https://<LAPTOP-IP>:3443
```

### 2. Find Admin Laptop IP

```bash
ipconfig
```

Look for "IPv4 Address" (e.g., `192.168.1.100`)

### 3. Open Recorder on Chromebook

**URL:** `https://192.168.1.100:3443` (replace with your IP)

**Accept security warning:**
- Click "Advanced"
- Click "Proceed to [IP] (unsafe)"
- This is normal for self-signed certificates

### 4. Test Recording

1. **Enter device ID:** `academy-01`
2. **Click "Start recording"**
3. **Select screen to share:**
   - Choose "Chrome Tab" or "Your entire screen"
   - ✅ Check "Share tab audio" (for call audio)
   - Click "Share"

### 5. Verify Chunked Streaming

**Watch the UI:**
- Status: "Recording & streaming..."
- Recording time: Counting up (00:00:05, 00:00:10...)
- Chunks uploaded: Increases every 5 seconds (1, 2, 3...)
- Upload queue: Should stay at "0 chunks queued" (instant upload)

**Watch server console:**
```
📦 Chunk 0 from academy-01 (1024 KB)
📦 Chunk 1 from academy-01 (1024 KB)
📦 Chunk 2 from academy-01 (1024 KB)
...
```

### 6. Test for 30 Seconds

**Let it record for 30 seconds** (not full 30 minutes for testing)

Then click **"Stop recording"**

### 7. Verify Zero Downloads Usage

**On Chromebook:**
1. Open Downloads folder: `chrome://downloads/`
2. **Verify: EMPTY!** (No .webm files)
3. ✅ **This confirms zero local storage usage!**

### 8. Check Server Storage

**On Admin laptop:**

Navigate to: `D:\AdminRecordings\academy-01\2026-09-04\`

**You should see:**
```
academy-01__2026-09-04T12-30-00__30min.webm
```

**Play the video** to verify it works!

---

## ✅ Success Criteria

| Test | Expected Result | Status |
|------|----------------|--------|
| Server starts | ✅ No errors, shows storage path | ⬜ |
| Can access web UI | ✅ Opens at https://IP:3443 | ⬜ |
| Recording starts | ✅ Permission granted, shows "Recording..." | ⬜ |
| Chunks upload | ✅ Counter increases every 5 seconds | ⬜ |
| Server receives chunks | ✅ Console shows "📦 Chunk X..." | ⬜ |
| Downloads folder empty | ✅ No .webm files in Downloads | ⬜ |
| Video saved on server | ✅ File exists in storage directory | ⬜ |
| Video plays correctly | ✅ Video is playable, has audio | ⬜ |

---

## 🐛 Troubleshooting

### Chunks not uploading (queue growing)

**Symptoms:** "Upload queue: 5 chunks queued" keeps increasing

**Solution:**
1. Check internet connection
2. Verify server is running
3. Check password matches in both files:
   - `start-admin-server.bat`: `set UPLOAD_PASSWORD=academy2024`
   - `public/app.js`: `const UPLOAD_PASSWORD = 'academy2024'`

### Server shows "Unauthorized"

**Solution:** Password mismatch. Must match EXACTLY in:
- `start-admin-server.bat` line 10
- `public/app.js` line 3

### Files still in Downloads folder

**This means:** You're using old version!

**Solution:**
1. Stop server (Ctrl+C)
2. Hard refresh browser: `Ctrl+Shift+R` or `Cmd+Shift+R`
3. Restart server
4. Try again

### Video won't play

**Possible causes:**
1. Recording was stopped before chunks finished uploading
2. Not all chunks received
3. Codec not supported

**Solution:**
- Wait for "Upload queue: 0 chunks queued" before stopping
- Use Chrome/Edge to play (best WebM support)

---

## 📊 Performance Expectations

**30-minute recording:**
- Total chunks: ~360 (one every 5 seconds)
- File size: ~400-600 MB (depends on content)
- Upload during recording: ~1-2 MB per 5 seconds
- Network usage: ~200-400 KB/s sustained

**Chromebook storage:**
- 0 MB in Downloads folder ✅
- ~10-15 MB in browser memory (temporary)

---

## 🎯 Production Readiness

### ✅ Features Implemented

- [x] Chunked streaming (5-second intervals)
- [x] Zero Chromebook storage usage
- [x] Automatic retry on upload failure (3 attempts)
- [x] Exponential backoff for retries
- [x] Queue management
- [x] Server-side chunk assembly
- [x] Session-based recording
- [x] 30-minute auto-segments
- [x] Password authentication
- [x] External HDD storage support

### 🔄 Still TODO

- [ ] Windows Service (always-running server)
- [ ] Admin dashboard improvements
- [ ] Email alerts on errors
- [ ] Disk space monitoring
- [ ] Automatic backup to cloud

---

## 🚀 Next Steps

If testing is successful:

1. **Configure external HDD:**
   - Edit `start-admin-server.bat`
   - Change `set STORAGE_ROOT=E:\AcademyRecordings`

2. **Change password:**
   - `start-admin-server.bat`: Change `set UPLOAD_PASSWORD=your_password`
   - `public/app.js`: Change `const UPLOAD_PASSWORD = 'your_password'`

3. **Deploy to all 10 Chromebooks:**
   - No installation needed!
   - Just share the URL: `https://admin-laptop-ip:3443`
   - Bookmark it on each Chromebook

4. **Train teachers:**
   - Enter device ID (e.g., teacher01, teacher02...)
   - Click Start
   - Click Stop after class
   - That's it!

---

## ✨ Benefits vs Old System

| Feature | Old (Local Save) | New (Streaming) |
|---------|------------------|-----------------|
| Chromebook storage | 400 MB per recording | 0 MB ✅ |
| Downloads cleanup | Manual deletion | Not needed ✅ |
| Internet failure | Safe (saves locally) | Retry with queue |
| Network usage | Burst (400MB at end) | Smooth (200KB/s) |
| Data loss risk | Low | Very low ✅ |
| Teacher effort | Delete files daily | Zero ✅ |
| Production-grade | Good | Excellent ✅ |

---

**Ready to test? Follow the steps above!** 🎉
