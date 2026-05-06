import User from "../models/User.js";
import PhoneOtp from "../models/PhoneOtp.js";
import EmailOtp from "../models/EmailOtp.js";
import generateToken from "../utils/generateToken.js";
import crypto from "crypto";
import {
  getPasswordValidationMessage,
  isValidEmail,
  isValidPhone,
  normalizePhone,
} from "../utils/authValidation.js";
import {
  sendPasswordResetEmail,
  sendPhoneOtpEmail,
  sendEmailOtpEmail,
} from "../utils/sendEmail.js";

const hashValue = (value) =>
  crypto.createHash("sha256").update(value).digest("hex");

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));
const trimTrailingSlash = (value = "") => value.replace(/\/+$/, "");
const pickFrontendAppUrl = () => {
  const preferred =
    process.env.FRONTEND_APP_URL ||
    process.env.PUBLIC_APP_URL ||
    process.env.FRONTEND_URL ||
    "http://localhost:5173";

  const firstCandidate = preferred
    .split(",")
    .map((item) => item.trim())
    .find(Boolean);

  return trimTrailingSlash(firstCandidate || "http://localhost:5173");
};

export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      phoneVerificationToken,
      emailVerificationToken,
    } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedPhone = normalizePhone(phone ?? "");

    if (
      !name ||
      !email ||
      !password ||
      !normalizedPhone ||
      !phoneVerificationToken ||
      !emailVerificationToken
    ) {
      return res.status(400).json({
        message:
          "Name, email, password, phone, phone verification, and email verification are required",
      });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    if (!isValidPhone(normalizedPhone)) {
      return res.status(400).json({
        message: "Please enter a valid phone number",
      });
    }

    const passwordValidationMessage = getPasswordValidationMessage(password);
    if (passwordValidationMessage) {
      return res.status(400).json({
        message: passwordValidationMessage,
      });
    }

    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const phoneExists = await User.findOne({ phone: normalizedPhone });
    if (phoneExists) {
      return res.status(400).json({
        message: "Phone number already in use",
      });
    }

    const phoneOtpRecord = await PhoneOtp.findOne({
      phone: normalizedPhone,
      verified: true,
      verificationTokenHash: hashValue(phoneVerificationToken),
      verificationTokenExpiresAt: { $gt: new Date() },
    }).select("+verificationTokenHash +verificationTokenExpiresAt");

    if (!phoneOtpRecord) {
      return res.status(400).json({
        message: "Phone verification is invalid or expired",
      });
    }

    const emailOtpRecord = await EmailOtp.findOne({
      email: normalizedEmail,
      verified: true,
      verificationTokenHash: hashValue(emailVerificationToken),
      verificationTokenExpiresAt: { $gt: new Date() },
    }).select("+verificationTokenHash +verificationTokenExpiresAt");

    if (!emailOtpRecord) {
      return res.status(400).json({
        message: "Email verification is invalid or expired",
      });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      phone: normalizedPhone,
      password,
    });

    await PhoneOtp.deleteOne({ _id: phoneOtpRecord._id });
    await EmailOtp.deleteOne({ _id: emailOtpRecord._id });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Register failed",
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password"
    );

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Login failed",
    });
  }
};

