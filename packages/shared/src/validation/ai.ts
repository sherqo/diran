import { z } from 'zod';

export const aiRequestSchema = z.object({
  prompt: z.string().trim().min(1, 'Prompt is required').max(2000, 'Prompt is too long'),
  selectedText: z.string().max(10000, 'Selected text is too long').optional(),
  currentBlock: z
    .object({
      id: z.string(),
      type: z.string(),
      content: z.any(),
    })
    .optional(),
  documentContext: z
    .array(
      z.object({
        id: z.string(),
        type: z.string(),
        content: z.any(),
      })
    )
    .optional(),
});

export type AiRequestInput = z.infer<typeof aiRequestSchema>;
