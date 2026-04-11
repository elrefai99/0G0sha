import type { Request, RequestHandler, Response } from 'express'
import { asyncHandler, optimizePrompt } from '@/gen-import'
import type { OptimizeDTO } from '../DTO/index.dto.js'

export const optimizeController: RequestHandler = asyncHandler(
     async (req: Request, res: Response) => {
          const { text, targetModel } = req.body as OptimizeDTO
          const userId = req.user?._id?.toString()

          const result = await optimizePrompt(text, targetModel, userId)

          res.status(200).json({
               success: true,
               data: result,
          })
     },
)
