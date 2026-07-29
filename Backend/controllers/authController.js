import jwt from 'jsonwebtoken';
import User from "../models/User.js";
import Poll from "../models/Poll.js";
import Comment from "../models/Comment.js";
import { uploadToCloudinary } from "../config/cloudinary.js";
import { generateOtp, otpExpiry, otpValid } from "../utils/otp.js";
import { sendOtpEmail } from "../config/mailer.js";

const makeToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: "7d" });

const clean = (u) => ({
    _id: u._id,
    name: u.name,
    email: u.email,
    username: u.username,
    avatar: u.avatar,
    bio: u.bio
});

// Register user
export const registerUser = async (req, res) => {
    try {
        const { name, email, username, password } = req.body;
        if (!name || !email || !username || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const exist = await User.findOne({ $or: [{ email }, { username }] });
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
            name,
            email,
            username,
            password,
            avatar,
            otp,
            otpExpires: otpExpiry()
        });

        try {
            await sendOtpEmail(email, otp, "verify your Pollify account");
        } catch (e) {
            console.warn("Email send skipped:", e.message);
        }

        res.status(201).json({
            needsVerification: true,
            email
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Verify OTP
export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!user.isVerified && !otpValid(user, otp)) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.json({
            token: makeToken(user._id),
            user: clean(user)
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Resend OTP
export const resendOtp = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json({ message: "User not found" });

        user.otp = generateOtp();
        user.otpExpires = otpExpiry();
        await user.save();

        try {
            await sendOtpEmail(user.email, user.otp, "verify your Pollify account");
        } catch (e) {
            console.warn("Email send skipped:", e.message);
        }

        res.json({ message: "OTP SENT" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Login user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        if (!user.isVerified) {
            return res.status(403).json({
                message: "Please verify your email first",
                needsVerification: true,
                email
            });
        }

        res.json({
            token: makeToken(user._id),
            user: clean(user)
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update profile
export const updateProfile = async (req, res) => {
    try {
        const { name, username, bio } = req.body;
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (username && username !== user.username) {
            const taken = await User.findOne({ username });
            if (taken) return res.status(400).json({ message: "Username already taken" });
            user.username = username;
        }
        if (name) user.name = name;
        if (bio !== undefined) user.bio = bio;

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
        res.status(500).json({ message: err.message });
    }
};

// Change password
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!newPassword || newPassword.length < 8) {
            return res.status(400).json({ message: "New Password must be at least 8 characters" });
        }

        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!(await user.comparePassword(currentPassword))) {
            return res.status(400).json({ message: "Current Password is incorrect" });
        }

        user.password = newPassword;
        await user.save();
        res.json({ message: "Password updated" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete account
export const deleteAccount = async (req, res) => {
    try {
        const id = req.userId;
        const myPolls = await Poll.find({ creator: id }).select("_id");
        const pollIds = myPolls.map((p) => p._id);

        await Comment.deleteMany({ $or: [{ user: id }, { poll: { $in: pollIds } }] });
        await Poll.deleteMany({ creator: id });
        await Poll.updateMany({}, { $pull: { votes: { user: id } } });
        await User.findByIdAndDelete(id);

        res.json({ message: "Account Deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get current user details
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const [created, voted] = await Promise.all([
            Poll.countDocuments({ creator: user._id }),
            Poll.countDocuments({ "votes.user": user._id })
        ]);

        res.json({
            user: clean(user),
            stats: {
                created,
                voted,
                bookmarked: user.bookmarks ? user.bookmarks.length : 0
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};