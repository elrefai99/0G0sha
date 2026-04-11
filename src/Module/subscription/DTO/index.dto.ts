import { z } from 'zod'

export const UpgradeDTO = z.object({
     planId: z.string().min(1, 'planId is required'),
     billing: z.enum(['monthly', 'yearly']).default('monthly'),
     provider: z.enum(['stripe', 'paymob']),
     method: z.enum(['card', 'wallet']).optional(),
})
export type UpgradeDTO = z.infer<typeof UpgradeDTO>

export const CancelDTO = z.object({
     reason: z.string().max(500).optional(),
})
export type CancelDTO = z.infer<typeof CancelDTO>
