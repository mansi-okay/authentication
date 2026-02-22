import mongoose,{Schema} from "mongoose";

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
    }
},
{
    timestamps:true
})

export const User = mongoose.model("User",userSchema)