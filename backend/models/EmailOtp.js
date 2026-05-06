import mongoose from "mongoose";

const emailOtpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    otpHash: {
      type: String,
      required: true,
      select: false,
    },
    otpExpiresAt: {
      type: Date,
      required: true,
      select: false,
    },
    attempts: {
      type: Number,
      default: 0,
      select: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verificationTokenHash: {
      type: String,
      select: false,
    },
    verificationTokenExpiresAt: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true },
);

const EmailOtp = mongoose.model("EmailOtp", emailOtpSchema);

export default EmailOtp;
