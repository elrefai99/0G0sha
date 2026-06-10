import type { Request, RequestHandler, Response } from 'express'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { listPlans } from '../Service/based-subscription.service.js'

export const plansController: RequestHandler = asyncHandler(
     async (_req: Request, res: Response) => {
          const data = await listPlans()

          res.status(200).json({
               success: true,
               data,
          })
     },
)
