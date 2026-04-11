import { Router } from 'express'
import { listController } from './Controller/list.controller.js'
import { templateDetailController } from './Controller/detail.controller.js'

const router: Router = Router()

router.get('/', listController)
router.get('/:id', templateDetailController)

export default router
