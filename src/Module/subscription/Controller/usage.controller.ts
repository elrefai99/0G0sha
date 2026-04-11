import type { Request, RequestHandler, Response } from 'express'
import { asyncHandler, AppError } from '@/gen-import'
import { getUsage } from '../Service/token.service.js'

export const usageController: RequestHandler = asyncHandler(
     async (req: Request, res: Response) => {
          const userId = req.user?._id?.toString()
          if (!userId) throw AppError.unauthorized('Authentication required')

          const data = await getUsage(userId)

          res.status(200).json({
               success: true,
               data,
          })
     },
)
