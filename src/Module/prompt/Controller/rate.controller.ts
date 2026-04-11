import type { Request, RequestHandler, Response } from 'express'
import { asyncHandler, AppError, ratePrompt } from '@/gen-import'
import type { RateDTO } from '../DTO/index.dto.js'

export const rateController: RequestHandler = asyncHandler(
     async (req: Request, res: Response) => {
          const userId = req.user?._id?.toString()
          if (!userId) throw AppError.unauthorized('Authentication required')

          const id = req.params.id as string
          const { score } = req.body as RateDTO

          const result = await ratePrompt(id, userId, score)

          res.status(200).json({
               success: true,
               data: result,
          })
     },
)
