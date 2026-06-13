import { NextFunction, Request, Response, RequestHandler } from "express"
import { AppError } from "../../../Shared/errors/app-error"
import { asyncHandler } from "../../../utils/api-requesthandler"
import { BasedAuthService } from "@/gen-import"

export const refreshController: RequestHandler = asyncHandler(
     async (req: Request, res: Response, next: NextFunction) => {
          const reftoken: undefined = req.cookies.refresh_token

          if (!reftoken) {
               next(AppError.badRequest("Refresh token not found"))
               return
          }
          const result = new BasedAuthService().refresh_token({ reftoken })
          const { token, tokenRefresh } = await result
          res.cookie("access_token", token, { httpOnly: true, secure: true, sameSite: "strict", maxAge: remainingMs })
          res.cookie("refresh_token", tokenRefresh, { httpOnly: true, secure: true, sameSite: "strict", maxAge: remainingMs })
          res.status(200).json({ code: 200, status: "OK", message: "Refresh token successful" })
     }
)
