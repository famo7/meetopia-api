import { z } from 'zod';

export const CreateMeetingSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description too long'),
  date: z.iso.datetime('Invalid date format'),
});

export const UpdateMeetingSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(1000).optional(),
  date: z.iso.datetime().optional(),
  status: z.enum(['SCHEDULED', 'ACTIVE', 'ENDED', 'CANCELLED']).optional(),
});

export type CreateMeetingRequest = z.infer<typeof CreateMeetingSchema>;
export type UpdateMeetingRequest = z.infer<typeof UpdateMeetingSchema>;