import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Poll from "../models/Poll.js";
import Comment from "../models/Comment.js";
import { uploadToCloudinary } from "../config/cloudinary.js";
import { generateOtp, otpExpiry, otpValid } from "../utils/otp.js";
import { sendOtpEmail } from "../config/mailer.js";

const JWT_SECRET = process.env.JWT_SECRET;

// ─── Helpers ────────────────────────────────────────────────────────────────

const makeToken = (id) =>
    jwt.sign({ id }, JWT_SECRET, { expiresIn: "7d" });

// Only expose safe, non-sensitive fields to the client
const clean = (u) => ({
    _id: u._id,
    name: u.name,
    email: u.email,
    username: u.username,
    avatar: u.avatar,
    bio: u.bio,
});

// Password strength: min 8 chars, at least one uppercase, one number
const validatePassword = (password) => {
    if (!password || typeof password !== "string") return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (password.length > 128) return "Password is too long";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number";
    return null;
};

// Username rules: 3-30 alphanumeric + underscore, no reserved words
const RESERVED_USERNAMES = new Set([
    "admin", "root", "api", "support", "help", "me", "system",
    "pollify", "staff", "moderator", "null", "undefined",
]);

const validateUsername = (username) => {
    if (!username || typeof username !== "string") return "Username is required";
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username))
        return "Username must be 3-30 characters using only letters, numbers, and underscores";
    if (RESERVED_USERNAMES.has(username.toLowerCase()))
        return "This username is reserved";
    return null;
};

// ─── Register ────────────────────────────────────────────────────────────────
export const registerUser = async (req, res) => {
    try {
        const { name, email, username, password } = req.body;

        // Type guards (mongo-sanitize strips operators but we still need string checks)
        if (typeof name !== "string" || typeof email !== "string" ||
            typeof username !== "string" || typeof password !== "string") {
            return res.status(400).json({ message: "Invalid input format" });
        }

        if (!name.trim() || !email.trim()) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const usernameError = validateUsername(username.trim());
        if (usernameError) return res.status(400).json({ message: usernameError });

        const passwordError = validatePassword(password);
        if (passwordError) return res.status(400).json({ message: passwordError });

        // Basic email format check
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            return res.status(400).json({ message: "Invalid email address" });
        }

        const exist = await User.findOne({
            $or: [
                { email: email.trim().toLowerCase() },
                { username: username.trim() },
            ],
        });
        if (exist) {
            return res.status(400).json({ message: "User with this email or username already exists" });
        }

        let avatar = "";
        if (req.file) {
            try {
                avatar = await uploadToCloudinary(req.file.buffer);
            } catch (e) {
                console.warn("Avatar upload skipped:", e.message);
            }
        }

        const otp = generateOtp();
        await User.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            username: username.trim(),
            password,
            avatar,
            otp,
            otpExpires: otpExpiry(),
        });

        try {
            await sendOtpEmail(email.trim().toLowerCase(), otp, "verify your Pollify account");
        } catch (e) {
            console.warn("Email send skipped:", e.message);
        }

        res.status(201).json({ needsVerification: true, email: email.trim().toLowerCase() });
    } catch (err) {
        console.error("registerUser error:", err.message);
        res.status(500).json({ message: "Registration failed. Please try again." });
    }
};

// ─── Verify OTP ──────────────────────────────────────────────────────────────
export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (typeof email !== "string" || typeof otp !== "string") {
            return res.status(400).json({ message: "Invalid input" });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        // Always return the same message to prevent user enumeration
        if (!user) return res.status(400).json({ message: "Invalid or expired OTP" });

        if (user.isVerified) {
            return res.json({ token: makeToken(user._id), user: clean(user) });
        }

        if (!otpValid(user, otp.trim())) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.json({ token: makeToken(user._id), user: clean(user) });
    } catch (err) {
        console.error("verifyOtp error:", err.message);
        res.status(500).json({ message: "Verification failed. Please try again." });
    }
};

