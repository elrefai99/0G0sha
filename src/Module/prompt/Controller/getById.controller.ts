import type { Request, RequestHandler, Response } from 'express'
import { AppError } from '../../../Shared/errors/app-error'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { getPromptById } from '../Service/based-prompt.service'

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
