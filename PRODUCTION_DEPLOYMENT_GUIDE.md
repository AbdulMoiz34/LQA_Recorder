# 🚀 PRODUCTION DEPLOYMENT GUIDE

## 📋 Overview

This guide will take you from development to production deployment in a structured, professional manner.

---

## ⚙️ PRE-DEPLOYMENT CHECKLIST

### **System Requirements**

**Admin Laptop (Server):**
- ✅ Windows 10/11 (64-bit)
- ✅ 8GB+ RAM
- ✅ Node.js LTS (v18 or v20)
- ✅ Git for Windows (for OpenSSL)
- ✅ External 1TB HDD
- ✅ Static IP configuration
- ✅ Stable network connection

**Teacher Chromebooks:**
- ✅ ChromeOS (any recent version)
- ✅ Chrome browser
- ✅ Access to same Wi-Fi network
- ✅ Minimum 2 GB free storage (temporary)

**Network:**
- ✅ Local Wi-Fi or LAN
- ✅ Minimum 10 Mbps upload per device
- ✅ Stable connection
- ✅ All devices on same network

---

## 🔧 PHASE 1: CONFIGURATION (30 minutes)

### **Step 1: Configure Upload Password**

**1.1 Server Configuration**

Edit `start-admin-server.bat`:
```batch
set UPLOAD_PASSWORD=YourSecurePassword2024!
```

**1.2 Client Configuration**

Edit `public/app.js` (line 2):
```javascript
const UPLOAD_PASSWORD = 'YourSecurePassword2024!';
```

**⚠️ CRITICAL: Both passwords MUST match exactly!**

**Security Tips:**
- Use strong password (min 12 characters)
- Include uppercase, lowercase, numbers, symbols
- Change from default immediately
- Don't share password via email/chat
- Store securely (password manager)

---

### **Step 2: Configure External Storage**

**2.1 Connect External HDD**

