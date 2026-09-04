# 🌐 ngrok Setup Guide - Test from Anywhere!

## What is ngrok?

ngrok creates a secure tunnel from the internet to your local server. This means:
- ✅ Test from anywhere (not just same Wi-Fi)
- ✅ No need to configure routers/firewalls
- ✅ Get a public HTTPS URL automatically
- ✅ Perfect for testing from remote Chromebooks

---

## 📥 Step 1: Install ngrok

### Method A: Download (Easiest)

1. **Go to:** https://ngrok.com/download
2. **Download** the Windows version (ZIP file)
3. **Extract** the ZIP to a folder (e.g., `C:\ngrok`)
4. **Add to PATH** (optional but recommended):
   - Right-click "This PC" → Properties → Advanced System Settings
   - Environment Variables → System Variables → Path → Edit
   - Add: `C:\ngrok`

### Method B: Using Chocolatey (if you have it)

```cmd
choco install ngrok
```

### Method C: Using Scoop (if you have it)

```cmd
scoop install ngrok
```

---

## 🔑 Step 2: Get ngrok Auth Token

1. **Sign up free:** https://dashboard.ngrok.com/signup
2. **Get your token:** https://dashboard.ngrok.com/get-started/your-authtoken
3. **Copy** the token (looks like: `2abc...xyz`)

---

## 🛠️ Step 3: Configure ngrok

Open CMD and run:

```cmd
ngrok config add-authtoken YOUR_TOKEN_HERE
```

Example:
```cmd
ngrok config add-authtoken 2abcXYZ123_YOUR_ACTUAL_TOKEN_HERE
```

You should see:
```
Authtoken saved to configuration file: C:\Users\DELL\.ngrok2\ngrok.yml
```

---

## 🚀 Step 4: Start Your Server + ngrok

### Terminal 1: Start Your Server

```cmd
cd C:\Users\DELL\Desktop\chromebook-recorder
npm start
```

Wait until you see:
```
✅ Academy Recorder Server is running!
🌐 Open this URL on your Chromebook:
   https://<LAPTOP-IP>:3443
```

**Keep this window open!**

---

### Terminal 2: Start ngrok Tunnel

Open a **NEW** CMD window:

```cmd
ngrok http 3443
```

You should see something like this:

```
ngrok                                                                    

Session Status                online
Account                       your-email@gmail.com
Version                       3.x.x
Region                        United States (us)
Latency                       45ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123xyz.ngrok-free.app -> https://localhost:3443

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

---

## 🌍 Step 5: Access from Anywhere!

**Copy the HTTPS URL** from ngrok output:
```
https://abc123xyz.ngrok-free.app
```

**Open this URL** on ANY device with internet:
- Chromebook at home
- Phone
- Another laptop
- Anywhere in the world!

---

## ⚠️ Important Notes

### First Time Access Warning

When you open the ngrok URL, you'll see:

```
ngrok - Warning

You are about to visit: https://abc123xyz.ngrok-free.app
Click "Visit Site" to continue
```

**This is normal!** Click **"Visit Site"** to proceed.

### Free Plan Limitations

- ✅ 1 tunnel at a time
- ✅ Unlimited requests
- ⚠️ URL changes every time you restart ngrok
- ⚠️ Shows ngrok warning page on first visit

### Paid Plan Benefits ($8/month)

- Custom subdomain (e.g., `academy-recorder.ngrok.app`)
- No warning page
- More simultaneous tunnels

---

## 🔄 Complete Workflow

### Every Time You Want to Test:

1. **Start Server:**
   ```cmd
   cd C:\Users\DELL\Desktop\chromebook-recorder
   npm start
   ```

2. **Start ngrok (in new CMD window):**
   ```cmd
   ngrok http 3443
   ```

3. **Copy the HTTPS URL** from ngrok output

4. **Open URL on Chromebook**

5. **Click "Visit Site"** on ngrok warning

6. **Start recording!**

---

## 🛑 How to Stop

1. **Stop ngrok:** Press `Ctrl + C` in ngrok window
2. **Stop server:** Press `Ctrl + C` in server window

---

## 🔍 Monitor Traffic (Advanced)

ngrok provides a web interface to see all requests:

**Open in browser:** http://127.0.0.1:4040

You'll see:
- All HTTP requests
- Request/response details
- Upload sizes
- Timing information
- Errors

**Perfect for debugging!**

---

## 🎯 Quick Command Reference

```cmd
# Configure ngrok (one time only)
ngrok config add-authtoken YOUR_TOKEN

