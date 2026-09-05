# Production Deployment Guide

## 🎯 Deployment Overview

**Goal:** 10 teacher Chromebooks recording to 1 admin laptop with external HDD

**Time Required:** 30 minutes total setup

---

## 📋 Pre-Deployment Checklist

### Hardware
- [ ] Admin laptop (Windows 10/11)
- [ ] External HDD (1TB minimum, USB 3.0 recommended)
- [ ] 10 teacher Chromebooks
- [ ] Stable Wi-Fi network connecting all devices
- [ ] UPS for admin laptop (recommended)

### Software
- [ ] Node.js 18+ LTS installed on admin laptop
- [ ] Chrome browser on all Chromebooks (already installed)

---

## 🚀 Step-by-Step Deployment

### Phase 1: Admin Laptop Setup (15 minutes)

#### 1.1 Install Node.js

**Download:** https://nodejs.org/ (choose LTS version)

**Install:**
- Run installer
- Accept defaults
- Restart terminal after installation

**Verify:**
```bash
node --version
# Should show: v18.x.x or higher
```

#### 1.2 Download Project

Place project folder at:
```
C:\Users\DELL\Desktop\chromebook-recorder
```

#### 1.3 Install Dependencies

```bash
cd C:\Users\DELL\Desktop\chromebook-recorder
npm install
```

**Expected output:**
```
added 50 packages in 10s
```

#### 1.4 Find Laptop IP Address

```bash
ipconfig
```

Look for "IPv4 Address" under your active network adapter (e.g., `192.168.1.100`)

**Write it down:** ______________________

#### 1.5 Generate HTTPS Certificate

```bash
setup-certificate.bat
```

When prompted, enter your laptop IP address: `192.168.1.100`

**Expected:**
```
✅ Certificate generated successfully!
```

#### 1.6 Connect External HDD

1. Plug in external HDD
2. Note the drive letter (e.g., `E:` or `D:`)
3. Create folder: `E:\AcademyRecordings` (or your drive letter)

#### 1.7 Set Storage Location

**Edit `start-admin-server.bat` (line 10):**

```bat
set STORAGE_ROOT=E:\AcademyRecordings
```

Change `E:` to your HDD drive letter.

**That's it! No passwords or complex configuration needed.**

#### 1.8 Test Server Start

```bash
start-admin-server.bat
```

**Expected output:**
```
✅ Storage is writable: E:\AcademyRecordings
✅ Academy Recorder Server is running!
📁 Videos will be stored in: E:\AcademyRecordings
🌐 Open this URL on your Chromebook:
   https://192.168.1.100:3443
```

#### 1.9 Configure Windows Firewall

When prompted:
- [x] Private networks (home/work)
- [ ] Public networks (leave unchecked)

Click "Allow access"

---

### Phase 2: Test Recording (5 minutes)

#### 2.1 Open on Admin Laptop

Open Chrome, go to: `https://192.168.1.100:3443`

#### 2.2 Accept Security Warning

Click "Advanced" → "Proceed to localhost (unsafe)"

(This is normal for self-signed certificates)

#### 2.3 Test Recording

1. Enter device ID: `test-device`
2. Click "Start recording"
3. Share screen and enable audio
4. Let it record for 30 seconds
5. Watch "Chunks uploaded" counter
6. Click "Stop recording"

#### 2.4 Verify Files

Navigate to: `E:\AcademyRecordings\test-device\[today's date]\`

You should see a `.webm` file!

**Play it to verify video and audio work.**

#### 2.5 Verify Zero Downloads

Open Chrome downloads: `chrome://downloads/`

**Should be EMPTY!** ✅

---

### Phase 3: Deploy to Chromebooks (10 minutes)

#### 3.1 Assign Device IDs

Create device IDs for each teacher:

```
Teacher 1: teacher-01
Teacher 2: teacher-02
Teacher 3: teacher-03
...
Teacher 10: teacher-10
```

Write them down and label each Chromebook.

#### 3.2 Setup Each Chromebook

**On each Chromebook:**

1. Open Chrome
2. Go to: `https://192.168.1.100:3443` (use your laptop IP)
3. Click "Advanced" → "Proceed to [IP] (unsafe)"
4. Bookmark the page (Ctrl+D)
5. Rename bookmark to "Academy Recorder"
6. Test recording with assigned device ID

**Repeat for all 10 Chromebooks.**

#### 3.3 Create Quick Reference Cards

Print these for teachers:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ACADEMY RECORDER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📱 URL: https://192.168.1.100:3443

