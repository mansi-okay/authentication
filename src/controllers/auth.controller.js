import { User } from "../models/user.model.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { genTokens } from "../utils/token.js"
import { sendOTPMail } from "../utils/mail.js"
import bcrypt from "bcrypt"

const signUp = asyncHandler(async(req,res) => {
    const {fullname,email,password,mobile,role} = req.body

    if (!fullname?.trim() || !email?.trim() || !password?.trim() || !mobile?.trim() || !role?.trim()) {
        throw new ApiError(400,"All fields are required!")
    }

    const existingUser = await User.findOne({
        $or: [{email}, {mobile}]
    })

    if (existingUser){
        throw new ApiError(400, "User already exists.")
    }

    if (mobile.length !== 10) {
        throw new ApiError(400, "Mobile number must be of 10 digits.")
    }

    if (password.length <6){
        throw new ApiError(400, "Password must be of atleast 6 characters.")
    }

    const user = await User.create({
        fullname,
        email,
        password,
        mobile,
        role
    })

    const {accessToken,refreshToken} = await genTokens(user._id)

    const userData = user.toObject()
    delete userData.password
    delete userData.refreshToken

    const options = {
        httpOnly:true,
        secure:true,
        sameSite:"strict",
        maxAge:7*24*60*60*1000
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200, {userData}, "Sign-up successful.")
    )
})

const signIn = asyncHandler(async(req,res) => {

    const {email,password} = req.body

    if (!email?.trim() || !password?.trim()){
        throw new ApiError(400,"Missing fields!")
    }

    const existingUser = await User.findOne({email})

    if(!existingUser){
        throw new ApiError(400,"User does not exist!!")
    }

    const passwordMatched = await existingUser.passwordMatch(password)

    if(!passwordMatched){
        throw new ApiError(400,"Password incorrect!!")
    }

    const {accessToken,refreshToken} = await genTokens(existingUser._id)

    const userData = existingUser.toObject()
    delete userData.password
    delete userData.refreshToken

    const options = {
        httpOnly:true,
        secure:false,
        sameSite:"strict",
        maxAge:7*24*60*60*1000
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,{userData},"Sign-in successful")
    )
})

const signOut = asyncHandler(async(req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { $unset: { refreshToken:1 }}
    )

    res.status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(
        new ApiResponse(200,{}, "Sign-out successful")
    )
})

const sendOTP = asyncHandler(async(req,res) => {
    const {email} = req.body

    if(!email?.trim()){
        throw new ApiError(400,"Email required!")
    }
    
    const existingUser = await User.findOne({email})

    if(!existingUser){
        throw new ApiError(400,"User does not exist!")
    }

    const otp = Math.floor(1000 + Math.random()*9000).toString()

    const hashedOTP = await bcrypt.hash(otp,10)

    existingUser.resetOTP = hashedOTP
    existingUser.otpExpiry = Date.now()+5*60*1000
    await existingUser.save()

    await sendOTPMail(email,otp)

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"OTP sent successfully")
    )
})

const verifyOTP = asyncHandler(async(req,res) => {
    const {email,otp} = req.body 

    if (!email?.trim() || !otp?.trim()){
        throw new ApiError(400,"All fields required!")
    }

    const existingUser = await User.findOne({email})

    if(!existingUser){
        throw new ApiError(400,"User does not exist!")
    }

    if (!existingUser.otpExpiry || existingUser.otpExpiry < Date.now()){
        throw new ApiError(400,"OTP expired!!")
    }

    const otpMatch = await bcrypt.compare(otp, existingUser.resetOTP)

    if(!otpMatch){
        throw new ApiError(400,"OTP does not match!")
    }

    await User.findByIdAndUpdate(
        existingUser._id,
        {
            $set: {verifiedOTP: true},
            $unset:{
                resetOTP:1,
                otpExpiry:1
            }
        }
    )

    return res.status(200)
    .json(new ApiResponse(200,"OTP vverification successful"))
})

const resetPassword = asyncHandler(async(req,res) => {
    const {email,newPassword,confirmPassword} = req.body
    
    if (!email?.trim() || !newPassword?.trim() || !confirmPassword?.trim()){
        throw new ApiError(400,"All fields required!")
    }

    if (newPassword.length <6){
        throw new ApiError(400, "Password must be of atleast 6 characters.")
    }

    if(newPassword !== confirmPassword){
        throw new ApiError(400, "Confirm password does not match")
    }

    const user = await User.findOne({email})

    if(!user){
        throw new ApiError(400,"User does not exist!")
    }

    if(!user.verifiedOTP){
        throw new ApiError(400,"OTP not verified!")
    }

    user.password = newPassword
    user.verifiedOTP = false

    await user.save()

    return res.status(200)
    .json(new ApiResponse(200,{},"Password change successful"))
})

export {signUp,signIn,signOut,sendOTP,verifyOTP,resetPassword}