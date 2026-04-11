import type { Request, RequestHandler, Response } from 'express'
import { asyncHandler, AppError, getPromptById } from '@/gen-import'

export const getByIdController: RequestHandler = asyncHandler(
     async (req: Request, res: Response) => {
          const userId = req.user?._id?.toString()
          if (!userId) throw AppError.unauthorized('Authentication required')

          const id = req.params.id as string
          const prompt = await getPromptById(id, userId)

          res.status(200).json({
               success: true,
               data: prompt,
          })
     },
)
