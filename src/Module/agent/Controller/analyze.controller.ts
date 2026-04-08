import type { Request, RequestHandler, Response } from 'express'
import { AgentService, AnalyzeDTO, asyncHandler } from '@/gen-import'

export const analyzeController: RequestHandler = asyncHandler(
     async (req: Request, res: Response) => {
          const { text } = req.body as AnalyzeDTO
          const service = new AgentService()
          const result = service.analyze(text)
          res.status(200).json({ success: true, data: result })
     }
)
