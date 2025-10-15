import { z } from 'zod';

export const SearchParticipantsSchema = z.object({
  query: z.string().min(1, 'Search query must be at least 1 character'),
  meetingId: z.number().int().positive('Meeting ID must be a positive integer'),
  limit: z.number().int().min(1).max(50).default(10)
});

export type SearchParticipantsRequest = z.infer<typeof SearchParticipantsSchema>;