import dns from "dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
// express-mongo-sanitize is not used — Express 5 makes req.query read-only
// and the package crashes trying to overwrite it. We use a hand-rolled sanitizer below.
import rateLimit from "express-rate-limit";
import "dotenv/config";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/authRoutes.js";
import notificationRouter from "./routes/notificationRoutes.js";
import pollRouter from "./routes/pollRoutes.js";
import commentRouter from "./routes/commentRoutes.js";
import userRouter from "./routes/userRoutes.js";

// ─── Startup environment validation ────────────────────────────────────────
const REQUIRED_ENV = ["MONGO_URI", "JWT_SECRET", "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET", "CLIENT_URL"];

for (const key of REQUIRED_ENV) {
    if (!process.env[key]) {
        console.error(`FATAL: Missing required environment variable: ${key}`);
        process.exit(1);
    }
}

if (process.env.JWT_SECRET.length < 32) {
    console.error("FATAL: JWT_SECRET is too short. Minimum 32 characters required.");
    process.exit(1);
}

const PORT = process.env.PORT || 5000;
const app = express();

// ─── Trust proxy (needed behind Vercel / Heroku) ───────────────────────────
app.set("trust proxy", 1);

// ─── Security headers (Helmet) ─────────────────────────────────────────────
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // allow Cloudinary images
    contentSecurityPolicy: false, // API only — CSP belongs on the frontend
}));

// ─── Compression ───────────────────────────────────────────────────────────
app.use(compression());

// ─── CORS — dynamic origin whitelist for production and vercel preview domains ───
const ALLOWED_ORIGINS = (process.env.CLIENT_URL || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

// Regex matching vercel.app domains (including preview deployment URLs)
const VERCEL_PREVIEW_REGEX = /^https:\/\/.*\.vercel\.app$/;

// Regex matching localhost and local network IPs (e.g. 192.168.x.x) on any port for seamless local development
const LOCAL_DEV_REGEX = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+):\d+$/;

app.use(cors({
    origin: (origin, callback) => {
        // Allow same-origin / server-to-server calls (no Origin header)
        if (!origin) {
            return callback(null, true);
        }
        
        // Allow strict whitelist origins (production, localhost)
        if (ALLOWED_ORIGINS.includes(origin)) {
            return callback(null, true);
        }

        // Allow any localhost or local IP port for dev convenience
        if (LOCAL_DEV_REGEX.test(origin)) {
            return callback(null, true);
        }

        // Allow any vercel deployment preview URLs dynamically
        if (VERCEL_PREVIEW_REGEX.test(origin)) {
            return callback(null, true);
        }

        // Disallow origin cleanly without breaking OPTIONS preflight status codes
        callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204
}));

// ─── Body parsers with size limits ─────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));

// ─── Strip MongoDB operators ($gt, $where, etc.) from body & params ──────
// Express 5 made req.query a read-only getter, so express-mongo-sanitize
// crashes trying to reassign it. This custom middleware skips req.query
// (query-string values are always strings, never objects, so injection
// via query params is impossible without express.json parsing them).
const _stripOperators = (obj) => {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return;
    for (const key of Object.keys(obj)) {
        if (key.startsWith("$") || key.includes(".")) {
            delete obj[key];
        } else {
            _stripOperators(obj[key]);
        }
    }
};
app.use((req, _res, next) => {
    if (req.body)   _stripOperators(req.body);
    if (req.params) _stripOperators(req.params);
    next();
});

// ─── Rate limiters ─────────────────────────────────────────────────────────
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 10,                    // 10 attempts per IP per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many attempts, please try again in 15 minutes." },
});

const otpLimiter = rateLimit({
    windowMs: 60 * 1000,        // 1 minute
    max: 5,                     // 5 OTP attempts per minute per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many OTP attempts. Please wait a moment." },
});

const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,                   // 120 general API calls per minute per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests, please slow down." },
});

// Apply rate limiters before routes
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/forgot-password", authLimiter);
app.use("/api/auth/reset-password", authLimiter);
app.use("/api/auth/verify-otp", otpLimiter);
app.use("/api/auth/resend-otp", otpLimiter);
app.use("/api/auth/verify-reset-otp", otpLimiter);
app.use("/api", apiLimiter);

// ─── Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/polls", pollRouter);
app.use("/api/comments", commentRouter);
app.use("/api/users", userRouter);
app.use("/api/notifications", notificationRouter);

// ─── Root — no info leakage ────────────────────────────────────────────────
app.get("/", (_req, res) => res.status(200).end());

// ─── Centralised error handler ─────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
    // Log internally (full details)
    console.error(`[${new Date().toISOString()}] ERROR ${req.method} ${req.path}:`, err.message);

    // Handle CORS errors
    if (err.message && err.message.startsWith("CORS policy:")) {
        return res.status(403).json({ message: "Forbidden: CORS policy" });
    }

    // Handle Multer errors
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ message: "File too large. Maximum size is 5 MB." });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({ message: "Too many files uploaded." });
    }
    if (err.message?.startsWith("Only") || err.message?.startsWith("Invalid file")) {
        return res.status(400).json({ message: err.message });
    }

    // Never leak internal error details in production
    const isDev = process.env.NODE_ENV !== "production";
    res.status(err.status || 500).json({
        message: isDev ? err.message : "An internal server error occurred.",
    });
});

// ─── Database connection ────────────────────────────────────────────────────
await connectDB();

export default app;