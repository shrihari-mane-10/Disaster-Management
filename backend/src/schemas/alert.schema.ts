import { z } from 'zod';

export const sendAlertSchema = z.object({
  message: z.string().min(3, 'Alert message must be at least 3 characters'),
  region: z.string().optional().nullable(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('high'),
});

export const alertQuerySchema = z.object({
  channel: z.enum(['inapp', 'socket', 'sms_mock']).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  region: z.string().optional(),
});

export type SendAlertInput = z.infer<typeof sendAlertSchema>;
export type AlertQueryInput = z.infer<typeof alertQuerySchema>;
