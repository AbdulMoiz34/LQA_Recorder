import { CLIENT_CONFIG, getSegmentDurationMs, formatDuration } from './config.js';

class ContinuousRecorder {
  constructor() {
    this.el = id => document.getElementById(id);
    this.recorder = null;
    this.stream = null;
    this.audioContext = null;
    this.sessionId = null;
    this.segmentNumber = 0;
    this.startTime = null;
    this.clockTimer = null;
    this.segmentTimer = null;
    this.recordedChunks = [];
    this.isRecording = false;
    this.uploadQueue = [];
    this.isUploading = false;
    this.currentMimeType = null;

    this.init();
  }

  init() {
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      alert('⚠️ HTTPS required. Use: https://<laptop-ip>:3443');
    }

    const saved = localStorage.getItem('deviceId');
    if (saved && CLIENT_CONFIG.DEVICE_ID_PATTERN.test(saved)) {
      this.el('device').value = saved;
    }

    this.el('device').addEventListener('input', () => {
      const id = this.el('device').value.trim();
      if (id && CLIENT_CONFIG.DEVICE_ID_PATTERN.test(id)) {
        localStorage.setItem('deviceId', id);
      }
    });

    this.el('start').addEventListener('click', () => this.startRecording());
    this.el('stop').addEventListener('click', () => this.stopRecording());
    
    window.addEventListener('beforeunload', (e) => {
      if (this.isRecording) {
        e.preventDefault();
        e.returnValue = 'Recording in progress. Are you sure you want to close?';
      }
    });

