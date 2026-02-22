import mongoose from "mongoose";

const connectDB = async() => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}`)
        console.log(`MongoDB successfully connected... HOST: ${connectionInstance.connection.host}`)
        return connectionInstance
    } catch (error) {
        console.log(`DB connection failed!! ERROR: ${error}`);
        process.exit(1)
    }
}

export {connectDB}