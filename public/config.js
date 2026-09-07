export const CLIENT_CONFIG = {
  SEGMENT_DURATION_MINUTES: 30,
  
  DEVICE_ID_PATTERN: /^[a-zA-Z0-9_-]{2,40}$/,
  
  MAX_RETRIES: 5,
  RETRY_DELAY_MS: 2000,
  RETRY_BACKOFF_MULTIPLIER: 2,
  
  CLOCK_UPDATE_INTERVAL_MS: 1000
};

export function getSegmentDurationMs() {
  return CLIENT_CONFIG.SEGMENT_DURATION_MINUTES * 60 * 1000;
}

export function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}