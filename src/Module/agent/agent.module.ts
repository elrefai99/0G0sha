import { validateDTO } from '../../middleware/validateDTO'
import { AnalyzeDTO } from './DTO/index.dto'
import { analyzeController } from './Controller/analyze.controller'
import { Router } from 'express'

const router: Router = Router()

router.post('/analyze', validateDTO(AnalyzeDTO), analyzeController)

export default router
