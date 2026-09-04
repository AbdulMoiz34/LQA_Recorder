# 🚀 SIMPLE DEPLOYMENT GUIDE

## 📦 STEP 1: COPY PROJECT TO ADMIN LAPTOP

### On Your Development PC:

1. Copy the entire `chromebook-recorder` folder to USB drive
2. Eject USB drive

### On Admin Laptop:

1. Plug in USB drive
2. Copy folder to: `C:\chromebook-recorder`
3. Eject USB drive

---

## 🔐 STEP 2: SET PASSWORD (IMPORTANT!)

You need to set the SAME password in TWO files:

### File 1: `start-admin-server.bat`

Open with Notepad, find this line:
```batch
set UPLOAD_PASSWORD=academy2024
```

Change `academy2024` to your password:
```batch
set UPLOAD_PASSWORD=MySecret2024!
```

### File 2: `public\app.js`

Open with Notepad, find line 2:
```javascript
const UPLOAD_PASSWORD = 'CHANGE_ME_IN_PRODUCTION';
```

Change to the SAME password:
```javascript
const UPLOAD_PASSWORD = 'MySecret2024!';
```

**⚠️ IMPORTANT: Both passwords MUST be identical!**

---

## 🖥️ STEP 3: SETUP ADMIN LAPTOP

### 3.1 Install Node.js

1. Download: https://nodejs.org/ (choose LTS version)
2. Install with default settings
3. Restart computer

### 3.2 Install Git for Windows

1. Download: https://git-scm.com/download/win
2. Install with default settings

### 3.3 Connect External HDD

1. Plug in 1TB USB hard drive
2. Note the drive letter (e.g., `E:\`)
3. Open the drive, create folder: `AcademyRecordings`

### 3.4 Configure Storage Path

Edit `start-admin-server.bat`:
```batch
set STORAGE_ROOT=E:\AcademyRecordings
```

Change `E:\` if your drive letter is different.

### 3.5 Find Admin Laptop IP Address

1. Open CMD (press Win+R, type `cmd`)
2. Type: `ipconfig`
3. Look for "IPv4 Address" under Wi-Fi adapter
4. Write it down (example: `192.168.1.100`)

### 3.6 Generate SSL Certificate

1. Open CMD in project folder:
   ```cmd
   cd C:\chromebook-recorder
   ```

2. Run:
   ```cmd
   setup-certificate.bat
   ```

3. Enter your IP address when asked (from step 3.5)

### 3.7 Install Dependencies

In same CMD window:
```cmd
npm install
```

Wait for installation to complete.

### 3.8 Start Server

```cmd
start-admin-server.bat
```

You should see:
```
✅ Academy Recorder Server is running!
📁 Videos will be stored in: E:\AcademyRecordings
🌐 Open this URL on your Chromebook:
   https://192.168.1.100:3443
```

**Keep this window open!** Server is running.

### 3.9 Allow Firewall

Windows will ask: "Allow Node.js to access network?"
- ✅ Check "Private networks"
- Click "Allow access"

### 3.10 Test Locally

Open Chrome on admin laptop:
```
https://localhost:3443
```

You should see the recording page.

---

## 📱 STEP 4: SETUP CHROMEBOOKS (Each Teacher)

### 4.1 Open Recording Page

On teacher's Chromebook:

1. Open Chrome
2. Type in address bar:
   ```
   https://192.168.1.100:3443
   ```
   (Use YOUR admin laptop IP from Step 3.5)

3. You'll see: "Your connection is not private"
   - Click **Advanced**
   - Click **Proceed to 192.168.1.100 (unsafe)**

4. You should see the recording page!

### 4.2 Create Bookmark

1. Press **Ctrl+D** (bookmark this page)
2. Name it: "Academy Recording"
3. Save to Bookmarks Bar

### 4.3 Test Recording

1. Enter device ID: `teacher-01` (or assign unique ID per teacher)
2. Click "Start recording"
3. Select screen to record
4. Click "Share"
5. Watch status change to "Recording..."
6. Wait 1 minute
7. Click "Stop recording"

### 4.4 Verify Upload

On admin laptop:
1. Open: `E:\AcademyRecordings\teacher-01\`
2. Find today's folder
3. You should see a `.webm` file
4. Double-click to play it

**If file is there:** ✅ SUCCESS!

---

## 📋 DAILY USAGE

### Teacher's Morning Routine:

1. Turn on Chromebook
2. Click "Academy Recording" bookmark
3. Enter your teacher ID (e.g., `teacher-01`)
4. Click "Start recording"
5. Select screen
6. Click "Share"
7. Minimize Chrome (keep it open!)
8. Start teaching

### Teacher's Evening Routine:

1. Open Chrome
2. Go to recording tab
3. Click "Stop recording"
4. Go to Downloads folder
5. **Delete all recording files** (they're already on server!)
6. Close Chrome
7. Go home

### Admin's Daily Tasks:

**Morning:**
1. Start admin laptop
2. Make sure external HDD is connected
3. Run: `start-admin-server.bat`
4. Leave it running all day

**Evening:**
1. Open: `E:\AcademyRecordings`
2. Check today's recordings are there
3. Server can keep running (or press Ctrl+C to stop)

---

## 🔧 TROUBLESHOOTING

### Problem: "Cannot connect to server"

**Solution:**
1. Check admin laptop is ON
2. Check server is running (CMD window open)
3. Check both on same Wi-Fi
4. Try ping from Chromebook:
   ```
   Open Chrome → press F12 → Console tab → type:
   ping 192.168.1.100
   ```

### Problem: "Unauthorized upload"

**Solution:**
Check passwords match in BOTH files:
- `start-admin-server.bat`
- `public/app.js`

Restart server after changing.

### Problem: "Storage not writable"

**Solution:**
1. Check external HDD is plugged in
2. Check drive letter in `start-admin-server.bat`
3. Open drive in File Explorer to verify it works

### Problem: Files not uploading

**Solution:**
1. Check server console for errors
2. Files are saved in Downloads folder (safe!)
3. Can manually copy them to `E:\AcademyRecordings` later

---

## 📞 SUPPORT

**Admin Contact:** [Your phone/email]

**Common Questions:**

**Q: Do I need to keep Chrome open all day?**  
A: Yes! Minimize it, but don't close the tab.

**Q: Where do files go?**  
A: Admin server → `E:\AcademyRecordings\teacher-XX\date\`

**Q: Can I use my Chromebook for other things while recording?**  
A: Yes! Recording runs in background.

**Q: What if my internet disconnects?**  
A: Files save locally to Downloads folder. They'll upload when internet returns.

---

## ✅ DEPLOYMENT CHECKLIST

### Admin Laptop:
- [ ] Node.js installed
- [ ] Git for Windows installed  
- [ ] External HDD connected
- [ ] Password set in `start-admin-server.bat`
- [ ] Storage path configured
- [ ] IP address noted
- [ ] SSL certificate generated
- [ ] Dependencies installed (`npm install`)
- [ ] Server tested locally
- [ ] Firewall allowed Node.js

### Each Chromebook:
- [ ] Opened recording page
- [ ] Accepted certificate warning
- [ ] Created bookmark
- [ ] Assigned device ID
- [ ] Test recording completed
- [ ] File appeared on server
- [ ] Teacher knows how to use it

---

## 🎉 DONE!

Your system is ready to use!

**Remember:**
1. Keep server running on admin laptop
2. Teachers bookmark the page
3. Teachers delete local files daily
4. Admin checks recordings daily

**Simple as that!** 🚀

