import dns from "dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import express from "express";
import cors from "cors";
import 'dotenv/config';
import { connectDB } from "./config/db.js";
import authRouter from "./routes/authRoutes.js";
import notificationRouter from "./routes/notificationRoutes.js";
import pollRouter from "./routes/pollRoutes.js";
import commentRouter from "./routes/commentRoutes.js";
import userRouter from "./routes/userRoutes.js";

const PORT = process.env.PORT || 5000;
const app = express();

// MIDDLEWARE
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/polls', pollRouter);
app.use('/api/comments', commentRouter);
app.use('/api/users', userRouter);
app.use('/api/notifications', notificationRouter);

app.get("/", (req, res) => {
    res.send("Pollify API is active and working");
});

const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
};

startServer();