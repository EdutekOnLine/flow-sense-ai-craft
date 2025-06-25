
import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200, 'Title too long'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
  due_date: z.date().optional(),
  contact_id: z.string().optional(),
  company_id: z.string().optional(),
  assigned_to: z.string().optional(),
});

export type CreateTaskForm = z.infer<typeof createTaskSchema>;

export const defaultTaskValues: CreateTaskForm = {
  title: '',
  description: '',
  priority: 'medium',
  status: 'pending',
  due_date: undefined,
  contact_id: 'none',
  company_id: 'none',
  assigned_to: '',
};
