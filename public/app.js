const CONFIG = {
  SEGMENT_DURATION_MS: 30 * 60 * 1000, // 30 minutes
  DEVICE_ID_PATTERN: /^[a-zA-Z0-9_-]{2,40}$/
};

class RecordingApp {
  constructor() {
    this.el = id => document.getElementById(id);
    this.recorder = null;
    this.stream = null;
    this.sessionId = null;
    this.segmentNumber = 0;
    this.stopping = false;
    this.startTime = null;
    this.clockTimer = null;
    this.segmentTimer = null;
    this.recordedChunks = [];

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

  async uploadSegment(blob, segmentNum) {
    const device = this.el('device').value.trim();
    const formData = new FormData();
    
    formData.append('video', blob, `segment-${segmentNum}.mp4`);
    formData.append('device', device);
    formData.append('session', this.sessionId);
    formData.append('segment', segmentNum);
    
    this.el('pending').textContent = `Uploading ${(blob.size / (1024 * 1024)).toFixed(1)}MB...`;
    
    const response = await fetch('/api/upload-segment', {
      method: 'POST',
      body: formData
    });
    
    return response.json();
  }

  startSegment() {
    this.recordedChunks = [];
    
    let mimeType = 'video/mp4';
    
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm;codecs=vp8,opus';
      console.warn('MP4 not supported, falling back to WebM');
    }

    const options = {
      mimeType: mimeType,
      videoBitsPerSecond: 2500000
    };

    this.recorder = new MediaRecorder(this.stream, options);

    this.recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.recorder.onstop = async () => {
      if (!this.stopping && this.recordedChunks.length > 0) {
        const blob = new Blob(this.recordedChunks, { type: mimeType });
        console.log(`Segment ${this.segmentNumber} complete: ${(blob.size / (1024 * 1024)).toFixed(2)}MB`);
        
        try {
          const result = await this.uploadSegment(blob, this.segmentNumber);
          if (result.ok) {
            this.segmentNumber++;
            this.el('segments').textContent = this.segmentNumber;
            this.el('pending').textContent = 'Uploaded';
            console.log(`✅ Saved: ${result.filename}`);
          }
        } catch (error) {
          console.error('Upload error:', error);
          this.el('pending').textContent = 'Upload failed';
        }

        this.startSegment();
      }
    };

    this.recorder.start();
    this.setStatus('Recording...');
    this.el('pending').textContent = `Recording segment ${this.segmentNumber + 1}`;

    this.segmentTimer = setTimeout(() => {
      if (this.recorder && this.recorder.state === 'recording') {
        this.recorder.stop();
      }
    }, CONFIG.SEGMENT_DURATION_MS);
  }

  async startRecording() {
    const device = this.el('device').value.trim();

    if (!CONFIG.DEVICE_ID_PATTERN.test(device)) {
      alert('Enter a valid device ID (e.g., academy-01)');
      return;
    }

    try {
      this.stopping = false;
      this.segmentNumber = 0;
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

      videoTracks[0].addEventListener('ended', () => this.stopRecording());

      this.el('start').disabled = true;
      this.el('stop').disabled = false;
      this.el('device').disabled = true;
      this.el('segments').textContent = '0';

      this.clockTimer = setInterval(() => this.updateClock(), 1000);

      // Start first segment
      this.startSegment();

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
    clearTimeout(this.segmentTimer);

    if (this.recorder && this.recorder.state === 'recording') {
      this.recorder.stop();
      
      // Wait for final segment to upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (this.recordedChunks.length > 0) {
        const mimeType = this.recorder.mimeType || 'video/mp4';
        const blob = new Blob(this.recordedChunks, { type: mimeType });
        try {
          const result = await this.uploadSegment(blob, this.segmentNumber);
          if (result.ok) {
            this.segmentNumber++;
            this.el('segments').textContent = this.segmentNumber;
          }
        } catch (error) {
          console.error('Final upload error:', error);
        }
      }
    }

    this.stream?.getTracks().forEach(track => track.stop());
    this.stream = null;
    this.recorder = null;

    this.el('start').disabled = false;
    this.el('stop').disabled = true;
    this.el('device').disabled = false;
    this.setStatus('Stopped');
    this.el('pending').textContent = `${this.segmentNumber} segments saved`;
  }
}

new RecordingApp();
