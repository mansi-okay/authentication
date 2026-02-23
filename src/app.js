import express from "express"
import cookieparser from "cookie-parser"

const app = express()

app.use(cookieparser())

app.use(express.json({limit:"16kb"}))

app.use(express.urlencoded({
    limit:"16kb",
    extended:true
}))

import { authRouter } from "./routes/auth.route.js"

app.use("api/users",authRouter)

export {app}