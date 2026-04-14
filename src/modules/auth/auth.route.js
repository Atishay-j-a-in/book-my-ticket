import { Router } from "express";   
import { register ,login, logout, refreshAccessToken} from "./auth.controller.js";
import validate from "../../common/dto/validate.middleware.js";
import {RegisterDto,LoginDto} from "./auth.dto.js";
import {authenticate, authenticateRefreshToken} from "./auth.middleware.js";
const router = Router()

router.post("/register",validate(RegisterDto),register)

router.post("/login",validate(LoginDto),login)

router.post("/logout",authenticate,logout)

router.post("/refresh",authenticateRefreshToken, refreshAccessToken)




export default router