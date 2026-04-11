import type { NextFunction, Request, RequestHandler, Response } from 'express'
import { asyncHandler, estimateTokenCost, createLogger } from '@/gen-import'
import { checkBudget, consume } from '../Module/subscription/Service/token.service.js'

const logger = createLogger('TokenGuard')

export const tokenGuard: RequestHandler = asyncHandler(
     async (req: Request, res: Response, next: NextFunction) => {
          const { text } = req.body ?? {}
          if (!text) {
               next()
               return
          }

          const userId = req.user?._id?.toString()
          if (!userId) {
               next()
               return
          }

          const cost = estimateTokenCost(text)
          const budget = await checkBudget(userId, cost)

          if (!budget.allowed) {
               res.status(429).json({
                    success: false,
                    message: 'Daily token limit reached',
                    usage: {
                         tokensUsed: budget.used,
                         tokensLimit: budget.limit,
                         tokensRemaining: budget.remaining,
                         resetsAt: budget.resetsAt,
                    },
               })
               return
          }

          ;(req as any).estimatedCost = cost
          next()
     },
)

export const tokenConsume = (req: Request, res: Response, next: NextFunction): void => {
     const originalJson = res.json.bind(res)

     res.json = (body: any) => {
          if (body?.success && body?.data?.promptId && (req as any).estimatedCost && req.user?._id) {
               const promptId = body.data.promptId as string
               const cost = (req as any).estimatedCost as number
               const userId = req.user._id.toString()

               consume(userId, cost, promptId)
                    .then((usage) => {
                         body.usage = usage
                         return originalJson(body)
                    })
                    .catch((err) => {
                         logger.error({ err }, 'Token consume failed')
                         return originalJson(body)
                    })

               return res
          }

          return originalJson(body)
     }

     next()
}
