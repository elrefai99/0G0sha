import type { Request, RequestHandler, Response } from 'express'
import { AgentService, asyncHandler } from '@/gen-import'
import { AnalyzeDTO } from '../DTO/index.dto'

export const analyzeController: RequestHandler = asyncHandler(
     async (req: Request, res: Response) => {
          const { text } = req.body as AnalyzeDTO
          const service = new AgentService()
          const result = service.analyze(text)
          res.status(200).json({ success: true, data: result })
     }
)
