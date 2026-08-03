import mongoose from "mongoose";

// Fail hard — don't silently continue when the database is unreachable
export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log("DB CONNECTED");
    } catch (error) {
        console.error("FATAL: MongoDB connection failed:", error.message);
        process.exit(1); // Let the process manager (PM2, Docker) restart us cleanly
    }
};