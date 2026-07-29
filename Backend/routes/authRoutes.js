import express from 'express';
import { upload } from '../config/cloudinary.js';
import { protect } from '../middleware/auth.js';
import {
    registerUser,
    verifyOtp,
    resendOtp,
    login,
    updateProfile,
    changePassword,
    deleteAccount,
    getMe
} from '../controllers/authController.js';
import {
    forgotPassword,
    verifyResetOtp,
    resetPassword
} from '../controllers/passwordController.js';

const authRouter = express.Router();

authRouter.post('/register', upload.single("image"), registerUser);
authRouter.post('/verify-otp', verifyOtp);
authRouter.post('/resend-otp', resendOtp);

authRouter.post('/login', login);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/verify-reset-otp', verifyResetOtp);
authRouter.post('/reset-password', resetPassword);

authRouter.get('/me', protect, getMe);
authRouter.patch('/profile', protect, upload.single("image"), updateProfile);
authRouter.patch('/password', protect, changePassword);
authRouter.delete('/account', protect, deleteAccount);

export default authRouter;