# Academy Chromebook Recorder — MVP

## What it does
- Chromebook user opens the app and presses **Start recording**.
- Chrome asks which screen/window/tab to share.
- Video is sent to the laptop every 5 seconds.
- The app automatically starts a new `.webm` file every 30 minutes.
- Files are stored under `storage/<device>/<date>/`.
- The full recording is not intentionally saved on Chromebook storage; only browser memory/network buffers are used.

## Laptop requirements
- Windows 10/11
- Node.js LTS
- Laptop and Chromebook on the same Wi-Fi/LAN
- Git for Windows/OpenSSL to create the test HTTPS certificate

## Setup
1. Install Node.js LTS on the laptop.
2. Find laptop IPv4 address using `ipconfig` (example: `192.168.1.20`).
3. Run `setup-certificate.bat` and enter that IPv4 address.
4. Run `start-server.bat`.
5. Allow Windows Firewall access for Node.js on Private networks.
6. On Chromebook, open `https://LAPTOP-IP:3443`, e.g. `https://192.168.1.20:3443`.
7. Because this MVP uses a self-signed certificate, Chrome will show a privacy warning. Choose Advanced → Proceed for testing.
8. Enter `academy-01`, press Start, select the entire screen, and allow microphone access.

## Storage on another drive
Set an environment variable before starting:

```bat
set STORAGE_ROOT=E:\AcademyRecordings
npm start
```

You can edit `start-server.bat` and add the `set STORAGE_ROOT=...` line before `npm start`.

## Important limitations
- Browser security requires the user to press Start and select a screen.
- Closing the tab, signing out, sleep, power loss, or Wi-Fi loss can interrupt recording.
- Failed chunks are retried while the page remains open, but this MVP does not persist a large offline queue to local disk.
- Test playback and segment boundaries before academy deployment.
- Production should use a trusted HTTPS certificate, authentication, device registration, server monitoring, disk alerts, backups, and a more robust resumable upload protocol.
