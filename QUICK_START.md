# ⚡ Quick Start Guide - How to Start CMD and Run the Server

## 🪟 Method 1: Using Windows Search (Easiest)

1. **Press** `Windows Key` + `R` on your keyboard
2. **Type:** `cmd`
3. **Press** `Enter`
4. **Navigate to project:**
   ```cmd
   cd C:\Users\DELL\Desktop\chromebook-recorder
   ```
5. **Run the server:**
   ```cmd
   start-server.bat
   ```

---

## 🪟 Method 2: Using File Explorer

1. **Open File Explorer** (Windows Key + E)
2. **Navigate to:** `C:\Users\DELL\Desktop\chromebook-recorder`
3. **Click** the address bar at the top
4. **Type:** `cmd`
5. **Press** `Enter`
   - This opens CMD directly in your project folder!
6. **Run the server:**
   ```cmd
   start-server.bat
   ```

---

## 🪟 Method 3: Right-Click in Folder (Windows 11)

1. **Open File Explorer**
2. **Go to:** `C:\Users\DELL\Desktop\chromebook-recorder`
3. **Right-click** in the empty space
4. **Select:** "Open in Terminal" or "Open in Windows Terminal"
5. **Run:**
   ```cmd
   start-server.bat
   ```

---

## 🪟 Method 4: Using the Start Menu

1. **Click** the Windows Start button
2. **Type:** `cmd` or `command prompt`
3. **Click** on "Command Prompt" app
4. **Change directory:**
   ```cmd
   cd C:\Users\DELL\Desktop\chromebook-recorder
   ```
5. **Start server:**
   ```cmd
   start-server.bat
   ```

---

## 🎯 What Should Happen

After running `start-server.bat`, you should see:

```
✅ Academy Recorder Server is running!
📁 Videos will be stored in: C:\Users\DELL\Desktop\chromebook-recorder\storage
🌐 Open this URL on your Chromebook:
   https://192.168.1.XX:3443

💡 Find your laptop IP with: ipconfig
⚠️  You'll need to accept the security warning in Chrome (self-signed certificate)
```

---

## 🔧 First Time Setup

### If you haven't set up the certificate yet:

1. **Open CMD** in the project folder (use any method above)

2. **Find your IP address:**
   ```cmd
   ipconfig
   ```
   Look for "IPv4 Address" (example: `192.168.1.20`)

3. **Create certificate:**
   ```cmd
   setup-certificate.bat
   ```
   Enter your IP when prompted

4. **Start the server:**
   ```cmd
   start-server.bat
   ```

---

## 📱 Access from Chromebook

Once the server is running:

1. **Open Chrome** on your Chromebook
2. **Go to:** `https://YOUR-LAPTOP-IP:3443`
   - Replace `YOUR-LAPTOP-IP` with the IP from `ipconfig`
   - Example: `https://192.168.1.20:3443`
3. **Click** "Advanced" when you see the security warning
4. **Click** "Proceed to [IP] (unsafe)"
5. **Start recording!**

---

## 🛑 How to Stop the Server

**In the CMD window:**
- Press `Ctrl` + `C`
- Or simply close the CMD window

---

## 🔥 Quick Commands Reference

| Task | Command |
|------|---------|
| Navigate to project | `cd C:\Users\DELL\Desktop\chromebook-recorder` |
| Check if Node.js installed | `node --version` |
| Find your IP address | `ipconfig` |
| Install dependencies | `npm install` |
| Create certificate | `setup-certificate.bat` |
| Start server | `start-server.bat` |
| Start server (alternative) | `npm start` |
| Check server health | `curl -k https://localhost:3443/api/health` |
| List storage files | `dir storage /s` |
| Stop server | `Ctrl + C` |

---

## ❓ Troubleshooting

### Problem: "node is not recognized"
**Solution:** Install Node.js from https://nodejs.org/

### Problem: "openssl is not recognized"
**Solution:** Install Git for Windows from https://git-scm.com/

### Problem: "Port 3443 is already in use"
**Solution:** 
- Close the other CMD window running the server
- Or change the port: `set PORT=3444` then `npm start`

### Problem: Can't access from Chromebook
**Solution:**
- Verify both devices on same Wi-Fi
- Check Windows Firewall settings
- Make sure you're using HTTPS (not HTTP)

---

## 💡 Pro Tips

1. **Keep the CMD window open** while using the app
2. **Don't close the CMD window** or the server will stop
3. **You can minimize** the CMD window to keep it running in the background
4. **Watch the console** for real-time upload logs
5. **Each recording session** creates a new folder in `storage\`

---

**You're all set! 🚀**