👤 Your Device ID: teacher-01

📝 DAILY STEPS:

Morning:
1. Open "Academy Recorder" bookmark
2. Enter your device ID
3. Click "Start recording"
4. Share screen + enable audio
5. Recording starts automatically

Evening:
1. Click "Stop recording"
2. Wait for "All chunks uploaded"
3. Close browser

⚠️ IMPORTANT:
- Keep browser tab open while recording
- Don't let laptop sleep
- Check "Chunks uploaded" increases

❓ Questions? Contact IT Admin
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🎓 Teacher Training (5 minutes per teacher)

### Training Script

**Show teacher:**

1. **First time: Enter device ID**
   - "Type your assigned device ID here: teacher-01"
   - "Browser will remember this forever!"
   - "You only need to type it once!"

2. **Every day after: Already filled!**
   - "See? Your ID is already here!"
   - "Just click 'Start recording' - that's it!"

3. **Start recording**
   - "Click 'Start recording'"
   - "Choose what to share - usually 'Chrome Tab' or 'Entire Screen'"
   - "✅ Enable 'Share tab audio' to record call audio"
   - "Click 'Share'"

4. **Check it's working**
   - "See 'Recording & streaming...' status?"
   - "Watch 'Chunks uploaded' number increase"
   - "This means it's working!"

5. **Stop recording**
   - "At end of day, click 'Stop recording'"
   - "Wait for 'All chunks uploaded'"
   - "Then you can close browser"

**Common questions:**

**Q: Do I need to type my device ID every day?**  
A: No! Only first time. Browser remembers it forever.

**Q: What if I typed wrong device ID?**  
A: Just change it and click Start. Browser saves the new one.

**Q: What if I use different Chromebook?**  
A: You'll need to enter ID once on that device too.

**Q: What if I close the tab by mistake?**  
A: Current segment is lost. Just start new recording. Your ID is still saved.

**Q: What if internet disconnects?**  
A: Chunks will queue and upload when internet returns.

**Q: Do I need to delete anything?**  
A: No! Nothing saves to your Chromebook.

---

## ✅ Post-Deployment Verification

### Day 1: Monitor Closely

**Check every hour:**
- [ ] Server still running on admin laptop
- [ ] All teachers recording successfully
- [ ] "Chunks uploaded" counters increasing
- [ ] No errors in server console
- [ ] Disk space sufficient

### Week 1: Daily Checks

**Each day:**
- [ ] Verify all recordings from previous day exist
- [ ] Check file sizes are reasonable (400-600 MB per 30 min)
- [ ] Play random recordings to verify quality
- [ ] Check available disk space
- [ ] Backup recordings to second location

### Ongoing: Weekly Maintenance

**Every week:**
- [ ] Review disk space usage
- [ ] Archive old recordings to cloud/backup drive
- [ ] Check for any failed uploads
- [ ] Update teachers on any issues

---

## 🔄 Daily Admin Operations

### Morning Routine (5 minutes)

```bash
1. Connect external HDD
2. Run: start-admin-server.bat
3. Verify server started successfully
4. Check disk space: dir E:\AcademyRecordings
```

### During Day

- Keep server console visible
- Watch for any error messages
- Be available if teachers have questions

### Evening Routine (10 minutes)

```bash
1. Verify all teachers stopped recording
2. Check today's recordings exist
3. Optional: Copy to backup location
4. Server can be stopped (Ctrl+C) or left running
```

---

## 📊 Monitoring & Maintenance

### Disk Space Monitoring

**Check weekly:**

```bash
# View disk space
dir E:\AcademyRecordings

# Calculate usage
# 10 teachers × 8 hours/day × 500 MB/hour = 40 GB/day
```

**Action when 80% full:**
- Archive old recordings to cloud
- Move to larger external HDD
- Delete very old recordings (after archiving!)

### Backup Strategy

**Recommended:**

**Daily backup:** Copy to second external HDD
```bash
xcopy E:\AcademyRecordings F:\AcademyBackup /E /I /Y
```

**Weekly backup:** Upload to cloud (Google Drive, Dropbox, etc.)

### Server Health Checks

**Weekly checks:**
- [ ] Server starts without errors
- [ ] Certificate still valid (expires after 1 year)
- [ ] Password security not compromised
- [ ] No unauthorized access attempts
- [ ] All teachers can connect

---

## 🐛 Common Deployment Issues

### Issue: Chromebooks can't connect to server

**Symptoms:** Page won't load, connection timeout

