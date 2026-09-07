export const CONFIG = {
  SEGMENT_DURATION_MINUTES: process.env.SEGMENT_DURATION_MINUTES || 30,

  PORT: process.env.PORT || 3443,
  STORAGE_ROOT: process.env.STORAGE_ROOT,

  MAX_CONCURRENT_UPLOADS: 3,
  UPLOAD_RETRY_ATTEMPTS: 5,
  UPLOAD_TIMEOUT_MS: 15 * 60 * 1000, // 15 minutes for large segments
  MAX_SEGMENT_SIZE_BYTES: 2 * 1024 * 1024 * 1024, // 2GB max per segment

  TEMP_FILE_CLEANUP_HOURS: 24
};

export const getSegmentDurationMs = () => {
  return CONFIG.SEGMENT_DURATION_MINUTES * 60 * 1000;
};

export const isProduction = () => {
  return process.env.NODE_ENV === 'production';
};