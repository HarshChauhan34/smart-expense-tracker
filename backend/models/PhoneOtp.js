import mongoose from "mongoose";

const phoneOtpSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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
  { timestamps: true }
);

const PhoneOtp = mongoose.model("PhoneOtp", phoneOtpSchema);

export default PhoneOtp;