**Solutions:**
1. Verify all devices on same Wi-Fi network
2. Check laptop IP hasn't changed (`ipconfig`)
3. Test from admin laptop first
4. Check Windows Firewall allows port 3443
5. Restart server if needed

### Issue: "Unauthorized" errors

**This is removed - no authentication needed!** System works on local network trust.

### Issue: Chunks not uploading (queue growing)

**Symptoms:** "Upload queue: 50 chunks queued"

**Solutions:**
1. Check internet connection
2. Verify server is running
3. Check network isn't throttling connections
4. Restart recording if queue very large

### Issue: External HDD not detected

**Symptoms:** Server won't start, storage error

**Solutions:**
1. Verify HDD is connected and powered on
2. Check drive letter in `start-admin-server.bat`
3. Ensure folder exists: `E:\AcademyRecordings`
4. Check write permissions
5. Try different USB port (USB 3.0 preferred)

---

## 🔐 Security Best Practices

### Network Security

- [x] Server only on private/local network
- [x] Don't expose port 3443 to internet
- [x] Use firewall rules (private networks only)
- [x] Physical security (only authorized users know IP)

**Why no password?**
- You're on a private network
- Only people who know the IP can access it
- Simpler = more reliable
- Less configuration = less chance of errors

### Data Security

- [x] Backup recordings regularly
- [x] Encrypt external HDD (BitLocker on Windows)
- [x] Secure physical access to admin laptop
- [x] Delete recordings after retention period

---

## 📈 Scaling Beyond 10 Teachers

**Current capacity:** 10 simultaneous recordings

**To scale to 20+ teachers:**

1. **Upgrade admin laptop:**
   - More RAM (16 GB minimum)
   - Faster CPU (i5 or better)
   - Larger HDD (2TB+)

2. **Network improvements:**
   - Dedicated Gigabit Ethernet for admin laptop
   - Quality of Service (QoS) settings on router
   - Separate VLAN for recording traffic

3. **Multiple servers:**
   - Run multiple instances on different ports
   - Distribute teachers across servers
   - Load balancer (advanced)

---

## 🎯 Success Criteria

**Deployment is successful when:**

- [x] All 10 Chromebooks can access recorder
- [x] Teachers can start/stop recording independently
- [x] Chunks upload reliably (queue stays at 0)
- [x] Videos save to external HDD
- [x] No files in Chromebook Downloads folders
- [x] Recordings play correctly with audio
- [x] Admin can monitor all recordings
- [x] System runs stable for 1 week

---

## 📞 Support & Escalation

### Teacher Issues

**First troubleshoot:**
1. Refresh browser (Ctrl+Shift+R)
2. Check internet connection
3. Verify device ID entered correctly
4. Restart recording

**If still broken:**
- Contact admin immediately
- Note exact error message
- Note which teacher/device

### Admin Issues

**Server problems:**
1. Check server console for errors
2. Restart server
3. Verify configuration files
4. Check documentation

**Hardware problems:**
1. Verify all connections
2. Test with different USB ports/cables
3. Check disk for errors: `chkdsk E: /F`

---

## ✅ Final Deployment Checklist

### Pre-Go-Live
- [ ] Node.js installed and verified
- [ ] Project dependencies installed (`npm install`)
- [ ] External HDD connected and formatted
- [ ] Storage path configured correctly
- [ ] HTTPS certificate generated with correct IP
- [ ] Server starts without errors
- [ ] Test recording completed successfully
- [ ] Downloads folder verified empty after test
- [ ] Firewall configured correctly

### Teacher Devices
- [ ] All 10 Chromebooks labeled with device IDs
- [ ] URL bookmarked on all devices
- [ ] One test recording per device completed
- [ ] Teachers trained on start/stop procedure
- [ ] Quick reference cards printed and distributed

### Monitoring & Backup
- [ ] Daily backup routine established
- [ ] Disk space monitoring plan in place
- [ ] Support contact information shared
- [ ] Documentation accessible to admin

### Go-Live Day
- [ ] Admin available all day for support
- [ ] Server running before teachers start
- [ ] Monitor first recordings closely
- [ ] Address issues immediately
- [ ] Collect feedback from teachers

---

## 🎉 Congratulations!

Your production-grade Chromebook recording system is now deployed!

**Key features achieved:**
✅ Zero Chromebook storage usage  
✅ Automatic chunked streaming  
✅ No manual cleanup required  
✅ 10 concurrent recordings supported  
✅ Reliable retry logic  
✅ External HDD storage  

**Enjoy hassle-free academy recording!** 🎓
