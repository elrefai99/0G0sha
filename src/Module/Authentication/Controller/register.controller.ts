import type { NextFunction, Request, RequestHandler, Response } from 'express'
import { AppError, BasedAuthService, asyncHandler } from '@/the-import'

export const registerController: RequestHandler = asyncHandler(
     async (req: Request, res: Response, next: NextFunction) => {
          const { email, password } = req.body

          const baseAuth = new BasedAuthService()

          const user = await baseAuth.check_account(email)

          if (user) {
               next(AppError.badRequest('User already exists'))
               return
          }


          res.status(201).json({ user })
     }
)
