import { Router } from "express";
import { logoutController, refreshController, registerController } from "./auth.controller";
import { RegisterDTO, authlimiter, validateDTO } from "../../gen-import";

const router: Router = Router();

router.post('/register', authlimiter, validateDTO(RegisterDTO), registerController)
router.post('/refresh', authlimiter, refreshController)
router.post('/logout', authlimiter, logoutController)

export default router;
