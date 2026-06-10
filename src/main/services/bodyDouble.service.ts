import { getDatabase, isFallbackDatabase } from '../database';
import { getFallbackCollection, updateFallback } from '../database/fallback';
import { eq } from 'drizzle-orm';
import * as schema from '../database/schema';
import { powerMonitor } from 'electron';

export interface BodyDoubleConfig {
  focusSessionId?: number | null;
  personaName: string;
  ambientType: 'silent' | 'subtle' | 'active';
  soundscape?: string;
  checkInIntervalMin: number;
  voiceEnabled: boolean;
  plannedMinutes: number;
}

export class BodyDoubleService {
  private activeSessionId: number | null = null;
  private driftTimer: NodeJS.Timeout | null = null;
  private checkInTimer: NodeJS.Timeout | null = null;
  private onDriftCallback: (() => void) | null = null;
  private onCheckInCallback: (() => void) | null = null;
  private wasDrifting = false;

  startSession(
    sessionId: number,
    config: BodyDoubleConfig,
    onDrift: () => void,
    onCheckIn: () => void
  ): void {
    this.activeSessionId = sessionId;
    this.onDriftCallback = onDrift;
    this.onCheckInCallback = onCheckIn;
    this.wasDrifting = false;

    this.stopTimers();

    // 1. Start Drift Detection (Check system idle time every 10 seconds)
    this.driftTimer = setInterval(() => {
      this.checkUserIdle();
    }, 10000);

    // 2. Start Periodic Check-Ins
    const checkInMs = (config.checkInIntervalMin || 10) * 60 * 1000;
    this.checkInTimer = setInterval(() => {
      if (this.onCheckInCallback) {
        this.onCheckInCallback();
      }
    }, checkInMs);
  }

  stopSession(actualMinutes: number, completed: boolean): void {
    this.stopTimers();
    if (this.activeSessionId) {
      if (isFallbackDatabase()) {
        updateFallback('body_double_sessions', this.activeSessionId, {
          actualMinutes,
          taskCompleted: completed,
          endedAt: new Date().toISOString()
        });
      } else {
        const db = getDatabase();
        db.update(schema.bodyDoubleSessions)
          .set({
            actualMinutes,
            taskCompleted: completed,
            endedAt: new Date()
          } as any)
          .where(eq(schema.bodyDoubleSessions.id, this.activeSessionId))
          .run();
      }
    }
    this.activeSessionId = null;
  }

  private stopTimers(): void {
    if (this.driftTimer) {
      clearInterval(this.driftTimer);
      this.driftTimer = null;
    }
    if (this.checkInTimer) {
      clearInterval(this.checkInTimer);
      this.checkInTimer = null;
    }
  }

  private checkUserIdle(): void {
    try {
      const idleTimeSeconds = powerMonitor.getSystemIdleTime();
      
      // Drift threshold: 5 minutes (300 seconds)
      if (idleTimeSeconds >= 300) {
        if (!this.wasDrifting) {
          this.wasDrifting = true;
          
          // Increment drift count in database
          this.incrementDriftCount();

          if (this.onDriftCallback) {
            this.onDriftCallback();
          }
        }
      } else {
        this.wasDrifting = false;
      }
    } catch (e) {
      console.error('Error getting system idle time:', e);
    }
  }

  private incrementDriftCount(): void {
    if (!this.activeSessionId) return;

    if (isFallbackDatabase()) {
      const session = getFallbackCollection('body_double_sessions').find((s: any) => s.id === this.activeSessionId);
      if (session) {
        updateFallback('body_double_sessions', this.activeSessionId, {
          driftDetectedCount: (session.driftDetectedCount || 0) + 1
        });
      }
    } else {
      const db = getDatabase();
      const session = db.select()
        .from(schema.bodyDoubleSessions)
        .where(eq(schema.bodyDoubleSessions.id, this.activeSessionId))
        .get();
        
      if (session) {
        db.update(schema.bodyDoubleSessions)
          .set({
            driftDetectedCount: (session.driftDetectedCount || 0) + 1
          })
          .where(eq(schema.bodyDoubleSessions.id, this.activeSessionId))
          .run();
      }
    }
  }
}
