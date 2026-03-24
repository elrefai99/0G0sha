import { Router } from "express";
import { loginController, logoutController, refreshController, registerController } from "./auth.controller";
import { LoginDTO, RegisterDTO } from "./DTO/index.dto";
import { authlimiter } from "../../utils/limit-request";
import { validateDTO } from "../../middleware/validateDTO";

const router: Router = Router();

router.post('/register', authlimiter, validateDTO(RegisterDTO), registerController)
router.post('/login', authlimiter, validateDTO(LoginDTO), loginController)
router.post('/refresh', authlimiter, refreshController)
router.post('/logout', authlimiter, logoutController)

export default router;
