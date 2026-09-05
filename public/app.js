const SEGMENT_MS = 30 * 60 * 1000; // 30 minutes
const CHUNK_INTERVAL_MS = 5000; // 5 seconds per chunk
const MAX_RETRY_ATTEMPTS = 3;

const el = id => document.getElementById(id);

if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
  alert('⚠️ This app must be accessed via HTTPS to use screen recording.\n\nPlease use: https://<laptop-ip>:3443');
  setStatus('HTTPS required');
}

const startBtn = el('start');
const stopBtn = el('stop');
const deviceInput = el('device');
let recorder;
let stream;
let segmentTimer;
let clockTimer;
let segmentStartedAt;
let sessionId;
let segmentId;
let chunkSequence = 0;
let stopping = false;
let uploadQueue = [];
let isUploading = false;
let displayStream = null;
let microphoneStream = null;
let audioContext = null;

// Auto-load saved device ID
const savedDeviceId = localStorage.getItem('deviceId');
if (savedDeviceId) {
  deviceInput.value = savedDeviceId;
}

// Auto-save device ID when changed
deviceInput.addEventListener('input', () => {
  const deviceId = deviceInput.value.trim();
  if (deviceId) {
    localStorage.setItem('deviceId', deviceId);
  }
});

function stamp(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, '-');
}

function setStatus(text) { 
  el('status').textContent = text; 
}

function updateClock() {
  const seconds = Math.floor((Date.now() - segmentStartedAt) / 1000);
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  el('elapsed').textContent = `${h}:${m}:${s}`;
}

function chooseMimeType() {
  const options = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm'
  ];
  return options.find(type => MediaRecorder.isTypeSupported(type)) || '';
}

async function uploadChunkToServer(blob, sequence, retryCount = 0) {
  const device = el('device').value.trim();
  const formData = new FormData();
  
  formData.append('chunk', blob, `chunk-${sequence}.webm`);
  formData.append('device', device);
  formData.append('session', sessionId);
  formData.append('segment', segmentId);
  formData.append('sequence', sequence);
  
  try {
    const response = await fetch('/api/upload-chunk', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (!result.ok) {
      throw new Error(result.error || 'Upload failed');
    }
    
    return result;
  } catch (error) {
    if (retryCount < MAX_RETRY_ATTEMPTS) {
      console.log(`Chunk ${sequence} failed, retrying (${retryCount + 1}/${MAX_RETRY_ATTEMPTS})...`);
      await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
      return uploadChunkToServer(blob, sequence, retryCount + 1);
    }
    throw error;
  }
}

async function processUploadQueue() {
  if (isUploading || uploadQueue.length === 0) return;
  
  isUploading = true;
  
  while (uploadQueue.length > 0) {
    const { blob, sequence } = uploadQueue[0];
    
    try {
      await uploadChunkToServer(blob, sequence);
      uploadQueue.shift();
      
      // Update UI
      const uploaded = parseInt(el('chunks').textContent || '0') + 1;
      el('chunks').textContent = uploaded;
      el('pending').textContent = `${uploadQueue.length} chunks queued`;
      
      console.log(`✅ Chunk ${sequence} uploaded (queue: ${uploadQueue.length})`);
    } catch (error) {
      console.error(`❌ Chunk ${sequence} upload failed after retries:`, error);
      el('pending').textContent = `Upload error! ${uploadQueue.length} pending`;
      await new Promise(resolve => setTimeout(resolve, 5000));
      break;
    }
  }
  
  isUploading = false;
  
  if (uploadQueue.length > 0) {
    setTimeout(processUploadQueue, 1000);
  } else {
    el('pending').textContent = 'All chunks uploaded';
  }
}

function startSegment() {
  chunkSequence = 0;
  segmentStartedAt = Date.now();
  segmentId = `${stamp()}__30min`;
  
  const mimeType = chooseMimeType();
  recorder = new MediaRecorder(stream, mimeType ? { mimeType, videoBitsPerSecond: 1800000 } : undefined);

  recorder.ondataavailable = event => {
    if (event.data && event.data.size > 0) {
      // Add chunk to upload queue immediately
      uploadQueue.push({ 
        blob: event.data, 
        sequence: chunkSequence++ 
      });
      
      // Start processing queue
      processUploadQueue();
    }
  };
  
  recorder.onerror = event => {
    setStatus('Recorder error');
    console.error(event.error);
  };
  
  recorder.onstop = async () => {
    if (!stopping) {
      // Wait for queue to clear before finalizing
      await waitForQueueEmpty();
      await finalizeSegment();
      startSegment();
    }
  };

  // Record in 5-second chunks
  recorder.start(CHUNK_INTERVAL_MS);
  setStatus('Recording & streaming...');
  
  clearInterval(clockTimer);
  clockTimer = setInterval(updateClock, 1000);
  
  clearTimeout(segmentTimer);
  segmentTimer = setTimeout(() => {
    if (recorder?.state === 'recording') recorder.stop();
  }, SEGMENT_MS);
}

async function waitForQueueEmpty() {
  let attempts = 0;
  const maxAttempts = 60; // Wait up to 60 seconds
  
  while (uploadQueue.length > 0 && attempts < maxAttempts) {
    console.log(`Waiting for queue to clear... ${uploadQueue.length} chunks remaining`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;
  }
  
  if (uploadQueue.length > 0) {
    console.warn(`Queue not empty after ${maxAttempts}s, ${uploadQueue.length} chunks may be lost`);
  }
}

async function finalizeSegment() {
  const device = el('device').value.trim();
  
  try {
    setStatus('Finalizing segment...');
    
    const response = await fetch('/api/finalize-segment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        device,
        session: sessionId,
        segment: segmentId
      })
    });
    
    const result = await response.json();
    
    if (result.ok) {
      console.log(`✅ Segment finalized: ${result.filename} (${result.sizeMB} MB from ${result.chunks} chunks)`);
      setStatus('Segment saved to server');
      
      // Reset chunk counter for next segment
      el('chunks').textContent = '0';
    } else {
      console.error('❌ Finalize failed:', result.error);
      setStatus('Finalize error');
    }
  } catch (error) {
    console.error('❌ Finalize error:', error);
    setStatus('Finalize error');
  }
}

