# 📦 Git Usage Guide

## ✅ What's Included in Version Control

These files ARE tracked in Git:

```
✅ Source Code
   - server.js
   - public/app.js
   - public/index.html
   - public/styles.css
   - public/admin.html

✅ Configuration
   - package.json
   - .gitignore

✅ Scripts
   - start-admin-server.bat
   - setup-certificate.bat
   - install-auto-start.bat
   - backup-recordings.bat
   - open-recording-app.bat

✅ Documentation
   - README.md
   - All *.md files
   - All *.txt files
```

---

## ❌ What's Excluded from Version Control

These files are NOT tracked in Git (in `.gitignore`):

```
❌ Dependencies
   - node_modules/         (installed via npm install)
   - package-lock.json     (can be regenerated)

❌ Generated Files
   - certs/*.pem          (generated via setup-certificate.bat)
   - storage/             (recordings - too large!)
   - temp/                (temporary upload files)

❌ Environment-Specific
   - .env files           (contain passwords/secrets)

❌ OS-Specific
   - .DS_Store           (Mac)
   - Thumbs.db           (Windows)
   - .vscode/            (VS Code settings)
```

---

## 🚀 How to Use Git

### Initial Setup (One Time)

```bash
cd C:\chromebook-recorder

# Initialize Git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - Academy Recording System"
```

---

### Push to GitHub (Optional)

```bash
# Create repository on GitHub first, then:
git remote add origin https://github.com/yourusername/chromebook-recorder.git
git branch -M main
git push -u origin main
```

---

### Daily Workflow

```bash
# Check what changed
git status

# Add changed files
git add server.js public/app.js

# Commit changes
git commit -m "Fix: Updated upload authentication"

# Push to remote (if using GitHub)
git push
```

---

## 🔐 Security Note

**NEVER commit these:**
- ❌ Actual passwords
- ❌ SSL certificates
- ❌ Recording files
- ❌ Personal data

**Use environment variables for passwords:**

Instead of hardcoding in files:
```javascript
const UPLOAD_PASSWORD = 'MyActualPassword123';  // ❌ DON'T DO THIS
```

Use environment variables:
```javascript
const UPLOAD_PASSWORD = process.env.UPLOAD_PASSWORD || 'default';  // ✅ DO THIS
```

---

## 📋 Deployment from Git

When deploying to a new admin laptop:

```bash
# 1. Clone repository
git clone https://github.com/yourusername/chromebook-recorder.git
cd chromebook-recorder

# 2. Install dependencies
npm install

# 3. Generate certificates (NOT in Git)
setup-certificate.bat

# 4. Configure passwords (NOT in Git)
# Edit start-admin-server.bat and public/app.js

# 5. Start server
start-admin-server.bat
```

---

## 🎯 Why This Setup?

**node_modules/**: Large (60+ MB), can be reinstalled
**certs/**: Security-sensitive, generated per server
**storage/**: Recordings are huge (GB), not code
**temp/**: Temporary files, no need to track

This keeps your Git repository:
- ✅ Small (< 1 MB)
- ✅ Fast to clone
- ✅ Secure (no secrets)
- ✅ Clean (only source code)

---

## ✅ Checklist

Before committing:
- [ ] No passwords in code
- [ ] No `.pem` files
- [ ] No `node_modules/`
- [ ] No recording files
- [ ] Only source code and docs

---

**Your `.gitignore` is now set up correctly!** ✅

