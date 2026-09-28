import { z } from 'zod';

export const updateTaskSchema = z.object({
  status: z.enum(['assigned', 'enroute', 'reached', 'resolved']),
});

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
