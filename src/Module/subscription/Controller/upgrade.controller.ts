import type { Request, RequestHandler, Response } from 'express'
import { asyncHandler, AppError } from '@/gen-import'
import type { UpgradeDTO } from '../DTO/index.dto.js'
import { upgrade } from '../Service/based-subscription.service.js'

export const upgradeController: RequestHandler = asyncHandler(
     async (req: Request, res: Response) => {
          const userId = req.user?._id?.toString()
          if (!userId) throw AppError.unauthorized('Authentication required')

          const { planId, billing, provider, method } = req.body as UpgradeDTO

          const result = await upgrade(userId, planId, billing, provider, method)

          res.status(200).json({
               success: true,
               data: result,
          })
     },
)
