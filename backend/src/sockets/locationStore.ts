import { prisma } from '../lib/prisma.js';

export interface LiveLocationData {
  userId: string;
  name: string;
  role: string;
  lat: number;
  lng: number;
  lastSeenAt: Date;
}

class LocationStore {
  private locations: Map<string, LiveLocationData> = new Map();
  private flushTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.startPeriodicFlush(30000); // Flush to DB every 30 seconds
  }

  /**
   * Update or store a user's live coordinates in memory
   */
  public setLocation(userId: string, data: Omit<LiveLocationData, 'userId' | 'lastSeenAt'>) {
    this.locations.set(userId, {
      userId,
      ...data,
      lastSeenAt: new Date(),
    });
  }

  /**
   * Get single user's current live location
   */
  public getLocation(userId: string): LiveLocationData | undefined {
    return this.locations.get(userId);
  }

  /**
   * Get all live locations
   */
  public getAllLocations(): LiveLocationData[] {
    return Array.from(this.locations.values());
  }

  /**
   * Get all active volunteers' live locations
   */
  public getVolunteerLocations(): LiveLocationData[] {
    return Array.from(this.locations.values()).filter((l) => l.role === 'volunteer');
  }

  /**
   * Periodic batch flush from in-memory Map into PostgreSQL database
   */
  private startPeriodicFlush(intervalMs: number) {
    if (this.flushTimer) clearInterval(this.flushTimer);

    this.flushTimer = setInterval(async () => {
      if (this.locations.size === 0) return;

      const entries = Array.from(this.locations.values());
      console.log(`💾 [LocationStore] Flushing ${entries.length} live location(s) to database...`);

      for (const loc of entries) {
        try {
          await prisma.user.update({
            where: { id: loc.userId },
            data: {
              lat: loc.lat,
              lng: loc.lng,
              lastSeenAt: loc.lastSeenAt,
            },
          });
        } catch (err: any) {
          console.error(`Failed to flush location for user ${loc.userId}:`, err.message);
        }
      }
    }, intervalMs);
  }

  public cleanup() {
    if (this.flushTimer) clearInterval(this.flushTimer);
  }
}

export const locationStore = new LocationStore();
