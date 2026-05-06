import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  sendPhoneOtp,
  verifyPhoneOtp,
  sendEmailOtp,
  verifyEmailOtp,
  resetPassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { createRateLimiter } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();
const authOtpLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: "Too many OTP requests. Please try again later.",
});
const authResetLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 6,
  message: "Too many password reset attempts. Please try again later.",
});

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/send-phone-otp", authOtpLimiter, sendPhoneOtp);
router.post("/verify-phone-otp", authOtpLimiter, verifyPhoneOtp);
router.post("/send-email-otp", authOtpLimiter, sendEmailOtp);
router.post("/verify-email-otp", authOtpLimiter, verifyEmailOtp);
router.post("/forgot-password", authResetLimiter, forgotPassword);
router.put("/reset-password/:token", authResetLimiter, resetPassword);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

export default router;
