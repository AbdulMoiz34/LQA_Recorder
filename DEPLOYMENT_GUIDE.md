# Complete Deployment Guide

## 🚀 Deploy on Admin Laptop + Auto-Start

---

## PART 1: Deploy Project (15 Minutes)

### Step 1: Transfer Files (5 min)

**Option A: USB Drive** (Simplest)
```
1. Plug USB into your current laptop
2. Copy "chromebook-recorder" folder to USB
3. Eject USB
4. Plug into admin laptop
5. Copy folder to Desktop: C:\Users\Admin\Desktop\chromebook-recorder
```

**Option B: Network Share** (If on same network)
```
1. Right-click chromebook-recorder → Share
2. On admin laptop, open: \\YOUR-LAPTOP-NAME\Users\DELL\Desktop
3. Copy folder to admin Desktop
```

---

### Step 2: Install Node.js (5 min)

**On Admin Laptop:**

1. Go to: **https://nodejs.org/**
2. Download: **LTS version** (Windows Installer .msi)
3. Run installer
4. Click "Next" through all steps
5. Finish installation

**Verify:**
```bash
# Open PowerShell
node --version
```

Should show: `v18.x.x` or `v20.x.x` ✅

---

### Step 3: Setup Project (5 min)

**On Admin Laptop:**

```bash
# 1. Navigate to project
cd C:\Users\Admin\Desktop\chromebook-recorder

# 2. Install dependencies
npm install

# 3. Find admin laptop IP
ipconfig
# Note IPv4 Address: _______________ (e.g., 192.168.1.100)

# 4. Generate SSL certificate
setup-certificate.bat
# Enter your IP when prompted

# 5. Configure storage
# Edit start-admin-server.bat line 10:
# Change: set STORAGE_ROOT=E:\AcademyRecordings
```

---

### Step 4: Test Server (2 min)

```bash
start-admin-server.bat
```

**Expected output:**
```
✅ Storage is writable: E:\AcademyRecordings
✅ Academy Recorder Server is running!
🌐 Open this URL on your Chromebook:
   https://192.168.1.100:3443
```

**Test in browser:**
- Open: `https://localhost:3443`
- Should see recording interface ✅

**Stop server:** Press `Ctrl+C`

---

## PART 2: Enable Auto-Start (2 Minutes)

### Quick Setup (Automatic Startup)

**On Admin Laptop:**

```bash
# 1. Right-click install-autostart.bat
# 2. Click "Run as administrator"
# 3. Click "Yes" on UAC prompt
# 4. Done!
```

**What this does:**
- ✅ Creates Windows scheduled task
- ✅ Server starts when Windows boots
- ✅ Server starts when user logs in
- ✅ Runs in background automatically

**Verify:**
```bash
# 1. Restart laptop
# 2. After login, server should start automatically
# 3. Check: https://localhost:3443
# 4. Should work! ✅
```

---

## 🔧 Management Scripts

### Check Server Status
```bash
check-server-status.bat
```

Shows:
- ✅/❌ Server running or not
- ✅/❌ Auto-start enabled or not
- Process details

### Manual Start (if needed)
```bash
start-admin-server.bat
```

Use when:
- Auto-start disabled
- Server stopped manually
- Testing changes

### Uninstall Auto-Start
```bash
# Run as Administrator
uninstall-autostart.bat
```

Use when:
- Want to stop auto-start
- Need to update server
- Troubleshooting

---

## 📋 Daily Operations

### Morning (Admin):
**If auto-start enabled:**
- ✅ Nothing! Server already running!

**If auto-start disabled:**
```bash
start-admin-server.bat
```

### During Day:
- Server runs in background
- Teachers record normally
- Recordings save automatically

### Evening (Admin):
**If want to stop server:**
```bash
# Find server window and press Ctrl+C
# Or restart laptop (server stops)
```

**If want to keep running:**
- ✅ Leave it! Server runs 24/7 if needed

---

## 🔍 Troubleshooting

### Problem: Auto-start not working

**Check 1: Task exists?**
```bash
check-server-status.bat
```

If shows "Auto-start is NOT enabled":
```bash
# Run as Administrator
install-autostart.bat
```

**Check 2: Firewall blocking?**
- Open Windows Firewall
- Allow Node.js on Private networks

