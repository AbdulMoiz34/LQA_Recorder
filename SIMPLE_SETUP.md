# Simple Setup Guide - 3 Steps

## ✨ Philosophy: Keep It Simple

**Why no password?**
- You're on a local/private network (academy Wi-Fi)
- Only people who know the IP address can access it
- IP address itself = access control
- Fewer things to configure = fewer things to break
- **Professional = Simple + Reliable**

---

## 🚀 Setup (15 Minutes)

### Step 1: Install Node.js (5 min)

1. Download from: https://nodejs.org/ (LTS version)
2. Install with defaults
3. Verify: Open PowerShell, type `node --version`

### Step 2: Configure Server (5 min)

```bash
cd C:\Users\DELL\Desktop\chromebook-recorder
npm install
```

**Find your laptop IP:**
```bash
ipconfig
```
Note the IPv4 Address (e.g., `192.168.1.100`)

**Generate certificate:**
```bash
setup-certificate.bat
```
Enter your IP when prompted.

**Configure storage:**

Edit `start-admin-server.bat` line 10:
```bat
set STORAGE_ROOT=E:\AcademyRecordings
```

### Step 3: Start Server (1 min)

```bash
start-admin-server.bat
```

**Done!** ✅

---

## 📱 Teacher Setup (1 Minute Per Device)

1. Open Chrome
2. Go to: `https://192.168.1.100:3443` (your laptop IP)
3. Click "Advanced" → "Proceed" (security warning)
4. Bookmark the page
5. Done!

---

## 🎯 Daily Use

### Teacher:
```
First Time:
1. Open bookmark
2. Enter device ID (e.g., teacher-01)
   → Browser saves it forever! ✅
3. Click "Start recording"
4. Share screen + audio
5. Done!

Every Day After:
1. Open bookmark
2. Device ID already there! ✅
3. Click "Start recording"
4. Share screen + audio
5. Done! (30 seconds total)

Evening:
1. Click "Stop recording"
2. Wait for "All chunks uploaded"
3. Close browser
```

### Admin:
```
Morning:
1. Connect external HDD
2. Run start-admin-server.bat
3. Done!

Evening:
- Videos saved in: E:\AcademyRecordings\
- Optional: Backup to cloud/second drive
```

---

## 🔐 Security

**How is this secure without a password?**

1. **Network isolation:** Only accessible on your local network
2. **Physical security:** Must be physically in academy to access
3. **IP-based access:** Need to know exact IP address
4. **HTTPS encryption:** All data encrypted in transit
5. **No internet exposure:** Not accessible from outside

**This is the same model used by:**
- Corporate intranet sites
- Internal admin panels
- Local network printers
- Network attached storage (NAS)

**Professional security = Defense in layers, not just passwords!**

---

## 💡 Why This Works

✅ **Simple:** 3 configuration items total  
✅ **Reliable:** Fewer moving parts = fewer failures  
✅ **Professional:** Industry-standard local network security  
✅ **Maintainable:** Anyone can understand and fix  
✅ **Production-grade:** Used by real companies internally  

---

## 🎓 Summary

**Total configuration:**
1. Storage path (1 line)
2. Certificate with IP (1 command)
3. That's it!

**No passwords to:**
- Remember
- Match across files
- Change
- Reset when forgotten
- Sync when updated

**Result:** Simple, clean, professional system that just works! 🎉

---

## 📚 Full Documentation

- **Quick setup:** This file (SIMPLE_SETUP.md)
- **Complete guide:** README.md
- **Deployment:** DEPLOYMENT.md
- **Testing:** CHUNKED_STREAMING_TEST.md

---

**Keep it simple. Keep it professional. Keep it working.** ✨
