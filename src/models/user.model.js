import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt"

const userSchema = new Schema({
    fullname: {
        type: String,
        required:true
    },
    email: {
        type: String,
        required:true,
        unique: true
    },
    password: {
        type:String
    },
    mobile: {
        type: String,
        required:true
    },
    role: {
        type: String,
        enum: ["User", "Owner", "Delivery Boy"],
        required:true
    },
    refreshToken: {
        type: String
    },
    resetOTP:{
        type:String
    },
    verifiedOTP:{
        type: Boolean,
        default:false
    },
    otpExpiry:{
        type:Date
    }
},
{
    timestamps:true
})

userSchema.pre("save", async function() {
    if (!this.isModified("password")) return
    this.password = await bcrypt.hash(this.password,10)
})

userSchema.methods.passwordMatch = async function (password) {
    return await bcrypt.compare(password,this.password)
}

export const User = mongoose.model("User",userSchema)