**Check 3: Storage drive connected?**
- Verify external HDD plugged in
- Check drive letter matches config

---

### Problem: Server won't start

**Error: "Port 3443 already in use"**

Solution:
```bash
# Kill existing Node.js process
taskkill /F /IM node.exe

# Try again
start-admin-server.bat
```

**Error: "Storage not writable"**

Solution:
- Check external HDD connected
- Verify path in start-admin-server.bat
- Check write permissions

**Error: "Certificate missing"**

Solution:
```bash
setup-certificate.bat
# Enter laptop IP when prompted
```

---

### Problem: Can't access from Chromebook

**Solution 1: Check IP address**
```bash
ipconfig
# Verify IPv4 address is correct
```

**Solution 2: Check firewall**
- Windows Firewall → Allow Node.js
- Private networks only

**Solution 3: Check same network**
- Admin laptop and Chromebooks on same Wi-Fi

---

## ⚙️ Advanced: Windows Service (Optional)

**Note:** Task Scheduler is simpler and sufficient!

But if you want Windows Service:

### Install node-windows
```bash
npm install -g node-windows
```

### Create service script
Create `install-service.js`:
```javascript
const Service = require('node-windows').Service;

const svc = new Service({
  name: 'Academy Recorder Server',
  description: 'Academy Chromebook Recorder Server',
  script: 'C:\\Users\\Admin\\Desktop\\chromebook-recorder\\server.js',
  env: {
    name: 'PORT',
    value: '3443'
  },
  env: {
    name: 'STORAGE_ROOT',
    value: 'E:\\AcademyRecordings'
  }
});

svc.on('install', () => {
  svc.start();
  console.log('Service installed and started!');
});

svc.install();
```

### Install service
```bash
node install-service.js
```

**Pros:**
- Runs as Windows service
- More robust
- Automatic restart on crash

**Cons:**
- More complex
- Harder to update
- Need to stop service for changes

**Recommendation:** Use Task Scheduler (simpler!) ✅

---

## 📊 Comparison: Auto-Start Methods

| Method | Complexity | Reliability | Easy Updates |
|--------|-----------|-------------|--------------|
| **Task Scheduler** ✅ | Simple | High | Yes |
| Windows Service | Complex | Very High | No |
| Startup Folder | Very Simple | Medium | Yes |

**Recommended:** Task Scheduler ✅

---

## ✅ Deployment Checklist

### Initial Setup
- [ ] Node.js installed
- [ ] Project transferred to admin laptop
- [ ] Dependencies installed (`npm install`)
- [ ] SSL certificate generated
- [ ] Storage path configured
- [ ] Test server started successfully
- [ ] External HDD connected and verified

### Auto-Start Setup
- [ ] `install-autostart.bat` run as Administrator
- [ ] Laptop restarted to test
- [ ] Server starts automatically ✅
- [ ] Accessible at https://localhost:3443

### Teacher Chromebooks
- [ ] All Chromebooks have URL bookmarked
- [ ] Test recording from one device
- [ ] Verify zero Downloads usage
- [ ] Video saved on server correctly

### Documentation
- [ ] Admin knows how to check server status
- [ ] Admin knows how to restart server
- [ ] Teachers trained on basic usage

---

## 🎯 Final Steps

1. ✅ Deploy project (15 min)
2. ✅ Enable auto-start (2 min)
3. ✅ Test automatic startup (restart laptop)
4. ✅ Deploy to Chromebooks (bookmark URL)
5. ✅ Train teachers (5 min each)
6. ✅ Done! System running!

---

## 📞 Quick Reference

**Start server manually:**
```bash
start-admin-server.bat
```

**Check status:**
```bash
check-server-status.bat
```

**Enable auto-start:**
```bash
install-autostart.bat  (as Administrator)
```

**Disable auto-start:**
```bash
uninstall-autostart.bat  (as Administrator)
```

**Stop server:**
```bash
Ctrl+C  (in server window)
```

---

## 🎉 Success!

Your server is now:
- ✅ Deployed on admin laptop
- ✅ Auto-starts on boot
- ✅ Runs 24/7 if needed
- ✅ Easy to manage
- ✅ Production-ready!

**Enjoy hassle-free recording!** 🚀
