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

  priority: z.enum(['LOW', 'MEDIUM', 'HIGH'])
    .optional()
    .default('MEDIUM'),

  dueDate: z.coerce.date()
    .refine((date) => {
      return date > new Date();
    }, {
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

  priority: z.enum(['LOW', 'MEDIUM', 'HIGH'])
    .optional(),

  dueDate: z.coerce.date()
    .refine((date) => {
      return date > new Date();
    }, {
      message: 'Due date must be in the future'
    })
    .optional()
    .nullable() // Allow null to clear due date
});

export type CreateActionItemRequest = z.infer<typeof CreateActionItemSchema>;
export type UpdateActionItemRequest = z.infer<typeof UpdateActionItemSchema>;