import crypto from "crypto";

// Cryptographically secure 6-digit OTP (crypto.randomInt is CSPRNG)
export const generateOtp = () => String(crypto.randomInt(100000, 1000000));

// OTP expires in 10 minutes
export const otpExpiry = () => new Date(Date.now() + 10 * 60 * 1000);

// Constant-time comparison to prevent timing attacks
export const otpValid = (user, otp) => {
    if (!user.otp || !user.otpExpires || user.otpExpires < new Date()) return false;
    try {
        const a = Buffer.from(String(user.otp), "utf8");
        const b = Buffer.from(String(otp), "utf8");
        // timingSafeEqual requires same-length buffers; length mismatch = invalid
        if (a.length !== b.length) return false;
        return crypto.timingSafeEqual(a, b);
    } catch {
        return false;
    }
};