# Start tunnel to port 3443
ngrok http 3443

# Start with custom subdomain (paid plan only)
ngrok http 3443 --domain=academy-recorder.ngrok.app

# Start with specific region
ngrok http 3443 --region=us

# View all tunnels
ngrok tunnels
```

---

## 🐛 Troubleshooting

### "command not found: ngrok"
**Solution:** 
- Make sure ngrok.exe is in your PATH
- Or run with full path: `C:\ngrok\ngrok.exe http 3443`

### "ERR_NGROK_108: tunnel not found"
**Solution:**
- Make sure your server is running FIRST
- Check that you're using the correct port (3443)

### "Invalid authtoken"
**Solution:**
- Get fresh token from https://dashboard.ngrok.com/
- Run: `ngrok config add-authtoken NEW_TOKEN`

### "Too many connections"
**Solution:**
- Free plan has limits
- Restart ngrok: `Ctrl+C` then `ngrok http 3443` again

### SSL certificate errors
**Solution:**
- ngrok provides valid HTTPS automatically
- No need for self-signed certificates!
- Server still needs certs for local HTTPS

---

## 🆚 ngrok vs Local Network

| Feature | Local Network (Wi-Fi) | ngrok Tunnel |
|---------|----------------------|--------------|
| **Setup** | Find IP, certificates | Just run ngrok |
| **Access** | Same network only | Anywhere on internet |
| **Speed** | Faster (direct) | Slower (routed through ngrok) |
| **Security** | Private network | Public URL (use with caution) |
| **Firewall** | Need to configure | No configuration needed |
| **SSL** | Self-signed cert | Valid SSL included |
| **Best For** | Production deployment | Testing & development |

---

## 🔒 Security Best Practices

When using ngrok:

1. **Don't share the URL publicly** - Anyone can access it
2. **Add authentication** if testing with sensitive data
3. **Stop ngrok when done** - Don't leave it running
4. **Use new URL each session** (free plan does this automatically)
5. **Monitor the web interface** (http://localhost:4040) for suspicious activity

---

## 💡 Pro Tips

1. **Keep both windows visible** so you can monitor logs
2. **ngrok URL changes** every restart - send new URL to testers each time
3. **Web interface** (localhost:4040) is great for debugging uploads
4. **Test locally first** before using ngrok (faster iteration)
5. **Paid plan** worth it if testing frequently (fixed URL)

---

## 📱 Testing Checklist with ngrok

- [ ] Server running on localhost:3443
- [ ] ngrok tunnel active
- [ ] Copied HTTPS URL from ngrok
- [ ] Opened URL on Chromebook
- [ ] Clicked "Visit Site" on ngrok warning
- [ ] Entered device ID
- [ ] Started recording
- [ ] Verified chunks uploading (check ngrok web interface)
- [ ] Stopped recording
- [ ] Checked files saved in storage folder

---

## 🎬 Example Session

```cmd
# Terminal 1
C:\Users\DELL\Desktop\chromebook-recorder> npm start
✅ Academy Recorder Server is running!

# Terminal 2
C:\Users\DELL> ngrok http 3443

Session Status                online
Forwarding                    https://abc-123-xyz.ngrok-free.app -> https://localhost:3443

# On Chromebook Chrome:
# 1. Go to: https://abc-123-xyz.ngrok-free.app
# 2. Click "Visit Site"
# 3. Enter "academy-01"
# 4. Start Recording
# 5. Success! 🎉
```

---

**You're now ready to test from anywhere! 🚀**
