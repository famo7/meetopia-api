import { z } from 'zod';

export const CreateMeetingSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),

  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .default(''),

  date: z.coerce.date()
    .refine((meetingDate) => {
      const now = new Date()
      // Allow meetings to be scheduled at least 5 minutes from now
      const minTime = new Date(now.getTime() + 5 * 60 * 1000)
      return meetingDate >= minTime
    }, {
      message: 'Meeting must be scheduled at least 5 minutes from now'
    })
});

export const UpdateMeetingSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .optional(),

  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),

  date: z.coerce.date()
    .optional(),

  status: z.enum(['SCHEDULED', 'ACTIVE', 'ENDED', 'CANCELLED'])
    .optional()
});

export type CreateMeetingRequest = z.infer<typeof CreateMeetingSchema>;
export type UpdateMeetingRequest = z.infer<typeof UpdateMeetingSchema>;