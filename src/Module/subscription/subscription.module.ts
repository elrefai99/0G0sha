import { userMiddleware, validateDTO } from '@/gen-import'
import { Router } from 'express'
import { UpgradeDTO, CancelDTO } from './DTO/index.dto.js'
import { plansController } from './Controller/plans.controller.js'
import { upgradeController } from './Controller/upgrade.controller.js'
import { cancelController } from './Controller/cancel.controller.js'
import { usageController } from './Controller/usage.controller.js'

const router: Router = Router()

router.get('/plans', plansController)
router.post('/upgrade', userMiddleware, validateDTO(UpgradeDTO), upgradeController)
router.post('/cancel', userMiddleware, validateDTO(CancelDTO), cancelController)
router.get('/usage', userMiddleware, usageController)

export default router
