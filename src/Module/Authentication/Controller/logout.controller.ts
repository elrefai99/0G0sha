import { NextFunction, Request, RequestHandler, Response } from "express";
import { asyncHandler } from "../../../utils/api-requesthandler";

export const logoutController: RequestHandler = asyncHandler(
     async (_req: Request, res: Response, _next: NextFunction) => {
          res.clearCookie("access_token")
          res.clearCookie("refresh_token")
          res.status(200).json({ success: true, message: "Logout successfully", })
     }
)
