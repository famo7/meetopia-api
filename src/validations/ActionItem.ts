import { z } from 'zod';

export const CreateActionItemSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),

  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),

  assignedToId: z.number()
    .int('Assigned user ID must be an integer')
    .positive('Assigned user ID must be positive')
    .optional(),

  status: z.enum(['OPEN', 'IN_PROGRESS', 'DONE'])
    .optional()
    .default('OPEN'),

  dueDate: z.iso.datetime('Due date must be a valid ISO 8601 datetime')
    .refine((date) => new Date(date) > new Date(), {
      message: 'Due date must be in the future'
    })
    .optional()
});

export const UpdateActionItemSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .optional(),

  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),

  assignedToId: z.number()
    .int('Assigned user ID must be an integer')
    .positive('Assigned user ID must be positive')
    .optional(),

  status: z.enum(['OPEN', 'IN_PROGRESS', 'DONE'])
    .optional(),

  dueDate: z.iso.datetime('Due date must be a valid ISO 8601 datetime')
    .refine((date) => new Date(date) > new Date(), {
      message: 'Due date must be in the future'
    })
    .optional()
    .nullable() // Allow null to clear due date
});

export type CreateActionItemRequest = z.infer<typeof CreateActionItemSchema>;
export type UpdateActionItemRequest = z.infer<typeof UpdateActionItemSchema>;