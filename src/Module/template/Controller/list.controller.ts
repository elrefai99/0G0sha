import type { Request, RequestHandler, Response } from 'express'
import { asyncHandler } from '@/gen-import'
import { TemplateQueryDTO } from '../DTO/index.dto.js'
import { listTemplates } from '../Service/based-template.service.js'

export const listController: RequestHandler = asyncHandler(
     async (req: Request, res: Response) => {
          const parsed = TemplateQueryDTO.safeParse(req.query)
          const category = parsed.success ? parsed.data.category : undefined

          const data = await listTemplates(category)

          res.status(200).json({
               success: true,
               data,
          })
     },
)
