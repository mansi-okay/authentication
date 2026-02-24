import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"

const genTokens = async(userID) => {
    try {
        const user = await User.findById(userID)

        if(!user){
            throw new ApiError(400,"User does not exist!")
        }

        const accessToken = await jwt.sign(
            {_id : userID},
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn:process.env.ACCESS_TOKEN_EXPIRY}
        )

        const refreshToken = await jwt.sign(
            {_id : userID},
            process.env.REFRESH_TOKEN_SECRET,
            {expiresIn:process.env.REFRESH_TOKEN_EXPIRY}
        )

        user.refreshToken = refreshToken

        await user.save({validateModifiedOnly: true})

        return {accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(500, error.message || "Token generation failed")
    }
}

export {genTokens}