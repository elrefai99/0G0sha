import { Router } from "express";
import { authlimiter } from '../../utils/limit-request'
import { validateDTO } from '../../middleware/validateDTO'
import { RegisterDTO, LoginDTO } from './DTO/index.dto'
import { registerController } from './Controller/register.controller'
import { loginController } from './Controller/Login.controller'
import { refreshController } from './Controller/refresh.controller'
import { logoutController } from './Controller/logout.controller'
import { googleController } from './Controller/googleCallBack.controller'
import { forgetPasswordController } from './Controller/forgetPassword.controller'
import { resetPasswordController } from './Controller/resetPassword.controller'

const router: Router = Router();

router.post('/register', authlimiter, validateDTO(RegisterDTO), registerController)
router.post('/login', authlimiter, validateDTO(LoginDTO), loginController)
router.post('/refresh', authlimiter, refreshController)
router.post('/logout', authlimiter, logoutController)
router.post('/google', authlimiter, googleController)
router.post('/forget-password', authlimiter, forgetPasswordController)
router.post('/reset-password', authlimiter, resetPasswordController)

export default router;