export const getProfile = async (req, res) => {
  res.json(req.user);
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, phoneVerificationToken, emailVerificationToken } =
      req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedPhone = normalizePhone(phone ?? "");

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (email && !isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    if (normalizedEmail && normalizedEmail !== user.email) {
      const emailExists = await User.findOne({ email: normalizedEmail });

      if (emailExists) {
        return res.status(400).json({
          message: "Email already in use",
        });
      }
    }

    const isEmailChanged =
      email !== undefined && normalizedEmail && normalizedEmail !== user.email;

    if (isEmailChanged) {
      if (!emailVerificationToken) {
        return res.status(400).json({
          message: "Please verify your new email address with OTP",
        });
      }

      const emailOtpRecord = await EmailOtp.findOne({
        email: normalizedEmail,
        verified: true,
        verificationTokenHash: hashValue(emailVerificationToken),
        verificationTokenExpiresAt: { $gt: new Date() },
      }).select("+verificationTokenHash +verificationTokenExpiresAt");

      if (!emailOtpRecord) {
        return res.status(400).json({
          message: "Email verification is invalid or expired",
        });
      }

      await EmailOtp.deleteOne({ _id: emailOtpRecord._id });
    }

    if (phone && !isValidPhone(normalizedPhone)) {
      return res.status(400).json({
        message: "Please enter a valid phone number",
      });
    }

    const isPhoneChanged =
      phone !== undefined && normalizedPhone !== (user.phone || "");

    if (isPhoneChanged) {
      const phoneExists = await User.findOne({ phone: normalizedPhone });
      if (phoneExists && String(phoneExists._id) !== String(user._id)) {
        return res.status(400).json({
          message: "Phone number already in use",
        });
      }

      if (!phoneVerificationToken) {
        return res.status(400).json({
          message: "Please verify your new phone number with OTP",
        });
      }

      const phoneOtpRecord = await PhoneOtp.findOne({
        phone: normalizedPhone,
        verified: true,
        verificationTokenHash: hashValue(phoneVerificationToken),
        verificationTokenExpiresAt: { $gt: new Date() },
      }).select("+verificationTokenHash +verificationTokenExpiresAt");

      if (!phoneOtpRecord) {
        return res.status(400).json({
          message: "Phone verification is invalid or expired",
        });
      }

      await PhoneOtp.deleteOne({ _id: phoneOtpRecord._id });
    }

    user.name = name || user.name;
    user.email = normalizedEmail || user.email;
    user.phone = phone !== undefined ? normalizedPhone : user.phone;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      token: req.headers.authorization.split(" ")[1],
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Profile update failed",
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    const passwordValidationMessage = getPasswordValidationMessage(newPassword);
    if (passwordValidationMessage) {
      return res.status(400).json({
        message: passwordValidationMessage,
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Password change failed",
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    const user = await User.findOne({ email: normalizedEmail }).select(
      "+passwordResetToken +passwordResetExpires"
    );

    const genericMessage =
      "If an account exists with that email, a reset link has been generated.";

    if (!user) {
      return res.json({ message: genericMessage });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.passwordResetToken = hashedResetToken;
    user.passwordResetExpires = new Date(Date.now() + 1000 * 60 * 15);
    await user.save();

    const frontendUrl = pickFrontendAppUrl();
    const resetLink = `${frontendUrl}/reset-password/${resetToken}`;

    const emailStatus = await sendPasswordResetEmail({
      to: normalizedEmail,
      resetLink,
    });

    if (!emailStatus.sent) {
      return res.status(500).json({
        message:
          "Password reset email service is not configured. Please contact support.",
      });
    }

    res.json({
      message: genericMessage,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to process forgot password request",
    });
  }
};

export const sendPhoneOtp = async (req, res) => {
  try {
    const { phone, email } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedPhone = normalizePhone(phone ?? "");

    if (!normalizedPhone || !isValidPhone(normalizedPhone)) {
      return res.status(400).json({
        message: "Please enter a valid phone number",
      });
    }

    if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    const phoneExists = await User.findOne({ phone: normalizedPhone });
    if (phoneExists) {
      return res.status(400).json({
        message: "Phone number already in use",
      });
    }

    const otp = generateOtp();
    const otpHash = hashValue(otp);

    await PhoneOtp.findOneAndUpdate(
      { phone: normalizedPhone },
      {
        phone: normalizedPhone,
        otpHash,
        otpExpiresAt: new Date(Date.now() + 1000 * 60 * 10),
        attempts: 0,
        verified: false,
        verificationTokenHash: undefined,
        verificationTokenExpiresAt: undefined,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const emailStatus = await sendPhoneOtpEmail({ to: normalizedEmail, otp });
    if (!emailStatus.sent) {
      return res.status(500).json({
        message: "Email OTP service is not configured. Please contact support.",
      });
    }

    res.json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to send OTP",
    });
  }
};

export const verifyPhoneOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const normalizedPhone = normalizePhone(phone ?? "");

    if (!normalizedPhone || !isValidPhone(normalizedPhone) || !otp) {
      return res.status(400).json({
        message: "Phone and OTP are required",
      });
    }

    const record = await PhoneOtp.findOne({
      phone: normalizedPhone,
      otpExpiresAt: { $gt: new Date() },
    }).select("+otpHash +otpExpiresAt +attempts");

    if (!record) {
      return res.status(400).json({
        message: "OTP expired or not found. Please request a new OTP.",
      });
    }

    if (record.attempts >= 5) {
      return res.status(429).json({
        message: "Too many invalid OTP attempts. Please request a new OTP.",
      });
    }

    const isOtpMatch = hashValue(String(otp).trim()) === record.otpHash;

    if (!isOtpMatch) {
      record.attempts += 1;
      await record.save();
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    record.verified = true;
    record.otpHash = hashValue("consumed");
    record.otpExpiresAt = new Date(Date.now() - 1000);
    record.verificationTokenHash = hashValue(verificationToken);
    record.verificationTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 20);
    record.attempts = 0;
    await record.save();

    res.json({
      message: "Phone verified successfully",
      phoneVerificationToken: verificationToken,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to verify OTP",
    });
  }
};

export const sendEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    const emailExists = await User.findOne({ email: normalizedEmail });
    if (emailExists) {
      return res.status(400).json({
        message: "Email already in use",
      });
    }

    const otp = generateOtp();
    const otpHash = hashValue(otp);

    await EmailOtp.findOneAndUpdate(
      { email: normalizedEmail },
      {
        email: normalizedEmail,
        otpHash,
        otpExpiresAt: new Date(Date.now() + 1000 * 60 * 10),
        attempts: 0,
        verified: false,
        verificationTokenHash: undefined,
        verificationTokenExpiresAt: undefined,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    const emailStatus = await sendEmailOtpEmail({ to: normalizedEmail, otp });
    if (!emailStatus.sent) {
      return res.status(500).json({
        message: "Email OTP service is not configured. Please contact support.",
      });
    }

    res.json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to send OTP",
    });
  }
};

