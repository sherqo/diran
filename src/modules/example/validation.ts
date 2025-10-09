import { z } from 'zod';

// Example validation schema
export const createExampleSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
});

export type CreateExampleInput = z.infer<typeof createExampleSchema>;
