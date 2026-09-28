import { prisma } from '../../lib/prisma.js';
import { emitAlertBroadcast } from '../../sockets/socketHandler.js';
import { AlertChannel, Severity } from '../../types/models.js';


export interface AlertNotificationPayload {
  message: string;
  severity?: Severity;
  region?: string | null;
  createdBy?: string;
  targetUserIds?: string[];
}

export interface NotificationResult {
  channel: string;
  success: boolean;
  recipientsCount: number;
  alertId?: string;
  details?: any;
}

export interface NotificationProvider {
  channel: AlertChannel;
  send(payload: AlertNotificationPayload): Promise<NotificationResult>;
}

/**
 * SocketProvider - Real-time in-app / push broadcast over Socket.IO /live namespace
 */
export class SocketProvider implements NotificationProvider {
  channel: AlertChannel = 'socket';

  async send(payload: AlertNotificationPayload): Promise<NotificationResult> {
    try {
      // 1. Create Alert record in database
      const alert = await prisma.alert.create({
        data: {
          message: payload.message,
          severity: payload.severity || 'high',
          region: payload.region || null,
          channel: 'socket',
          createdBy: payload.createdBy || null,
        },
        include: {
          creator: {
            select: { id: true, name: true, role: true, email: true },
          },
        },
      });

      // 2. Real-time broadcast to all connected WebSocket clients
      emitAlertBroadcast(alert);

      console.log(`📡 [SocketProvider] Broadcasted real-time alert (ID: ${alert.id}) to /live gateway`);

      return {
        channel: 'socket',
        success: true,
        recipientsCount: 1, // Broadcast channel
        alertId: alert.id,
      };
    } catch (err: any) {
      console.error('[SocketProvider] Error broadcasting alert:', err.message);
      return {
        channel: 'socket',
        success: false,
        recipientsCount: 0,
        details: err.message,
      };
    }
  }
}

/**
 * MockSmsProvider - Simulated SMS Dispatcher (Keyless rule compliance)
 * Logs simulated cellular SMS dispatches to stdout and records channel: 'sms_mock'
 */
export class MockSmsProvider implements NotificationProvider {
  channel: AlertChannel = 'sms_mock';

  async send(payload: AlertNotificationPayload): Promise<NotificationResult> {
    try {
      // Find eligible recipient users with phone numbers
      const users = await prisma.user.findMany({
        where: {
          phone: { not: null },
          role: { in: ['citizen', 'volunteer'] },
        },
        select: { id: true, name: true, phone: true, role: true },
      });

      // 1. Log simulated SMS delivery to console
      console.log('================================================================');
      console.log(`📱 [MOCK SMS GATEWAY] Dispatching Emergency SMS Broadcast`);
      console.log(`🚨 Severity: [${(payload.severity || 'HIGH').toUpperCase()}] | Region: ${payload.region || 'ALL ZONES'}`);
      console.log(`📝 Message: "${payload.message}"`);
      console.log(`👥 Target Recipients: ${users.length} registered citizens & volunteers`);
      console.log('----------------------------------------------------------------');

      users.forEach((u, i) => {
        console.log(`  [${i + 1}/${users.length}] 📤 SMS SENT -> To: ${u.phone} (${u.name} - ${u.role}) | Status: DELIVERED (Simulated)`);
      });
      console.log('================================================================');

      // 2. Record Alert row in database
      const alert = await prisma.alert.create({
        data: {
          message: payload.message,
          severity: payload.severity || 'high',
          region: payload.region || null,
          channel: 'sms_mock',
          createdBy: payload.createdBy || null,
        },
        include: {
          creator: {
            select: { id: true, name: true, role: true, email: true },
          },
        },
      });

      return {
        channel: 'sms_mock',
        success: true,
        recipientsCount: users.length,
        alertId: alert.id,
        details: { simulatedRecipients: users.map((u) => ({ name: u.name, phone: u.phone })) },
      };
    } catch (err: any) {
      console.error('[MockSmsProvider] Error sending simulated SMS:', err.message);
      return {
        channel: 'sms_mock',
        success: false,
        recipientsCount: 0,
        details: err.message,
      };
    }
  }
}

// Notification Service Aggregator
export class NotificationService {
  private providers: NotificationProvider[] = [
    new SocketProvider(),
    new MockSmsProvider(),
  ];

  async broadcastAlert(payload: AlertNotificationPayload): Promise<NotificationResult[]> {
    const results = await Promise.all(
      this.providers.map((p) => p.send(payload))
    );
    return results;
  }
}

export const notificationService = new NotificationService();
