import type { Request, RequestHandler, Response } from 'express'
import { asyncHandler } from '@/gen-import'
import { getTemplateById } from '../Service/based-template.service.js'

export const templateDetailController: RequestHandler = asyncHandler(
     async (req: Request, res: Response) => {
          const id = req.params.id as string
          const template = await getTemplateById(id)

          res.status(200).json({
               success: true,
               data: template,
          })
     },
)
