import User from "../models/User.js";
import { sendOtpEmail } from "../config/mailer.js";
import { generateOtp, otpExpiry, otpValid } from "../utils/otp.js";

// if user forgot the password send an email OTP
export const forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json({
            message: "No account with this email"
        });

        user.otp = generateOtp();
        user.otpExpires = otpExpiry();

        await user.save();
        try {
            await sendOtpEmail(user.email, user.otp, "reset your Pollify password");
        } catch (e) {
            console.warn("Email send skipped:", e.message);
        }

        res.json({
            message: "OTP sent to your email"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const verifyResetOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({
            message: "User not found"
        });

        if (!otpValid(user, otp)) return res.status(400).json({
            message: "Invalid or expired OTP"
        });
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// to reset the password
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, password } = req.body;
        if (!password || password.length < 8)
            return res.status(400).json({
                message: "Password must be at least of 8 characters"
            });
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({
            message: "User not found"
        });

        if (!otpValid(user, otp)) return res.status(400).json({
            message: "Invalid or expired OTP"
        });

        user.password = password;
        user.otp = undefined;
        user.otpExpires = undefined;
        user.isVerified = true;
        await user.save();
        res.json({ message: "Password reset successful" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
