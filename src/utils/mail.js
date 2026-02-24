import dotenv from "dotenv"
dotenv.config()
import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "Gmail",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL,
    pass: process.env.PASSWORD,
  },
});

const sendOTPMail = async(to,otp) => {
    await transporter.sendMail({
        from:process.env.MAIL,
        to,
        subject: "OTP mail for password reset",
        html: `<p>Your OTP for password reset is <b>${otp}</b>. It expires in 5 minutes.</p>`
    })
}

export {sendOTPMail}