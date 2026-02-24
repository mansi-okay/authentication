import { Router } from "express";
import {signUp,signIn,signOut,sendOTP,verifyOTP,resetPassword} from "../controllers/auth.controller.js"
import {verifyJWT} from "../middlewares/verifyJWT.middleware.js"

const authRouter = Router()

authRouter.route("/sign-up").post(signUp)
authRouter.route("/sign-in").post(signIn)
authRouter.route("/sign-out").post(verifyJWT,signOut)
authRouter.route("/send-otp").post(sendOTP)
authRouter.route("/verify-otp").post(verifyOTP)
authRouter.route("/reset-password").post(resetPassword)

export {authRouter}