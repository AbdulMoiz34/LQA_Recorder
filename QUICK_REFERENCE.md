# ⚡ QUICK REFERENCE CARD

## 📁 Project Structure

```
chromebook-recorder/
├── server.js              ← Main server
├── package.json           ← Dependencies
├── .gitignore            ← Git ignore rules
│
├── public/               ← Client files
│   ├── app.js           ← Recording logic
│   ├── index.html       ← UI
│   ├── styles.css       ← Styling
│   └── admin.html       ← Dashboard
│
├── certs/               ← SSL certificates (generated)
│   ├── server-key.pem  
│   └── server-cert.pem
│
├── storage/             ← Recordings (excluded from git)
├── temp/                ← Temporary files (excluded from git)
└── node_modules/        ← Dependencies (excluded from git)
```

---

## 🚀 Commands

### Setup (One Time)
```bash
npm install
setup-certificate.bat
```

### Start Server
```bash
start-admin-server.bat
```

### Stop Server
```
Press Ctrl+C in CMD window
```

---

## 🔐 Configuration

### Passwords (Must Match!)
```
File 1: start-admin-server.bat
    set UPLOAD_PASSWORD=YourPassword

File 2: public/app.js (line 2)
    const UPLOAD_PASSWORD = 'YourPassword';
```

### Storage
```
start-admin-server.bat
    set STORAGE_ROOT=E:\AcademyRecordings
```

---

## 🌐 URLs

### Recording Page
```
https://192.168.1.100:3443
```

### Admin Dashboard
```
https://192.168.1.100:3443/admin.html
```

### Health Check
```
https://192.168.1.100:3443/api/health
```

---

## 📱 Teacher Quick Guide

**Morning:**
1. Click bookmark
2. Enter teacher ID
3. Start recording
4. Minimize Chrome

**Evening:**
1. Stop recording
2. Delete files from Downloads
3. Close Chrome

---

## 🔧 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't connect | Check server running, same Wi-Fi |
| Upload fails | Check passwords match |
| Storage error | Check external HDD plugged in |
| Port in use | Close other server, restart |

---

## 📞 Admin Contacts

**Server Issues:** [Admin Phone]  
**Technical Support:** [Developer Phone]  
**Emergency:** [Manager Phone]

---

## 📊 Daily Checklist

**Admin Morning:**
- [ ] External HDD connected
- [ ] Start server
- [ ] Check dashboard

**Admin Evening:**
- [ ] Verify recordings uploaded
- [ ] Check storage space
- [ ] Server can stay running

---

## 🗂️ File Locations

**Recordings:**
```
E:\AcademyRecordings\teacher-ID\YYYY-MM-DD\
```

**Logs:**
```
Server console (CMD window)
```

**Configuration:**
```
start-admin-server.bat
public/app.js
```

---

## 🎯 Key Numbers

- **Port:** 3443
- **Segment Length:** 30 minutes
- **File Size:** ~400 MB per segment
- **Max Users:** 10-15 concurrent
- **Storage:** 1TB = ~14 days

---

## ✅ Success Indicators

- ✅ Server shows "Server is running!"
- ✅ Dashboard shows green status
- ✅ Files appear in storage folder
- ✅ Teachers can record without issues
- ✅ Storage < 80% used

---

## 📚 Documentation

**Start Here:**
- `START_HERE.md` - 10 steps to deploy

**For Admin:**
- `SIMPLE_DEPLOYMENT.md` - Detailed setup
- `GIT_USAGE.md` - Version control

**For Teachers:**
- `TEACHER_TRAINING_GUIDE.md` - How to use

**Technical:**
- `README.md` - Project overview
- `TESTING_GUIDE.md` - Testing

---

**Print this card and keep it handy!** 📋

