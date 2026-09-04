# 🧪 Complete Testing Guide for Academy Recorder

## 📋 Pre-Testing Checklist

### System Requirements
- ✅ Windows 10/11 laptop
- ✅ Node.js LTS installed (check: `node --version`)
- ✅ Git for Windows (for OpenSSL)
- ✅ Chromebook on the same Wi-Fi network as laptop
- ✅ Both devices connected to same network

---

## 🚀 Step-by-Step Testing Process

### Step 1: Find Your Laptop's IP Address

Open **Command Prompt** (CMD) on your laptop:

```cmd
ipconfig
```

**Look for:** "IPv4 Address" under your active network adapter  
**Example:** `192.168.1.20`

📝 **Write down this IP address!**

---

### Step 2: Generate HTTPS Certificate

1. Open **Command Prompt** in the project folder:
   ```cmd
   cd C:\Users\DELL\Desktop\chromebook-recorder
   ```

2. Run the certificate setup:
   ```cmd
   setup-certificate.bat
   ```

3. When prompted, enter your laptop's IP address (from Step 1)
   ```
   Enter this laptop's LAN IPv4 address: 192.168.1.20
   ```

4. You should see: `Certificate created.`

---

### Step 3: Install Dependencies

```cmd
npm install
```

Expected output:
```
added 62 packages, and audited 63 packages in 3s
```

---

### Step 4: Start the Server

**Option A:** Use the batch file:
```cmd
start-server.bat
```

**Option B:** Use npm directly:
```cmd
npm start
```

**Expected Console Output:**
```
✅ Academy Recorder Server is running!
📁 Videos will be stored in: C:\Users\DELL\Desktop\chromebook-recorder\storage
🌐 Open this URL on your Chromebook:
   https://192.168.1.20:3443

💡 Find your laptop IP with: ipconfig
⚠️  You'll need to accept the security warning in Chrome (self-signed certificate)
```

---

### Step 5: Test Server Health (Optional)

Open a new Command Prompt window:

```cmd
curl -k https://localhost:3443/api/health
```

**Expected Response:**
```json
{"ok":true,"storage":"C:\\Users\\DELL\\Desktop\\chromebook-recorder\\storage","time":"2026-08-14T..."}
```

---

### Step 6: Access from Chromebook

1. Open Chrome browser on your Chromebook
2. Navigate to: `https://<YOUR-LAPTOP-IP>:3443`
   - Example: `https://192.168.1.20:3443`

3. **You WILL see a security warning:**
   ```
   Your connection is not private
   NET::ERR_CERT_AUTHORITY_INVALID
   ```

4. **To proceed:**
   - Click **"Advanced"**
   - Click **"Proceed to 192.168.1.20 (unsafe)"**

5. You should now see the **Academy Recorder** interface!

---

## 🎬 Testing Recording Functionality

### Test Case 1: Basic Screen Recording (No Audio)

1. **Enter Device ID:** Type `academy-01` in the input field
2. **Uncheck:** "Record microphone" checkbox
3. **Click:** "Start recording" button
4. **Select:** "Entire screen" or "This window"
5. **Observe:**
   - Status changes to "Recording and uploading"
   - Elapsed time starts counting
   - Chunks counter increases every 5 seconds

**✅ Success Criteria:**
- No errors appear
- Chunks are being uploaded (counter increases)
- Timer is running

---

### Test Case 2: Screen + Microphone Recording

1. **Enter Device ID:** `academy-02`
2. **Keep checked:** "Record microphone"
3. **Click:** "Start recording"
4. **When prompted:**
   - Allow microphone access
   - Select screen/window
5. **Speak into microphone** and verify status message

**✅ Success Criteria:**
- Status says "Recording microphone and call audio" OR
- Status says "Only microphone audio detected"
- Recording proceeds without errors

---

### Test Case 3: Tab Audio Capture (Advanced)

1. Open a **YouTube video** or **Google Meet call** in another tab
2. Start the recorder
3. **Important:** When selecting screen:
   - Choose the **Chrome tab** containing the media
   - **Enable:** "Share tab audio" checkbox
4. **Click Share**

**✅ Success Criteria:**
- Status mentions "call audio"
- Both video and audio are being recorded

---

### Test Case 4: Stop Recording

1. Click **"Stop recording"** button
2. **Observe:**
   - Status changes to "Stopped"
   - All buttons return to initial state
   - Pending uploads complete

**✅ Success Criteria:**
- Recording stops cleanly
- No console errors
- Pending counter reaches 0

---

### Test Case 5: Verify File Storage

1. **Navigate to storage folder:**
   ```cmd
   cd storage
   dir /s
   ```

2. **Expected structure:**
   ```
   storage\
   └── academy-01\
       └── 2026-08-14\
           └── 2026-08-14T12-30-45-123Z__30min.webm
   ```

3. **Play the video file:**
   - Right-click the `.webm` file
   - Open with VLC Media Player or Chrome

**✅ Success Criteria:**
- File exists
- File size > 0 bytes
- Video plays correctly

---

## 🔥 Stress Testing

### Test Case 6: Long Recording (30+ minutes)

1. Start recording
2. Let it run for **35 minutes**
3. **Observe:**
   - New segment file created at 30-minute mark
   - Recording continues seamlessly
   - Clock resets to 00:00:00

