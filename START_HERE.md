# ⚡ START HERE - DEPLOYMENT IN 10 STEPS

## 🎯 Goal: Get recording system working

## 📦 WHAT YOU NEED:

- ✅ This project folder
- ✅ Admin laptop (Windows)
- ✅ External 1TB USB hard drive
- ✅ 10 Chromebooks
- ✅ Same Wi-Fi network for all devices

---

## 🚀 10 SIMPLE STEPS

### STEP 1: Copy to Admin Laptop (5 min)

Copy entire `chromebook-recorder` folder to:
```
C:\chromebook-recorder
```

---

### STEP 2: Set Password (2 min)

**⚠️ CRITICAL: Set SAME password in 2 files!**

**File 1:** `start-admin-server.bat`
```batch
set UPLOAD_PASSWORD=MySecret2024
```

**File 2:** `public\app.js` (line 2)
```javascript
const UPLOAD_PASSWORD = 'MySecret2024';
```

**Must be EXACTLY the same!**

---

### STEP 3: Install Software (10 min)

On admin laptop:

1. Install Node.js: https://nodejs.org/ (LTS version)
2. Install Git: https://git-scm.com/download/win
3. Restart computer

---

### STEP 4: Connect Hard Drive (1 min)

1. Plug in 1TB USB drive
2. Note drive letter (e.g., `E:\`)
3. Create folder: `E:\AcademyRecordings`

---

### STEP 5: Configure Storage (1 min)

Edit `start-admin-server.bat`:
```batch
set STORAGE_ROOT=E:\AcademyRecordings
```

Change `E:\` if your drive is different letter.

---

### STEP 6: Find Admin IP (1 min)

1. Open CMD: Press Win+R, type `cmd`
2. Type: `ipconfig`
3. Find "IPv4 Address" (example: `192.168.1.100`)
4. Write it down: __________________

---

### STEP 7: Generate Certificate (2 min)

In CMD:
```cmd
cd C:\chromebook-recorder
setup-certificate.bat
```

Enter your IP address when asked.

---

### STEP 8: Install & Start Server (5 min)

In CMD:
```cmd
npm install
start-admin-server.bat
```

Should see: "✅ Academy Recorder Server is running!"

**Keep CMD window open!**

---

### STEP 9: Setup Chromebooks (5 min each)

On each Chromebook:

1. Open Chrome
2. Go to: `https://192.168.1.100:3443` (your IP from Step 6)
3. Click "Advanced" → "Proceed"
4. Bookmark the page (Ctrl+D)
5. Test: Record 1 minute, check file on admin laptop

---

### STEP 10: Train Teachers (10 min each)

Show them:
1. Click bookmark
2. Enter ID (teacher-01, teacher-02, etc.)
3. Click "Start recording"
4. Select screen, click "Share"
5. Minimize Chrome
6. At end of day: Stop recording
7. Delete files from Downloads folder

---

## ✅ DONE!

**System is ready!**

**Daily routine:**
- Admin: Start server in morning
- Teachers: Click bookmark, start recording
- Teachers: Delete local files at end of day
- Admin: Check recordings on external HDD

---

## 🔧 Quick Troubleshooting

**Can't connect from Chromebook?**
- Check admin laptop server is running
- Check both on same Wi-Fi
- Check IP address is correct

**Upload fails?**
- Check passwords match in both files
- Restart server

**External drive error?**
- Check drive is plugged in
- Check drive letter in start-admin-server.bat

---

## 📞 Need Help?

Read these guides:
1. `SIMPLE_DEPLOYMENT.md` - Detailed instructions
2. `PASSWORD_SETUP_EXPLAINED.txt` - Password setup help
3. `TEACHER_TRAINING_GUIDE.md` - For teachers

---

**That's it! Simple deployment in 10 steps.** 🎉

