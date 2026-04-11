import type { Request, RequestHandler, Response } from 'express'
import { asyncHandler, AppError, getHistory } from '@/gen-import'
import { HistoryQueryDTO } from '../DTO/index.dto.js'

export const historyController: RequestHandler = asyncHandler(
     async (req: Request, res: Response) => {
          const userId = req.user?._id?.toString()
          if (!userId) throw AppError.unauthorized('Authentication required')

          const parsed = HistoryQueryDTO.safeParse(req.query)
          if (!parsed.success) {
               const messages = parsed.error.errors.map((e) => e.message).join('; ')
               throw AppError.badRequest(messages)
          }

          const { page, limit, category } = parsed.data
          const result = await getHistory(userId, page, limit, category)

          res.status(200).json({
               success: true,
               data: result.data,
               meta: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    totalPages: Math.ceil(result.total / result.limit),
               },
          })
     },
)
