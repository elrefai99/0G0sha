import { Router } from "express";
import { RegisterDTO, authlimiter, validateDTO } from "../../the-import";
import { logoutController, refreshController, registerController } from "./auth.controller";

const router: Router = Router();

router.post('/register', authlimiter, validateDTO(RegisterDTO), registerController)
router.post('/refresh', authlimiter, refreshController)
router.post('/logout', authlimiter, logoutController)

export default router;