export const verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !isValidEmail(normalizedEmail) || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const record = await EmailOtp.findOne({
      email: normalizedEmail,
      otpExpiresAt: { $gt: new Date() },
    }).select("+otpHash +otpExpiresAt +attempts");

    if (!record) {
      return res.status(400).json({
        message: "OTP expired or not found. Please request a new OTP.",
      });
    }

    if (record.attempts >= 5) {
      return res.status(429).json({
        message: "Too many invalid OTP attempts. Please request a new OTP.",
      });
    }

    const isOtpMatch = hashValue(String(otp).trim()) === record.otpHash;

    if (!isOtpMatch) {
      record.attempts += 1;
      await record.save();
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    record.verified = true;
    record.otpHash = hashValue("consumed");
    record.otpExpiresAt = new Date(Date.now() - 1000);
    record.verificationTokenHash = hashValue(verificationToken);
    record.verificationTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 20);
    record.attempts = 0;
    await record.save();

    res.json({
      message: "Email verified successfully",
      emailVerificationToken: verificationToken,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to verify OTP",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const passwordValidationMessage = getPasswordValidationMessage(password);
    if (passwordValidationMessage) {
      return res.status(400).json({
        message: passwordValidationMessage,
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select("+passwordResetToken +passwordResetExpires");

    if (!user) {
      return res.status(400).json({
        message: "Reset link is invalid or has expired",
      });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({
      message: "Password reset successful. Please login with your new password.",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Password reset failed",
    });
  }
};
