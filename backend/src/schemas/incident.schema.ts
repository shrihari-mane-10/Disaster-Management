import { z } from 'zod';

export const createIncidentSchema = z.object({
  type: z.string().min(1, 'Incident type is required'),
  description: z.string().min(1, 'Description is required'),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  lat: z.coerce.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
  lng: z.coerce.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
});

export const updateIncidentSchema = z.object({
  type: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.enum(['pending', 'assigned', 'in_progress', 'resolved', 'rejected']).optional(),
  verified: z.boolean().optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
});

export const incidentQuerySchema = z.object({
  status: z.enum(['pending', 'assigned', 'in_progress', 'resolved', 'rejected']).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  type: z.string().optional(),
  verified: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  limit: z.coerce.number().min(1).max(100).default(50).optional(),
  offset: z.coerce.number().min(0).default(0).optional(),
});

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
export type UpdateIncidentInput = z.infer<typeof updateIncidentSchema>;
export type IncidentQueryInput = z.infer<typeof incidentQuerySchema>;