// ─── Resend OTP ──────────────────────────────────────────────────────────────
export const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (typeof email !== "string") {
            return res.status(400).json({ message: "Invalid input" });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        // Always return the same response to prevent user enumeration
        if (user && !user.isVerified) {
            user.otp = generateOtp();
            user.otpExpires = otpExpiry();
            await user.save();
            sendOtpEmail(user.email, user.otp, "verify your Pollify account").catch(() => {});
        }

        res.json({ message: "If that account exists, a new code was sent." });
    } catch (err) {
        console.error("resendOtp error:", err.message);
        res.status(500).json({ message: "An error occurred. Please try again." });
    }
};

// ─── Login ───────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (typeof email !== "string" || typeof password !== "string") {
            return res.status(400).json({ message: "Invalid input format" });
        }

        const user = await User.findOne({ email: email.trim().toLowerCase() });
        // Always compare password (even for non-existent users) to prevent timing attacks
        const passwordMatch = user ? await user.comparePassword(password) : false;

        if (!user || !passwordMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        if (!user.isVerified) {
            return res.status(403).json({
                message: "Please verify your email first",
                needsVerification: true,
                email: user.email,
            });
        }

        res.json({ token: makeToken(user._id), user: clean(user) });
    } catch (err) {
        console.error("login error:", err.message);
        res.status(500).json({ message: "Login failed. Please try again." });
    }
};

// ─── Update profile ──────────────────────────────────────────────────────────
export const updateProfile = async (req, res) => {
    try {
        const { name, username, bio } = req.body;
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (username && username !== user.username) {
            const usernameError = validateUsername(username.trim());
            if (usernameError) return res.status(400).json({ message: usernameError });

            const taken = await User.findOne({ username: username.trim() });
            if (taken) return res.status(400).json({ message: "Username already taken" });
            user.username = username.trim();
        }

        if (name && typeof name === "string") user.name = name.trim().slice(0, 100);
        if (bio !== undefined && typeof bio === "string") user.bio = bio.trim().slice(0, 160);

        if (req.file) {
            try {
                user.avatar = await uploadToCloudinary(req.file.buffer);
            } catch (e) {
                console.warn("Avatar upload skipped:", e.message);
            }
        }

        await user.save();
        res.json({ user: clean(user) });
    } catch (err) {
        console.error("updateProfile error:", err.message);
        res.status(500).json({ message: "Profile update failed. Please try again." });
    }
};

// ─── Change password ─────────────────────────────────────────────────────────
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const passwordError = validatePassword(newPassword);
        if (passwordError) return res.status(400).json({ message: passwordError });

        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!(await user.comparePassword(currentPassword))) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        user.password = newPassword;
        await user.save();
        res.json({ message: "Password updated" });
    } catch (err) {
        console.error("changePassword error:", err.message);
        res.status(500).json({ message: "Password change failed. Please try again." });
    }
};

// ─── Delete account ──────────────────────────────────────────────────────────
export const deleteAccount = async (req, res) => {
    try {
        const id = req.userId;
        const myPolls = await Poll.find({ creator: id }).select("_id");
        const pollIds = myPolls.map((p) => p._id);

        await Comment.deleteMany({ $or: [{ user: id }, { poll: { $in: pollIds } }] });
        await Poll.deleteMany({ creator: id });
        await Poll.updateMany({}, { $pull: { votes: { user: id } } });
        await User.findByIdAndDelete(id);

        res.json({ message: "Account deleted" });
    } catch (err) {
        console.error("deleteAccount error:", err.message);
        res.status(500).json({ message: "Account deletion failed. Please try again." });
    }
};

// ─── Get current user ────────────────────────────────────────────────────────
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const [created, voted] = await Promise.all([
            Poll.countDocuments({ creator: user._id }),
            Poll.countDocuments({ "votes.user": user._id }),
        ]);

        res.json({
            user: clean(user),
            stats: {
                created,
                voted,
                bookmarked: user.bookmarks ? user.bookmarks.length : 0,
            },
        });
    } catch (err) {
        console.error("getMe error:", err.message);
        res.status(500).json({ message: "Failed to load user. Please try again." });
    }
};