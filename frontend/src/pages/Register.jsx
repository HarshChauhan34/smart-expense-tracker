import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, UserPlus, Wallet } from "lucide-react";
import toast from "react-hot-toast";
import {
  register,
  sendPhoneOtp,
  verifyPhoneOtp,
  sendEmailOtp,
  verifyEmailOtp,
} from "../services/authService";
import { useAuth } from "../context/AuthContext";
import {
  getPasswordValidationMessage,
  isValidEmail,
  isValidPhone,
  normalizePhone,
} from "../utils/authValidation";

function Register() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailVerificationToken, setEmailVerificationToken] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneVerificationToken, setPhoneVerificationToken] = useState("");
  const [emailOtpRequested, setEmailOtpRequested] = useState(false);
  const [phoneOtpRequested, setPhoneOtpRequested] = useState(false);
  const [emailOtpSending, setEmailOtpSending] = useState(false);
  const [phoneOtpSending, setPhoneOtpSending] = useState(false);
  const [emailOtpVerifying, setEmailOtpVerifying] = useState(false);
  const [phoneOtpVerifying, setPhoneOtpVerifying] = useState(false);

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      setPhoneVerified(false);
      setPhoneVerificationToken("");
      setPhoneOtp("");
      setPhoneOtpRequested(false);
    }

    if (name === "email") {
      setEmailVerified(false);
      setEmailVerificationToken("");
      setEmailOtp("");
      setEmailOtpRequested(false);
      setPhoneVerified(false);
      setPhoneVerificationToken("");
      setPhoneOtp("");
      setPhoneOtpRequested(false);
    }

    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSendEmailOtp = async () => {
    const normalizedEmail = form.email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setEmailOtpSending(true);
      await sendEmailOtp({ email: normalizedEmail });
      setEmailOtpRequested(true);
      toast.success("OTP sent to your email");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setEmailOtpSending(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    const normalizedEmail = form.email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!emailOtp.trim()) {
      toast.error("Please enter OTP");
      return;
    }

    try {
      setEmailOtpVerifying(true);
      const res = await verifyEmailOtp({ email: normalizedEmail, otp: emailOtp });
      setEmailVerificationToken(res.data.emailVerificationToken);
      setEmailVerified(true);
      toast.success("Email verified");
    } catch (error) {
      setEmailVerified(false);
      setEmailVerificationToken("");
      toast.error(error.response?.data?.message || "OTP verification failed");
    } finally {
      setEmailOtpVerifying(false);
    }
  };

  const handleSendPhoneOtp = async () => {
    const normalizedPhone = normalizePhone(form.phone);
    const normalizedEmail = form.email.trim().toLowerCase();

    if (!isValidPhone(normalizedPhone)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setPhoneOtpSending(true);
      await sendPhoneOtp({ phone: normalizedPhone, email: normalizedEmail });
      setPhoneOtpRequested(true);
      toast.success("OTP sent to your email");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setPhoneOtpSending(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    const normalizedPhone = normalizePhone(form.phone);

    if (!isValidPhone(normalizedPhone)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    if (!phoneOtp.trim()) {
      toast.error("Please enter OTP");
      return;
    }

    try {
      setPhoneOtpVerifying(true);
      const res = await verifyPhoneOtp({ phone: normalizedPhone, otp: phoneOtp });
      setPhoneVerificationToken(res.data.phoneVerificationToken);
      setPhoneVerified(true);
      toast.success("Phone number verified");
    } catch (error) {
      setPhoneVerified(false);
      setPhoneVerificationToken("");
      toast.error(error.response?.data?.message || "OTP verification failed");
    } finally {
      setPhoneOtpVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.phone || !form.password) {
      toast.error("All fields are required");
      return;
    }

    if (!isValidEmail(form.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    const normalizedPhone = normalizePhone(form.phone);
    if (!isValidPhone(normalizedPhone)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    if (!emailVerified || !emailVerificationToken) {
      toast.error("Please verify your email with OTP");
      return;
    }

    if (!phoneVerified || !phoneVerificationToken) {
      toast.error("Please verify your phone number with OTP");
      return;
    }

    const passwordValidationMessage = getPasswordValidationMessage(form.password);
    if (passwordValidationMessage) {
      toast.error(passwordValidationMessage);
      return;
    }

    try {
      setLoading(true);

      const res = await register({
        ...form,
        phone: normalizedPhone,
        phoneVerificationToken,
        emailVerificationToken,
      });

      loginUser(res.data);
      toast.success("Account created successfully");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Register failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-amber-100 via-white to-lime-100 px-4 py-8 dark:from-slate-950 dark:via-amber-950 dark:to-slate-900">
      <div className="pointer-events-none absolute -left-20 top-14 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl dark:bg-amber-500/20" />
      <div className="pointer-events-none absolute -bottom-16 right-0 h-64 w-64 rounded-full bg-lime-200/40 blur-3xl dark:bg-lime-500/20" />

      <div className="grid w-full max-w-5xl overflow-hidden rounded-4xl border border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 md:grid-cols-2">
        <div className="hidden bg-linear-to-br from-amber-600 via-orange-600 to-lime-600 p-10 text-white md:block">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/20 p-3">
              <Wallet size={32} />
            </div>
            <h1 className="text-2xl font-bold">SpendSense AI</h1>
          </div>

          <div className="mt-20">
            <h2 className="text-4xl font-bold leading-tight">
              Build stronger habits, one transaction at a time.
            </h2>
            <p className="mt-5 text-white/80">
              Manage income, expenses, savings, and monthly reports in one clean
              dashboard.
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <UserPlus />
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Create Account
            </h2>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Start tracking your money today
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              className="input"
              type="text"
              name="name"
              placeholder="Full name"
              value={form.name}
              onChange={handleChange}
            />

            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  className="input"
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={handleSendEmailOtp}
                  disabled={emailOtpSending}
                  className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-slate-800 dark:text-slate-200"
                >
                  {emailOtpSending ? "Sending..." : "Send OTP"}
                </button>
              </div>

              {emailOtpRequested ? (
                <div className="flex gap-2">
                  <input
                    className="input"
                    type="text"
                    placeholder="Enter Email OTP"
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyEmailOtp}
                    disabled={emailOtpVerifying}
                    className="rounded-xl bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-emerald-900/30 dark:text-emerald-300"
                  >
                    {emailOtpVerifying ? "Verifying..." : "Verify OTP"}
                  </button>
                </div>
              ) : null}

              {emailVerified ? (
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  New email verified with OTP
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  className="input"
                  type="tel"
                  name="phone"
                  placeholder="Phone number"
                  value={form.phone}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={handleSendPhoneOtp}
                  disabled={phoneOtpSending}
                  className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-slate-800 dark:text-slate-200"
                >
                  {phoneOtpSending ? "Sending..." : "Send OTP"}
                </button>
              </div>

              {phoneOtpRequested ? (
                <div className="flex gap-2">
                  <input
                    className="input"
                    type="text"
                    placeholder="Enter Phone OTP"
                    value={phoneOtp}
                    onChange={(e) => setPhoneOtp(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyPhoneOtp}
                    disabled={phoneOtpVerifying}
                    className="rounded-xl bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-emerald-900/30 dark:text-emerald-300"
                  >
                    {phoneOtpVerifying ? "Verifying..." : "Verify OTP"}
                  </button>
                </div>
              ) : null}

              {phoneVerified ? (
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  New phone number verified with OTP
                </p>
              ) : null}
            </div>

            <div className="relative">
              <input
                className="input pr-12"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              disabled={loading}
              className="w-full rounded-2xl bg-amber-600 px-5 py-3 font-bold text-white shadow-lg shadow-amber-600/30 transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-amber-700 hover:text-amber-800 dark:text-amber-300 dark:hover:text-amber-200"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