    this.updateQueueDisplay();
  }

  setStatus(text) {
    this.el('status').textContent = text;
  }

  updateClock() {
    const elapsed = Date.now() - this.startTime;
    this.el('elapsed').textContent = formatDuration(elapsed);
    
    const segmentElapsed = elapsed % getSegmentDurationMs();
    const remaining = getSegmentDurationMs() - segmentElapsed;
    const segmentTime = formatDuration(segmentElapsed);
    this.el('pending').textContent = `${segmentTime} (saving in ${Math.ceil(remaining / 1000)}s)`;
  }

  updateQueueDisplay(progress = null) {
    const queueCount = this.uploadQueue.length;
    let displayText = `${queueCount} pending`;
    
    if (this.isUploading) {
      if (progress !== null) {
        displayText += ` (uploading ${progress}%)`;
      } else {
        displayText += ` (uploading...)`;
      }
    }
    
    this.el('queue').textContent = displayText;
  }

  async uploadSegment(blob, segmentNum) {
    const device = this.el('device').value.trim();
    const formData = new FormData();
    
    const ext = this.currentMimeType.includes('mp4') ? 'mp4' : 'webm';
    formData.append('video', blob, `segment-${segmentNum}.${ext}`);
    formData.append('device', device);
    formData.append('session', this.sessionId);
    formData.append('segment', segmentNum);
    
    let lastError = null;
    
    for (let attempt = 1; attempt <= CLIENT_CONFIG.MAX_RETRIES; attempt++) {
      try {
        const result = await this.uploadWithProgress(formData);
        console.log(`✅ Segment ${segmentNum} uploaded: ${result.filename} (${result.sizeMB}MB)`);
        return result;
        
      } catch (error) {
        lastError = error;
        console.warn(`Upload attempt ${attempt}/${CLIENT_CONFIG.MAX_RETRIES} failed:`, error.message);
        
        if (attempt < CLIENT_CONFIG.MAX_RETRIES) {
          const delay = CLIENT_CONFIG.RETRY_DELAY_MS * Math.pow(CLIENT_CONFIG.RETRY_BACKOFF_MULTIPLIER, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }

  uploadWithProgress(formData) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          this.updateQueueDisplay(percentComplete);
        }
      });
      
      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText);
            resolve(result);
          } catch (e) {
            reject(new Error('Invalid response from server'));
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      });
      
      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });
      
      xhr.addEventListener('abort', () => {
        reject(new Error('Upload aborted'));
      });
      
      // Send request
      xhr.open('POST', '/api/upload-segment');
      xhr.send(formData);
    });
  }

  async processUploadQueue() {
    if (this.isUploading || this.uploadQueue.length === 0) return;
    
    this.isUploading = true;
    this.updateQueueDisplay();
    
    while (this.uploadQueue.length > 0) {
      const item = this.uploadQueue[0];
      
      try {
        await this.uploadSegment(item.blob, item.segmentNum);
        this.uploadQueue.shift();
      } catch (error) {
        console.error(`❌ Segment ${item.segmentNum} upload failed permanently:`, error);
        this.uploadQueue.shift();
      }
      
      this.updateQueueDisplay();
    }
    
    this.isUploading = false;
    this.updateQueueDisplay();
  }

  queueUpload(blob, segmentNum) {
    this.uploadQueue.push({ blob, segmentNum });
    this.updateQueueDisplay();
    this.processUploadQueue();
  }

  startSegment() {
    this.recordedChunks = [];
    
    let mimeType = 'video/mp4';
    
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm;codecs=vp8,opus';
      console.warn('MP4 not supported, using WebM');
    }

    this.currentMimeType = mimeType;

    const options = {
      mimeType: mimeType,
      videoBitsPerSecond: 2500000,  // 2.5 Mbps video (current)
      audioBitsPerSecond: 192000     // 192 kbps audio (high quality)
    };

    this.recorder = new MediaRecorder(this.stream, options);

    this.recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.recorder.onstop = () => {
      if (this.recordedChunks.length > 0) {
        const blob = new Blob(this.recordedChunks, { type: this.currentMimeType });
        const sizeMB = (blob.size / (1024 * 1024)).toFixed(2);
        console.log(`📦 Segment ${this.segmentNumber} complete: ${sizeMB}MB`);
        
        this.queueUpload(blob, this.segmentNumber);
        
        this.segmentNumber++;
        this.el('segments').textContent = this.segmentNumber;
        
        if (this.isRecording) {
          this.startSegment();
        }
      }
    };

    this.recorder.start();
    
    this.segmentTimer = setTimeout(() => {
      if (this.recorder && this.recorder.state === 'recording') {
        this.recorder.stop();
      }
    }, getSegmentDurationMs());
  }

  async startRecording() {
    const device = this.el('device').value.trim();

    if (!CLIENT_CONFIG.DEVICE_ID_PATTERN.test(device)) {
      alert('Enter a valid device ID (e.g., academy-01)');
      return;
    }

    try {
      this.isRecording = true;
      this.segmentNumber = 0;
      this.sessionId = new Date().toISOString().replace(/[:.]/g, '-');
      this.startTime = Date.now();

      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 },
        audio: {
          systemAudio: 'include',
          echoCancellation: false,     // Don't process system audio
          noiseSuppression: false,     // Keep original quality
          autoGainControl: false       // Don't normalize volume
        }
      });

      const videoTracks = displayStream.getVideoTracks();
      const audioTracks = displayStream.getAudioTracks();
      let micTracks = [];

      if (this.el('microphone').checked) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              sampleRate: 48000,        // High quality sample rate
              channelCount: 2           // Stereo audio
            }
          });
          micTracks = micStream.getAudioTracks();
        } catch (e) {
          console.warn('Mic not available:', e);
        }
      }

      const finalTracks = [...videoTracks];

      if (audioTracks.length > 0 || micTracks.length > 0) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext();
        const destination = this.audioContext.createMediaStreamDestination();

        if (audioTracks.length > 0) {
          this.audioContext.createMediaStreamSource(new MediaStream(audioTracks)).connect(destination);
        }
        if (micTracks.length > 0) {
          this.audioContext.createMediaStreamSource(new MediaStream(micTracks)).connect(destination);
        }

        finalTracks.push(...destination.stream.getAudioTracks());
      }

      this.stream = new MediaStream(finalTracks);

      videoTracks[0].addEventListener('ended', () => this.stopRecording());

      this.el('start').disabled = true;
      this.el('stop').disabled = false;
      this.el('device').disabled = true;
      this.el('microphone').disabled = true;
      this.el('segments').textContent = '0';
      this.clockTimer = setInterval(() => this.updateClock(), CLIENT_CONFIG.CLOCK_UPDATE_INTERVAL_MS);

      this.setStatus('Recording...');
      this.startSegment();

    } catch (error) {
      this.setStatus('Permission denied');
      this.isRecording = false;
      console.error(error);
    }
  }

  stopRecording() {
    if (!this.isRecording) return;

    console.log('🛑 Stopping recording...');
    this.isRecording = false;
    this.setStatus('Stopped');
    
    clearInterval(this.clockTimer);
    clearTimeout(this.segmentTimer);

    if (this.recorder && this.recorder.state === 'recording') {
      this.recorder.stop();
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.stream?.getTracks().forEach(track => track.stop());
    this.stream = null;
    this.recorder = null;

    this.el('start').disabled = false;
    this.el('stop').disabled = true;
    this.el('device').disabled = false;
    this.el('microphone').disabled = false;
    this.el('pending').textContent = 'Stopped';
  }
}

new ContinuousRecorder();
