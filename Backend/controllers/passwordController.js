import User from "../models/User.js";
import { sendOtpEmail } from "../config/mailer.js";
import { generateOtp, otpExpiry, otpValid } from "../utils/otp.js";

// Password strength validator (mirrored from authController for DRY consistency)
const validatePassword = (password) => {
    if (!password || typeof password !== "string") return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (password.length > 128) return "Password is too long";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number";
    return null;
};

// ─── Forgot password ─────────────────────────────────────────────────────────
// Always returns the same response to prevent email enumeration
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (typeof email !== "string") {
            return res.status(400).json({ message: "Invalid input" });
        }

        const user = await User.findOne({ email: email.trim().toLowerCase() });

        // Process silently — never reveal whether the email exists
        if (user) {
            user.otp = generateOtp();
            user.otpExpires = otpExpiry();
            await user.save();
            sendOtpEmail(user.email, user.otp, "reset your Pollify password").catch(() => {});
        }

        // Same message regardless of whether user was found
        res.json({ message: "If that email has an account, a reset code was sent." });
    } catch (error) {
        console.error("forgotPassword error:", error.message);
        res.status(500).json({ message: "An error occurred. Please try again." });
    }
};

// ─── Verify reset OTP ────────────────────────────────────────────────────────
export const verifyResetOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (typeof email !== "string" || typeof otp !== "string") {
            return res.status(400).json({ message: "Invalid input" });
        }

        const user = await User.findOne({ email: email.trim().toLowerCase() });

        // Uniform error — no enumeration
        if (!user || !otpValid(user, otp.trim())) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        res.json({ ok: true });
    } catch (err) {
        console.error("verifyResetOtp error:", err.message);
        res.status(500).json({ message: "An error occurred. Please try again." });
    }
};

// ─── Reset password ──────────────────────────────────────────────────────────
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, password } = req.body;
        if (typeof email !== "string" || typeof otp !== "string") {
            return res.status(400).json({ message: "Invalid input" });
        }

        const passwordError = validatePassword(password);
        if (passwordError) return res.status(400).json({ message: passwordError });

        const user = await User.findOne({ email: email.trim().toLowerCase() });

        // Uniform error — no enumeration
        if (!user || !otpValid(user, otp.trim())) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        user.password = password;
        user.otp = undefined;
        user.otpExpires = undefined;
        // NOTE: Do NOT set isVerified here — password reset is not email verification
        await user.save();

        res.json({ message: "Password reset successful" });
    } catch (err) {
        console.error("resetPassword error:", err.message);
        res.status(500).json({ message: "Password reset failed. Please try again." });
    }
};
