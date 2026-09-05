# 💾 How to Change Storage Location

## 🎯 Quick Answer

Edit `start-admin-server.bat` and change this line:

```batch
set STORAGE_ROOT=E:\AcademyRecordings
```

---

## 📝 Step-by-Step Instructions

### Step 1: Open the File

Right-click `start-admin-server.bat` → **Edit** (or open with Notepad)

### Step 2: Find the Line

Look for:
```batch
set STORAGE_ROOT=E:\AcademyRecordings
```

### Step 3: Change It

Replace with your desired location:

**Examples:**

**Different Drive:**
```batch
set STORAGE_ROOT=F:\AcademyRecordings
```

**Different Folder:**
```batch
set STORAGE_ROOT=E:\MyRecordings
```

**Deep Folder Structure:**
```batch
set STORAGE_ROOT=E:\School\Academy\Recordings\2024
```

**Network Drive:**
```batch
set STORAGE_ROOT=\\Server\Share\Recordings
```

**USB Drive (might change letter):**
```batch
set STORAGE_ROOT=G:\Recordings
```

### Step 4: Save the File

Press **Ctrl+S** to save, then close Notepad.

### Step 5: Restart Server

If server is running:
1. Press **Ctrl+C** to stop it
2. Run `start-admin-server.bat` again

---

## 🔍 How to Find Your Drive Letter

### Method 1: File Explorer
1. Open **File Explorer** (Win+E)
2. Look at "This PC"
3. Your drives are listed with letters (C:, D:, E:, F:, etc.)

### Method 2: Disk Management
1. Press **Win+X**
2. Select **Disk Management**
3. All drives and their letters are shown

---

## 📋 Common Storage Locations

### External USB Drive
```batch
set STORAGE_ROOT=E:\AcademyRecordings
set STORAGE_ROOT=F:\Recordings
set STORAGE_ROOT=G:\VideoStorage
```

### Internal Secondary Drive
```batch
set STORAGE_ROOT=D:\Recordings
```

### Network Attached Storage (NAS)
```batch
set STORAGE_ROOT=\\NAS\SharedFolder\Recordings
set STORAGE_ROOT=\\192.168.1.50\Academy\Videos
```

### Cloud Sync Folder (OneDrive, Dropbox, etc.)
```batch
set STORAGE_ROOT=C:\Users\Admin\OneDrive\AcademyRecordings
set STORAGE_ROOT=C:\Users\Admin\Dropbox\Recordings
```

---

## ⚠️ Important Notes

### 1. Folder Will Be Created Automatically

The server creates the folder if it doesn't exist, so just make sure:
- ✅ The DRIVE exists
- ✅ You have write permissions

### 2. Path Must Be Writable

Server checks if it can write to the location. If not, you'll see:
```
❌ Storage is not writable!
```

**Solution:** Check permissions or choose different location.

### 3. Use Backslashes (Windows)

✅ Correct:
```batch
set STORAGE_ROOT=E:\Recordings
```

❌ Wrong:
```batch
set STORAGE_ROOT=E:/Recordings
```

### 4. Spaces in Path

If path has spaces, quotes are handled automatically:

✅ This works:
```batch
set STORAGE_ROOT=E:\My Academy Recordings
```

But to be safe, you can use quotes:
```batch
set STORAGE_ROOT="E:\My Academy Recordings"
```

---

## 🧪 Testing Your New Location

### After changing, test it:

1. **Start server:**
   ```cmd
   start-admin-server.bat
   ```

2. **Check output:**
   ```
   ✅ Storage is writable: E:\YourNewLocation
   ```

3. **Test recording:**
   - Record from Chromebook
   - Check file appears in your new location

4. **Verify path:**
   - Open File Explorer
   - Navigate to your new storage path
   - You should see: `teacher-XX/YYYY-MM-DD/` folders

---

## 🔧 Troubleshooting

### Problem: "Storage drive not accessible"

**Possible causes:**
1. Drive not plugged in
2. Wrong drive letter
3. Folder doesn't exist (parent folder missing)
4. No write permissions

**Solutions:**
1. Check drive is connected in File Explorer
2. Verify drive letter in Disk Management
3. Create parent folders manually
4. Right-click folder → Properties → Security → Give "Full Control"

---

### Problem: "Storage is not writable"

**Check:**
1. Drive not full
2. Not read-only
3. Not write-protected (USB drives have physical switch)
4. User has permissions

**Test permissions:**
```cmd
echo test > E:\test.txt
```

If this fails, you don't have write access.

---

### Problem: Server starts but files don't appear

**Check:**
1. Recordings uploading successfully (check Chromebook status)
2. Looking in correct folder
3. Checking correct date subfolder

**Find files:**
```cmd
dir /s E:\AcademyRecordings\*.webm
```

This shows all .webm files in all subfolders.

---

## 💡 Best Practices

### For Production:

✅ **DO:**
- Use external HDD (separate from system drive)
- Use simple folder names (no special characters)
- Check available space regularly
- Backup to second drive

❌ **DON'T:**
- Don't use C:\ (system drive might fill up)
- Don't use network drive if unreliable
- Don't use USB stick (too small, too slow)
- Don't use cloud sync for live recordings (too slow)

---

## 📊 Storage Requirements

**Planning storage:**

| Recording Length | File Size | 10 Teachers/Day | Storage Needed |
|------------------|-----------|-----------------|----------------|
| 1 hour | ~900 MB | 9 GB/day | 270 GB/month |
| 2 hours | ~1.8 GB | 18 GB/day | 540 GB/month |
| 4 hours | ~3.6 GB | 36 GB/day | 1080 GB/month |
| 8 hours | ~7 GB | 70 GB/day | 2100 GB/month |

**Recommendation:** 
- Minimum: 1TB
- Comfortable: 2TB
- Enterprise: 4TB+

---

## ✅ Quick Checklist

After changing storage location:

- [ ] Edited `start-admin-server.bat`
- [ ] Changed `STORAGE_ROOT=` line
- [ ] Saved the file
- [ ] Restarted server
- [ ] Saw "✅ Storage is writable" message
- [ ] Tested with recording
- [ ] File appeared in new location
- [ ] Updated documentation (if needed)
- [ ] Told admin where recordings are now

---

## 🎉 Done!

Your recordings will now be saved to your new location!

**Remember:** All teachers automatically upload to wherever the server is configured. You don't need to change anything on Chromebooks!

---

**Current Configuration:**

```batch
Storage Location: E:\AcademyRecordings
```

Change this line in `start-admin-server.bat` to update it! 🚀

