import { logger } from './logger.js';

class SessionManager {
  constructor() {
    // Map of active sessions: sessionId -> session data
    this.activeSessions = new Map();
    
    // Map of device -> session IDs
    this.deviceSessions = new Map();
    
    // Upload statistics
    this.uploadStats = {
      totalUploads: 0,
      totalBytes: 0,
      failedUploads: 0
    };
  }

  // Start a new recording session
  startSession(deviceId, sessionId) {
    const sessionData = {
      deviceId,
      sessionId,
      startTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      segmentsUploaded: 0,
      totalBytes: 0,
      status: 'active'
    };

    this.activeSessions.set(sessionId, sessionData);
    
    // Track device sessions
    if (!this.deviceSessions.has(deviceId)) {
      this.deviceSessions.set(deviceId, []);
    }
    this.deviceSessions.get(deviceId).push(sessionId);

    logger.info('Session started', { deviceId, sessionId });
    return sessionData;
  }

  // Update session activity (on upload)
  updateSession(sessionId, segmentNumber, fileSize) {
    const session = this.activeSessions.get(sessionId);
    
    if (session) {
      session.lastActivity = new Date().toISOString();
      session.segmentsUploaded = Math.max(session.segmentsUploaded, segmentNumber + 1);
      session.totalBytes += fileSize;
      
      // Update global stats
      this.uploadStats.totalUploads++;
      this.uploadStats.totalBytes += fileSize;
      
      logger.debug('Session updated', { 
        sessionId, 
        segmentNumber, 
        sizeMB: (fileSize / (1024 ** 2)).toFixed(2) 
      });
    } else {
      // Auto-create session if not exists (for uploads without explicit start)
      logger.warn('Session not found, auto-creating', { sessionId });
      const deviceId = 'unknown';
      const newSession = this.startSession(deviceId, sessionId);
      this.updateSession(sessionId, segmentNumber, fileSize);
    }
  }

  // Mark session as ended
  endSession(sessionId) {
    const session = this.activeSessions.get(sessionId);
    
    if (session) {
      session.status = 'ended';
      session.endTime = new Date().toISOString();
      
      const duration = new Date(session.endTime) - new Date(session.startTime);
      const durationMinutes = Math.round(duration / 60000);
      
      logger.info('Session ended', {
        deviceId: session.deviceId,
        sessionId,
        segments: session.segmentsUploaded,
        totalMB: (session.totalBytes / (1024 ** 2)).toFixed(2),
        durationMinutes
      });
      
      // Remove from active sessions after 1 hour
      setTimeout(() => {
        this.activeSessions.delete(sessionId);
      }, 60 * 60 * 1000);
    }
  }

  // Record failed upload
  recordFailure(sessionId, error) {
    this.uploadStats.failedUploads++;
    logger.error('Upload failed', { sessionId, error });
  }

  // Get all active sessions
  getActiveSessions() {
    const sessions = [];
    
    for (const [sessionId, data] of this.activeSessions.entries()) {
      if (data.status === 'active') {
        // Calculate session duration
        const duration = new Date() - new Date(data.startTime);
        const durationMinutes = Math.round(duration / 60000);
        
        // Check if session is stale (no activity for 10 minutes)
        const lastActivity = new Date(data.lastActivity);
        const timeSinceActivity = new Date() - lastActivity;
        const isStale = timeSinceActivity > 10 * 60 * 1000;
        
        sessions.push({
          ...data,
          durationMinutes,
          totalMB: (data.totalBytes / (1024 ** 2)).toFixed(2),
          isStale
        });
      }
    }
    
    return sessions.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
  }

  // Get session by ID
  getSession(sessionId) {
    return this.activeSessions.get(sessionId);
  }

  // Get sessions by device
  getDeviceSessions(deviceId) {
    const sessionIds = this.deviceSessions.get(deviceId) || [];
    return sessionIds
      .map(id => this.activeSessions.get(id))
      .filter(s => s);
  }

  // Get statistics
  getStats() {
    const activeSessions = this.getActiveSessions();
    
    return {
      activeSessionCount: activeSessions.length,
      totalUploads: this.uploadStats.totalUploads,
      totalGB: (this.uploadStats.totalBytes / (1024 ** 3)).toFixed(2),
      failedUploads: this.uploadStats.failedUploads,
      successRate: this.uploadStats.totalUploads > 0 
        ? ((this.uploadStats.totalUploads - this.uploadStats.failedUploads) / this.uploadStats.totalUploads * 100).toFixed(1) + '%'
        : '100%'
    };
  }

  // Clean up stale sessions (called periodically)
  cleanupStaleSessions() {
    const now = new Date();
    let cleaned = 0;
    
    for (const [sessionId, data] of this.activeSessions.entries()) {
      if (data.status === 'active') {
        const lastActivity = new Date(data.lastActivity);
        const timeSinceActivity = now - lastActivity;
        
        // Mark as ended if no activity for 30 minutes
        if (timeSinceActivity > 30 * 60 * 1000) {
          this.endSession(sessionId);
          cleaned++;
        }
      }
    }
    
    if (cleaned > 0) {
      logger.info('Cleaned up stale sessions', { count: cleaned });
    }
  }
}

// Singleton instance
export const sessionManager = new SessionManager();

// Auto-cleanup every 5 minutes
setInterval(() => {
  sessionManager.cleanupStaleSessions();
}, 5 * 60 * 1000);

export default sessionManager;
