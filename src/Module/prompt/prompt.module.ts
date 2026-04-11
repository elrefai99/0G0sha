import { userMiddleware, validateDTO } from '@/gen-import'
import { tokenGuard, tokenConsume } from '../../middleware/tokenGuard.js'
import { Router } from 'express'
import { OptimizeDTO, RateDTO } from './DTO/index.dto.js'
import { optimizeController } from './Controller/optimize.controller.js'
import { historyController } from './Controller/history.controller.js'
import { getByIdController } from './Controller/getById.controller.js'
import { rateController } from './Controller/rate.controller.js'

const router: Router = Router()

router.post('/optimize', userMiddleware, tokenGuard, validateDTO(OptimizeDTO), tokenConsume, optimizeController)
router.get('/history', userMiddleware, historyController)
router.get('/:id', userMiddleware, getByIdController)
router.patch('/:id/rate', userMiddleware, validateDTO(RateDTO), rateController)

export default router
