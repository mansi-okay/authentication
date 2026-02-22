import {setServers} from "node:dns/promises"
setServers(["1.1.1.1", "8.8.8.8"]);

import dotenv from "dotenv"
dotenv.config()
import {app} from "./app.js"
import {connectDB} from "./config/db.js"
import { response } from "express";
import { error } from "node:console";

connectDB()
.then((response) => {
    app.listen(process.env.PORT, () => {
        console.log(`Express server started... Running on port: ${process.env.PORT}`);
        
    })
})
.catch((error) => {
    console.log("DB connection failed");
})