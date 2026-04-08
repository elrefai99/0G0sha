import { authlimiter, forgetPasswordController, googleController, loginController, LoginDTO, logoutController, refreshController, registerController, RegisterDTO, resetPasswordController, validateDTO } from "@/gen-import";
import { Router } from "express";

const router: Router = Router();

router.post('/register', authlimiter, validateDTO(RegisterDTO), registerController)
router.post('/login', authlimiter, validateDTO(LoginDTO), loginController)
router.post('/refresh', authlimiter, refreshController)
router.post('/logout', authlimiter, logoutController)
router.post('/google', authlimiter, googleController)
router.post('/forget-password', authlimiter, forgetPasswordController)
router.post('/reset-password', authlimiter, resetPasswordController)

export default router;
