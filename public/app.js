const SEGMENT_MS = 30 * 60 * 1000;
const UPLOAD_PASSWORD = 'CHANGE_ME_IN_PRODUCTION';

const el = id => document.getElementById(id);

if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
  alert('⚠️ This app must be accessed via HTTPS to use screen recording.\n\nPlease use: https://<laptop-ip>:3443');
  setStatus('HTTPS required');
}

const startBtn = el('start');
const stopBtn = el('stop');
let recorder;
let stream;
let segmentTimer;
let clockTimer;
let segmentStartedAt;
let sessionId;
let segmentId;
let recordedChunks = [];
let stopping = false;
let displayStream = null;
let microphoneStream = null;
let audioContext = null;

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

function downloadRecording(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

function startSegment() {
  recordedChunks = [];
  segmentStartedAt = Date.now();
  segmentId = `${stamp()}__30min`;
  const mimeType = chooseMimeType();
  recorder = new MediaRecorder(stream, mimeType ? { mimeType, videoBitsPerSecond: 1800000 } : undefined);

  recorder.ondataavailable = event => {
    if (event.data && event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };
  
  recorder.onerror = event => {
    setStatus('Recorder error');
    console.error(event.error);
  };
  
  recorder.onstop = () => {
    if (recordedChunks.length > 0 && !stopping) {
      saveSegment();
      startSegment();
    }
  };

  recorder.start(1000);
  setStatus('Recording...');
  clearInterval(clockTimer);
  clockTimer = setInterval(updateClock, 1000);
  clearTimeout(segmentTimer);
  segmentTimer = setTimeout(() => {
    if (recorder?.state === 'recording') recorder.stop();
  }, SEGMENT_MS);
}

async function saveSegment() {
  if (recordedChunks.length === 0) return;
  
  const device = el('device').value.trim();
  const blob = new Blob(recordedChunks, { type: chooseMimeType() });
  const filename = `${device}_${sessionId}_${segmentId}.webm`;
  
  setStatus('Saving segment locally...');
  downloadRecording(blob, filename);
  console.log(`✅ Saved locally: ${filename} (${(blob.size / (1024 ** 2)).toFixed(2)} MB)`);
  
  setStatus('Uploading to server...');
  
  try {
    await uploadToServer(blob, filename);
    console.log(`✅ Uploaded to server: ${filename}`);
    setStatus('Recording... (Saved & Uploaded)');
    el('chunks').textContent = parseInt(el('chunks').textContent || '0') + 1;
  } catch (error) {
    console.error('❌ Upload failed:', error);
    setStatus('⚠️ Saved locally, upload failed');
    alert(
      '⚠️ Upload to server failed, but recording is saved in Downloads folder.\n\n' +
      'File: ' + filename + '\n\n' +
      'Recording will continue. You can manually upload later or wait for retry.'
    );
  }
  
  recordedChunks = [];
}

async function uploadToServer(blob, filename) {
  const device = el('device').value.trim();
  
  const formData = new FormData();
  formData.append('recording', blob, filename);
  formData.append('device', device);
  formData.append('session', sessionId);
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'X-Upload-Password': UPLOAD_PASSWORD
    },
    body: formData
  });
  
  const result = await response.json();
  
  if (!result.ok) {
    throw new Error(result.error || 'Upload failed');
  }
  
  return result;
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
  clearTimeout(segmentTimer);
  clearInterval(clockTimer);

  if (recorder && recorder.state !== 'inactive') {
    recorder.stop();
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  if (recordedChunks.length > 0) {
    await saveSegment();
  }

  await cleanupAudioStreams();

  startBtn.disabled = false;
  stopBtn.disabled = true;
  el('device').disabled = false;

  const count = el('chunks').textContent;
  setStatus(`Stopped - ${count} segment(s) saved`);
}

stopBtn.addEventListener('click', stopRecording);

window.addEventListener('beforeunload', event => {
  if (recorder?.state === 'recording') {
    event.preventDefault();
    event.returnValue = '';
  }
});