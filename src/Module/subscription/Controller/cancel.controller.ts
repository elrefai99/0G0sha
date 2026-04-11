import type { Request, RequestHandler, Response } from 'express'
import { asyncHandler, AppError } from '@/gen-import'
import { cancel } from '../Service/based-subscription.service.js'

export const cancelController: RequestHandler = asyncHandler(
     async (req: Request, res: Response) => {
          const userId = req.user?._id?.toString()
          if (!userId) throw AppError.unauthorized('Authentication required')

          const result = await cancel(userId)

          res.status(200).json({
               success: true,
               data: result,
          })
     },
)
