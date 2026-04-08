import { analyzeController, AnalyzeDTO, validateDTO } from '@/gen-import'
import { Router } from 'express'

const router: Router = Router()

router.post('/analyze', validateDTO(AnalyzeDTO), analyzeController)

export default router
