import { z } from 'zod'

export const TemplateQueryDTO = z.object({
     category: z.enum(['coding', 'writing', 'analysis', 'marketing', 'general']).optional(),
})
export type TemplateQueryDTO = z.infer<typeof TemplateQueryDTO>
