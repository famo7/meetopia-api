import { z } from 'zod';

export const AddParticipantSchema = z.object({
  userId: z.number().int().positive('User ID must be a positive integer'),
  role: z.enum(['PARTICIPANT', 'CREATOR']).default('PARTICIPANT')
});

export type AddParticipantRequest = z.infer<typeof AddParticipantSchema>;
