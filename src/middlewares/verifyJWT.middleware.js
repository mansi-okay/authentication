import jwt from "jsonwebtoken"
import { asyncHandler,ApiError } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"

const verifyJWT = asyncHandler(async(req,res,next) => {
    try {
        const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ","")

        if(!token){
            throw new ApiError(400,"Token not found!!")
        }

        const decodedPayload = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedPayload?._id).select("-password")

        if (!user){
            throw new ApiError(401, "Invalid token!!")
        }

        req.user = user
        
        next()
    
    } catch (error) {
        throw new ApiError(400, error?.message || "Invalid token!!")
    }
})

export {verifyJWT}