startBtn.addEventListener('click', async () => {
  const device = el('device').value.trim();

  if (!/^[a-zA-Z0-9_-]{2,40}$/.test(device)) {
    alert('Enter a valid device ID (e.g., academy-01)');
    return;
  }

  try {
    stopping = false;
    sessionId = `${new Date().toISOString().slice(0, 10)}_${stamp()}`;
    uploadQueue = [];

    displayStream = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: 15 },
      audio: {
        systemAudio: 'include',
        suppressLocalAudioPlayback: false
      }
    });

    const videoTracks = displayStream.getVideoTracks();
    const displayAudioTracks = displayStream.getAudioTracks();

    if (videoTracks.length === 0) {
      throw new Error('No screen video track was provided.');
    }

    let microphoneAudioTracks = [];

    if (el('microphone').checked) {
      try {
        microphoneStream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        microphoneAudioTracks = microphoneStream.getAudioTracks();
      } catch (error) {
        console.warn('Microphone unavailable:', error);
      }
    }

    const finalTracks = [...videoTracks];

    if (displayAudioTracks.length > 0 || microphoneAudioTracks.length > 0) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioContextClass();

      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const destination = audioContext.createMediaStreamDestination();

      if (displayAudioTracks.length > 0) {
        const displayAudioStream = new MediaStream(displayAudioTracks);
        const displaySource = audioContext.createMediaStreamSource(displayAudioStream);
        displaySource.connect(destination);
      }

      if (microphoneAudioTracks.length > 0) {
        const microphoneAudioStream = new MediaStream(microphoneAudioTracks);
        const microphoneSource = audioContext.createMediaStreamSource(microphoneAudioStream);
        microphoneSource.connect(destination);
      }

      finalTracks.push(...destination.stream.getAudioTracks());
    }

    stream = new MediaStream(finalTracks);

    const hasSystemAudio = displayAudioTracks.length > 0;
    const hasMicrophone = microphoneAudioTracks.length > 0;

    if (hasSystemAudio && hasMicrophone) {
      setStatus('Recording with microphone and system audio');
    } else if (hasMicrophone && !hasSystemAudio) {
      setStatus('Recording with microphone only');
      alert('Microphone is recording, but system audio was not shared.\n\nTo include call audio, restart and enable "Share tab audio".');
    } else if (hasSystemAudio) {
      setStatus('Recording with system audio only');
    } else {
      setStatus('Recording without audio');
      alert('No audio detected.\n\nTo include audio, restart and enable "Share tab audio".');
    }

    videoTracks[0].addEventListener('ended', () => stopRecording());

    startBtn.disabled = true;
    stopBtn.disabled = false;
    el('device').disabled = true;

    startSegment();
  } catch (error) {
    setStatus('Permission cancelled');
    console.error(error);
    await cleanupAudioStreams();
  }
});

async function cleanupAudioStreams() {
  stream?.getTracks().forEach(track => track.stop());
  displayStream?.getTracks().forEach(track => track.stop());
  microphoneStream?.getTracks().forEach(track => track.stop());

  stream = null;
  displayStream = null;
  microphoneStream = null;

  if (audioContext && audioContext.state !== 'closed') {
    try {
      await audioContext.close();
    } catch (error) {
      console.warn('Could not close AudioContext:', error);
    }
  }

  audioContext = null;
}

async function stopRecording() {
  if (stopping) return;

  stopping = true;
  setStatus('Stopping...');
  
  clearTimeout(segmentTimer);
  clearInterval(clockTimer);

  if (recorder && recorder.state !== 'inactive') {
    recorder.stop();
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Wait for all chunks to upload
  await waitForQueueEmpty();
  
  // Finalize the last segment
  if (chunkSequence > 0) {
    await finalizeSegment();
  }

  await cleanupAudioStreams();

  startBtn.disabled = false;
  stopBtn.disabled = true;
  el('device').disabled = false;

  setStatus('Stopped - all segments saved');
}

stopBtn.addEventListener('click', stopRecording);

window.addEventListener('beforeunload', event => {
  if (recorder?.state === 'recording') {
    event.preventDefault();
    event.returnValue = '';
  }
});