1. Connect 1TB USB HDD to admin laptop
2. Open File Explorer
3. Note the drive letter (e.g., `E:\`)
4. Format as NTFS if needed
5. Create folder: `E:\AcademyRecordings`

**2.2 Configure Server**

Edit `start-admin-server.bat`:
```batch
set STORAGE_ROOT=E:\AcademyRecordings
```

Change `E:\` to your actual drive letter if different.

---

### **Step 3: Configure Static IP**

**3.1 Find Current IP**

Open CMD:
```cmd
ipconfig
```

Look for "IPv4 Address" under your network adapter.  
Example: `192.168.1.100`

**3.2 Set Static IP**

1. Open **Settings** → **Network & Internet**
2. Click your connection → **Properties**
3. Find **IP assignment** → Click **Edit**
4. Change to **Manual**
5. Turn on **IPv4**
6. Enter:
   ```
   IP address:      192.168.1.100
   Subnet mask:     255.255.255.0
   Gateway:         192.168.1.1
   Preferred DNS:   8.8.8.8
   Alternate DNS:   8.8.4.4
   ```
7. Click **Save**

**3.3 Verify Static IP**

```cmd
ipconfig
```

Should show your new static IP.

---

## 🔐 PHASE 2: SECURITY SETUP (20 minutes)

### **Step 1: Generate SSL Certificate**

**1.1 Open CMD in Project Folder**

```cmd
cd C:\Users\DELL\Desktop\chromebook-recorder
```

**1.2 Run Certificate Setup**

```cmd
setup-certificate.bat
```

**1.3 Enter Your Static IP**

When prompted:
```
Enter this laptop's LAN IPv4 address: 192.168.1.100
```

**1.4 Verify Certificates Created**

```cmd
dir certs
```

Should show:
- `server-key.pem`
- `server-cert.pem`

---

### **Step 2: Configure Windows Firewall**

**2.1 Open Windows Defender Firewall**

1. Press **Win + R**
2. Type: `wf.msc`
3. Press **Enter**

**2.2 Create Inbound Rule**

1. Click **Inbound Rules** (left panel)
2. Click **New Rule** (right panel)
3. Select **Port** → **Next**
4. Select **TCP** → Specific local ports: `3443` → **Next**
5. Select **Allow the connection** → **Next**
6. Check **Private** only → **Next**
7. Name: `Academy Recording Server` → **Finish**

---

### **Step 3: Install Auto-Start (Optional)**

**3.1 Run Installation Script**

Right-click `install-auto-start.bat` → **Run as administrator**

**3.2 Verify Installation**

1. Press **Win + R**
2. Type: `taskschd.msc`
3. Press **Enter**
4. Find "AcademyRecordingServer" in task list

**Result:** Server will start automatically on admin login.

---

## 🚀 PHASE 3: DEPLOYMENT (1 hour)

### **Step 1: Test Admin Server**

**1.1 Start Server**

Double-click `start-admin-server.bat`

**1.2 Expected Output**

```
========================================
  ACADEMY RECORDING SERVER
  Admin Laptop - Starting...
========================================

Configuration:
===============
Storage: E:\AcademyRecordings
Password: YourSecurePassword2024!
Port: 3443

✅ External drive connected
✅ Storage is writable

Starting server...

✅ Academy Recorder Server is running!
📁 Videos will be stored in: E:\AcademyRecordings
🌐 Open this URL on your Chromebook:
   https://192.168.1.100:3443
```

**1.3 Test Locally**

Open browser on admin laptop:
```
https://localhost:3443
```

Should see recording interface.

**1.4 Test Admin Dashboard**

```
https://localhost:3443/admin.html
```

Should show admin dashboard with stats.

---

### **Step 2: Deploy to Chromebooks**

**2.1 Create Bookmark on Each Chromebook**

1. Open Chrome
2. Navigate to: `https://192.168.1.100:3443`
3. Accept security warning:
   - Click **Advanced**
   - Click **Proceed to 192.168.1.100 (unsafe)**
4. Bookmark the page (Ctrl+D)
5. Name: "Academy Recording"
6. Right-click bookmark → **Add to bookmarks bar**

**2.2 Pin to Shelf (Optional)**

1. Click **⋮** (menu) → **More tools** → **Create shortcut**
2. Name: "Academy Recording"
3. Check **Open as window**
4. Click **Create**
5. Find shortcut in app launcher
6. Right-click → **Pin to shelf**

**2.3 Assign Device IDs**

Label each Chromebook:
```
Chromebook 1 → teacher-01
Chromebook 2 → teacher-02
Chromebook 3 → teacher-03
...
```

Write ID on physical label on each device.

---

### **Step 3: Pilot Test (3 Teachers)**

**3.1 Select Pilot Teachers**

Choose 3 tech-savvy teachers who:
- Are comfortable with technology
- Can provide detailed feedback
- Have flexible schedules for testing

**3.2 Training Session (30 minutes per teacher)**

**Training Agenda:**

1. **Introduction** (5 min)
   - Explain the system
   - Show benefits
   - Answer questions

2. **Hands-On Demo** (15 min)
   - Open recording page
   - Enter device ID
   - Start recording
   - Share screen
   - Check status
   - Stop recording

3. **Practice** (10 min)
   - Teacher records 5-minute test
   - Verify file on server
   - Check Downloads folder
   - Delete local file

**3.3 Provide Training Materials**

Give each teacher:
- Printed quick reference card
- Device ID label
- Admin contact info
- Troubleshooting tips

---

### **Step 4: Monitor Pilot (1 Week)**

**Daily Checks:**

**Morning:**
- [ ] Verify admin server is running
- [ ] Check external HDD connected
- [ ] Test admin dashboard

**During Day:**
- [ ] Monitor dashboard for active recordings
- [ ] Check storage space (should not exceed 80%)
- [ ] Respond to teacher questions within 30 minutes

**Evening:**
- [ ] Verify all recordings uploaded
- [ ] Check file integrity (play test video)
- [ ] Review any errors in console
- [ ] Collect teacher feedback

**Issues to Monitor:**
- Upload failures
- Network disconnections
- Storage space warnings
- Teacher confusion/errors
- Video quality problems
- Audio sync issues

---

### **Step 5: Full Rollout (Week 2)**

**5.1 Deploy to Remaining Teachers**

After successful pilot:
1. Schedule training for remaining 7 teachers
2. Deploy in groups of 3-4
3. Stagger deployment across 3 days

**5.2 Training Schedule Example**

```
Monday:
- 9:00 AM: Teachers 4-6
- 2:00 PM: Teachers 7-9

Wednesday:
- 10:00 AM: Teacher 10

All sessions: 30 minutes each
```

**5.3 Go-Live Checklist**

- [ ] All 10 Chromebooks configured
- [ ] All teachers trained
- [ ] Device IDs assigned
- [ ] Bookmarks created
- [ ] Admin dashboard accessible
- [ ] Backup system configured
- [ ] Support process defined
- [ ] Documentation distributed

---

## 📊 PHASE 4: MONITORING & MAINTENANCE

### **Daily Tasks (Admin)**

**Morning Routine (5 minutes):**
```
1. Open admin dashboard
2. Verify server status: Online ✅
3. Check storage space: < 80% ✅
4. Review yesterday's recordings count
```

**Evening Routine (10 minutes):**
```
1. Check all recordings uploaded
2. Spot-check 1-2 videos (random playback test)
3. Review any error logs
4. Clear old recordings if storage > 70%
```

---

### **Weekly Tasks (Admin)**

**Storage Management (30 minutes):**
```
1. Review storage usage trends
2. Archive old recordings (> 2 weeks) to backup drive
3. Verify backup completed successfully
4. Clean up temp files if any
5. Update storage log
```

**System Health Check (15 minutes):**
```
1. Check Windows updates available
2. Verify SSL certificates valid (10-year validity)
3. Test recording from 1-2 Chromebooks
4. Review teacher feedback
5. Address any issues
```

---

### **Monthly Tasks (Admin)**

**Maintenance (1 hour):**
```
1. Update Node.js if new LTS available
2. Run npm audit fix (security updates)
3. Test full backup/restore procedure
4. Review and rotate logs
5. Check external HDD health (CrystalDiskInfo)
6. Train any new teachers
7. Review system performance
8. Plan improvements
```

**Security Review:**
```
1. Verify passwords not compromised
2. Review access logs (who recorded when)
3. Ensure only authorized devices
4. Check firewall rules still active
5. Update documentation if needed
```

---

## 💾 BACKUP STRATEGY

### **Automated Daily Backup**

**1. Schedule Backup Script**

1. Open **Task Scheduler** (taskschd.msc)
2. Create new task: "AcademyBackup"
3. Trigger: Daily at 11:00 PM
4. Action: Run `backup-recordings.bat`
5. Conditions: Only if computer is on
6. Settings: Allow manual run

**2. Verify Backup Configuration**

Edit `backup-recordings.bat`:
```batch
set SOURCE=E:\AcademyRecordings
set BACKUP_DRIVE=F:\Backup
```

Ensure backup drive (F:\) is connected.

---

### **Manual Backup (End of Week)**

**Weekly Archive:**
```cmd
1. Stop server
2. Copy E:\AcademyRecordings\* to external archive drive
3. Verify copy completed (file count matches)
4. Label archive: "Academy_Recordings_Week_XX_2026"
5. Store archive drive in safe location
6. Restart server
```

---

## 🚨 TROUBLESHOOTING GUIDE

### **Issue: Server Won't Start**

**Symptoms:**
- Error: "Port 3443 already in use"

**Solution:**
```cmd
1. Check if server already running (look for CMD window)
2. Kill process:
   netstat -ano | findstr :3443
   taskkill /PID <number> /F
3. Restart server
```

---

### **Issue: Upload Fails**

**Symptoms:**
- Status shows "Upload failed"
- Files only in Downloads folder

**Solution:**
```
1. Check admin server is running
2. Verify network connection:
   ping 192.168.1.100
3. Check password matches in both files
4. Review server console for errors
5. Check external HDD not full
```

---

### **Issue: External HDD Not Detected**

**Symptoms:**
- Error: "Storage not writable"
- Server won't start

**Solution:**
```
1. Check USB cable connected
2. Check HDD power on
3. Open Disk Management (diskmgmt.msc)
4. Assign drive letter if missing
5. Update STORAGE_ROOT in start-admin-server.bat
6. Restart server
```

---

### **Issue: Poor Video Quality**

**Symptoms:**
- Video is choppy
- Audio out of sync

**Solution:**
```
1. Check network bandwidth:
   - Need 2 Mbps per Chromebook
   - Use speedtest.net
2. Reduce bitrate in app.js:
   videoBitsPerSecond: 1200000
3. Lower frame rate:
   frameRate: 12
4. Use Ethernet for admin laptop (more stable)
```

---

## 📈 SCALING CONSIDERATIONS

### **Current Capacity**

**System supports:**
- Up to 15 concurrent recordings
- 1TB storage = ~14 days for 10 teachers
- Network: 20 Mbps total (2 Mbps × 10)

### **If You Need More:**

**More Teachers (15-25):**
```
✅ Upgrade to 2TB external HDD
✅ Upgrade network to gigabit switch
✅ Consider second admin laptop (load balancing)
```

**Longer Storage (> 1 month):**
```
✅ Upgrade to 4TB HDD
✅ Set up automated archival to NAS
✅ Implement retention policy (delete after 60 days)
```

**Better Reliability:**
```
✅ Add UPS (uninterruptible power supply)
✅ Use RAID for redundancy
✅ Set up cloud backup (Google Drive, S3)
✅ Implement failover server
```

---

## ✅ SUCCESS CRITERIA

**System is successful if:**

1. ✅ **Reliability:** 95%+ recordings complete without errors
2. ✅ **Availability:** Server uptime > 99% during work hours
3. ✅ **User Satisfaction:** Teachers rate ease-of-use 4+/5
4. ✅ **Data Safety:** Zero data loss incidents
5. ✅ **Performance:** Uploads complete within 2 minutes
6. ✅ **Storage:** Never exceeds 90% capacity
7. ✅ **Support:** < 2 support tickets per week after month 1

---

## 📞 SUPPORT STRUCTURE

### **Tier 1: Teacher Self-Service**

**Resources:**
- Quick reference card (printed)
- Bookmarked help page
- FAQ document
- Video tutorial (optional)

**Common Issues Teachers Can Solve:**
- Restart recording
- Check status
- Delete local files
- Basic troubleshooting

---

### **Tier 2: Admin Support**

**Admin Responsibilities:**
- Answer teacher questions (30-min response time)
- Monitor dashboard daily
- Restart server if needed
- Verify uploads
- Manage storage

**Contact Methods:**
- Phone: (admin phone number)
- Email: admin@academy.com
- In-person: Admin office

---

### **Tier 3: Developer (You)**

**Escalation Criteria:**
- Server crashes repeatedly
- Code bugs discovered
- Feature requests
- Security issues
- Major infrastructure changes

**Contact:** (your contact info)

---

## 📚 DOCUMENTATION CHECKLIST

Ensure all documents are accessible:

- [ ] `README.md` - Project overview
- [ ] `PRODUCTION_DEPLOYMENT_GUIDE.md` - This guide
- [ ] `TEACHER_TRAINING_GUIDE.md` - For teachers
- [ ] `TESTING_GUIDE.md` - Testing procedures
- [ ] `HYBRID_APPROACH_EXPLAINED.md` - Technical explanation
- [ ] `QUICK_START.md` - Quick reference
- [ ] Quick reference card (1-page, printed)
- [ ] Admin contact sheet (printed)
- [ ] Network diagram (printed)

---

## 🎯 POST-DEPLOYMENT REVIEW (After 1 Month)

**Review Meeting Agenda:**

1. **Metrics Review** (15 min)
   - Total recordings: ___
   - Failed uploads: ___
   - Storage used: ___
   - Support tickets: ___

2. **Teacher Feedback** (20 min)
   - What works well?
   - What's confusing?
   - Feature requests?
   - Training gaps?

3. **Technical Assessment** (15 min)
   - System stability
   - Performance issues
   - Capacity planning
   - Security review

4. **Action Items** (10 min)
   - Improvements needed
   - Feature priorities
   - Training updates
   - Documentation changes

---

## 🚀 YOU'RE READY!

**Deployment Status: PRODUCTION READY ✅**

Follow this guide step-by-step, and you'll have a professional, reliable recording system deployed in your academy.

**Good luck with your deployment! 🎉**

---

**Document Version:** 1.0  
**Last Updated:** September 4, 2026  
**Maintained By:** Development Team