**✅ Success Criteria:**
- Two separate `.webm` files created
- No interruption in recording
- Both files are playable

---

### Test Case 7: Network Interruption Simulation

1. Start recording
2. Wait for 5-10 chunks to upload
3. **Disconnect Wi-Fi** for 10 seconds
4. **Reconnect Wi-Fi**
5. **Observe:**
   - Status may show "Upload failed — check Wi-Fi"
   - Pending uploads counter increases
   - System retries failed chunks

**✅ Success Criteria:**
- Chunks eventually upload after reconnection
- Recording continues
- Pending counter decreases

---

### Test Case 8: Invalid Device ID

1. Try these invalid IDs:
   - `academy 01` (space)
   - `academy@01` (special char)
   - `a` (too short)
   - (empty)

**✅ Success Criteria:**
- Alert message appears: "Enter a simple ID, for example academy-01"
- Recording does NOT start

---

### Test Case 9: Multiple Concurrent Recordings

1. Open the app in **two different Chromebook tabs**
2. Use different device IDs: `academy-01` and `academy-02`
3. Start both recordings

**✅ Success Criteria:**
- Both recordings work simultaneously
- Separate storage folders created
- No conflicts or errors

---

## 🐛 Testing Known Edge Cases

### Test Case 10: Browser Tab Close During Recording

1. Start recording
2. Try to close the tab
3. **Observe:** Browser shows warning:
   ```
   Leave site? Changes you made may not be saved.
   ```

**✅ Success Criteria:**
- Warning appears
- User can cancel and keep recording

---

### Test Case 11: Server Restart During Recording

1. Start recording on Chromebook
2. **Stop the server** (Ctrl+C in CMD)
3. **Observe Chromebook:**
   - Status changes to "Upload failed — check Wi-Fi"
   - Pending uploads accumulate
4. **Restart server:** `npm start`
5. **Observe:** Pending chunks start uploading

**✅ Success Criteria:**
- App handles server downtime gracefully
- Chunks upload once server is back

---

### Test Case 12: Port Already in Use

1. Start the server: `npm start`
2. Open another CMD window
3. Try starting again: `npm start`

**✅ Success Criteria:**
- Clear error message:
  ```
  ❌ Port 3443 is already in use. Please close the other application or set a different PORT.
  ```

---

## 📊 Verification Checklist

After completing tests, verify:

- [ ] Server starts without errors
- [ ] Chromebook can access the page over HTTPS
- [ ] Screen recording captures video
- [ ] Microphone audio is recorded (when enabled)
- [ ] Tab/system audio is captured (when shared)
- [ ] Chunks upload every 5 seconds
- [ ] Files are saved in correct folder structure
- [ ] Video files are playable
- [ ] 30-minute segments work correctly
- [ ] Stop button works cleanly
- [ ] Network interruptions are handled
- [ ] Invalid inputs are rejected

---

## 🔍 Debugging Tips

### Problem: "Cannot access site"
**Solution:**
- Verify laptop IP with `ipconfig`
- Check Windows Firewall (allow Node.js on private networks)
- Ensure both devices on same Wi-Fi

### Problem: "Permission denied" for screen capture
**Solution:**
- Must use HTTPS (check URL starts with `https://`)
- Chrome requires user interaction (can't auto-start)

### Problem: "No audio recorded"
**Solution:**
- When selecting screen, choose the **Chrome tab** with media
- **Must check** "Share tab audio"
- Alternatively, enable microphone recording

### Problem: "Chunks not uploading"
**Solution:**
- Check server console for errors
- Verify network connection
- Check `storage` folder permissions

### Problem: "Certificate errors"
**Solution:**
- Re-run `setup-certificate.bat`
- Ensure you entered correct IP address
- Accept the security warning in Chrome

---

## 📝 Test Results Template

```
TEST DATE: ______________
TESTER: ______________
LAPTOP IP: ______________

| Test Case | Status | Notes |
|-----------|--------|-------|
| Basic Screen Recording | ⬜ Pass / ⬜ Fail | |
| Microphone Recording | ⬜ Pass / ⬜ Fail | |
| Tab Audio Capture | ⬜ Pass / ⬜ Fail | |
| Stop Recording | ⬜ Pass / ⬜ Fail | |
| File Storage | ⬜ Pass / ⬜ Fail | |
| 30-Min Segments | ⬜ Pass / ⬜ Fail | |
| Network Interruption | ⬜ Pass / ⬜ Fail | |
| Invalid Input | ⬜ Pass / ⬜ Fail | |
| Concurrent Recordings | ⬜ Pass / ⬜ Fail | |

OVERALL: ⬜ PASSED / ⬜ FAILED
```

---

## 🎯 Success Metrics

**The project is working correctly if:**
1. ✅ All 12 test cases pass
2. ✅ Video files are playable and contain correct content
3. ✅ Audio (when enabled) is clearly audible
4. ✅ Upload failures recover gracefully
5. ✅ System runs for extended periods without crashes
6. ✅ Multiple devices can record simultaneously

---

## 🚨 When to Report Issues

Report an issue if:
- Server crashes or stops responding
- Video files are corrupted or unplayable
- Audio is missing or distorted
- Chunks fail to upload consistently
- Memory usage grows unbounded
- Browser console shows JavaScript errors

---

**Happy Testing! 🎉**
