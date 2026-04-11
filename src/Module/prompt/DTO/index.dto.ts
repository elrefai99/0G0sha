import { z } from 'zod'

export const OptimizeDTO = z.object({
     text: z.string().min(1, 'text is required').max(5000, 'text must not exceed 5000 characters'),
     targetModel: z.enum(['claude', 'gpt', 'general']).default('general'),
})
export type OptimizeDTO = z.infer<typeof OptimizeDTO>

export const RateDTO = z.object({
     score: z.number().int().min(1, 'score must be at least 1').max(10, 'score must be at most 10'),
})
export type RateDTO = z.infer<typeof RateDTO>

export const HistoryQueryDTO = z.object({
     page: z.coerce.number().int().min(1).default(1),
     limit: z.coerce.number().int().min(1).max(100).default(20),
     category: z.enum(['coding', 'writing', 'analysis', 'marketing', 'general']).optional(),
})
export type HistoryQueryDTO = z.infer<typeof HistoryQueryDTO>
