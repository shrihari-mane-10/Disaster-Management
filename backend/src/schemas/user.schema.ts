import { z } from 'zod';

export const updateLocationSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;
