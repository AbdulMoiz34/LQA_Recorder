const CONFIG = {
  DEVICE_ID_PATTERN: /^[a-zA-Z0-9_-]{2,40}$/
};

class RecordingApp {
  constructor() {
    this.el = id => document.getElementById(id);
    this.recorder = null;
    this.stream = null;
    this.sessionId = null;
    this.stopping = false;
    this.startTime = null;
    this.clockTimer = null;

    this.init();
  }

  init() {
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      alert('⚠️ HTTPS required. Use: https://<laptop-ip>:3443');
    }

    const saved = localStorage.getItem('deviceId');
    if (saved && CONFIG.DEVICE_ID_PATTERN.test(saved)) {
      this.el('device').value = saved;
    }

    this.el('device').addEventListener('input', () => {
      const id = this.el('device').value.trim();
      if (id && CONFIG.DEVICE_ID_PATTERN.test(id)) {
        localStorage.setItem('deviceId', id);
      }
    });

    this.el('start').addEventListener('click', () => this.startRecording());
    this.el('stop').addEventListener('click', () => this.stopRecording());
    
    window.addEventListener('beforeunload', (e) => {
      if (this.recorder && !this.stopping) {
        e.preventDefault();
        e.returnValue = '';
      }
    });
  }

  setStatus(text) {
    this.el('status').textContent = text;
  }

  updateClock() {
    const seconds = Math.floor((Date.now() - this.startTime) / 1000);
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    this.el('elapsed').textContent = `${h}:${m}:${s}`;
  }

  async uploadVideo(blob) {
    const device = this.el('device').value.trim();
    const formData = new FormData();
    
    formData.append('video', blob, `recording.webm`);
    formData.append('device', device);
    formData.append('session', this.sessionId);
    
    const response = await fetch('/api/upload-video', {
      method: 'POST',
      body: formData
    });
    
    return response.json();
  }

  async startRecording() {
    const device = this.el('device').value.trim();

    if (!CONFIG.DEVICE_ID_PATTERN.test(device)) {
      alert('Enter a valid device ID (e.g., academy-01)');
      return;
    }

    try {
      this.stopping = false;
      this.sessionId = new Date().toISOString().replace(/[:.]/g, '-');
      this.startTime = Date.now();

      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 },
        audio: { systemAudio: 'include' }
      });

      const videoTracks = displayStream.getVideoTracks();
      const audioTracks = displayStream.getAudioTracks();
      let micTracks = [];

      if (this.el('microphone').checked) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true }
          });
          micTracks = micStream.getAudioTracks();
        } catch (e) {
          console.warn('Mic not available:', e);
        }
      }

      const finalTracks = [...videoTracks];

      if (audioTracks.length > 0 || micTracks.length > 0) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContext();
        const destination = audioContext.createMediaStreamDestination();

        if (audioTracks.length > 0) {
          audioContext.createMediaStreamSource(new MediaStream(audioTracks)).connect(destination);
        }
        if (micTracks.length > 0) {
          audioContext.createMediaStreamSource(new MediaStream(micTracks)).connect(destination);
        }

        finalTracks.push(...destination.stream.getAudioTracks());
      }

      this.stream = new MediaStream(finalTracks);

      this.recorder = new RecordRTC(this.stream, {
        type: 'video',
        mimeType: 'video/webm;codecs=vp8,opus',
        videoBitsPerSecond: 2500000
      });

      this.recorder.startRecording();
      this.setStatus('Recording...');

      videoTracks[0].addEventListener('ended', () => this.stopRecording());

      this.el('start').disabled = true;
      this.el('stop').disabled = false;
      this.el('device').disabled = true;
      this.el('chunks').textContent = 'Recording...';
      this.el('pending').textContent = 'In progress';

      this.clockTimer = setInterval(() => this.updateClock(), 1000);

    } catch (error) {
      this.setStatus('Permission denied');
      console.error(error);
    }
  }

  async stopRecording() {
    if (this.stopping) return;

    this.stopping = true;
    this.setStatus('Stopping...');
    
    clearInterval(this.clockTimer);

    if (this.recorder) {
      this.recorder.stopRecording(async () => {
        const blob = this.recorder.getBlob();
        console.log(`Video size: ${(blob.size / (1024 * 1024)).toFixed(2)}MB`);
        
        this.setStatus('Uploading...');
        this.el('pending').textContent = `Uploading ${(blob.size / (1024 * 1024)).toFixed(1)}MB...`;
        
        try {
          const result = await this.uploadVideo(blob);
          
          if (result.ok) {
            this.setStatus('Saved!');
            this.el('chunks').textContent = result.filename;
            this.el('pending').textContent = `Uploaded ${result.sizeMB}MB`;
            console.log(`✅ Saved: ${result.filename}`);
          } else {
            this.setStatus('Upload failed');
            this.el('pending').textContent = 'Upload error';
          }
        } catch (error) {
          this.setStatus('Upload failed');
          this.el('pending').textContent = 'Upload error';
          console.error('Upload error:', error);
        }

        this.stream?.getTracks().forEach(track => track.stop());
        this.stream = null;
        this.recorder = null;

        this.el('start').disabled = false;
        this.el('stop').disabled = true;
        this.el('device').disabled = false;
      });
    }
  }
}

new RecordingApp();
