import { useState } from "react";
import { Link } from "react-router-dom";
import { KeyRound } from "lucide-react";
import toast from "react-hot-toast";
import { forgotPassword } from "../services/authService";
import { isValidEmail } from "../utils/authValidation";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      await forgotPassword({ email });
      setSubmitted(true);
      toast.success("If your account exists, a reset email has been sent");
    } catch (error) {
      toast.error(error.response?.data?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-cyan-100 via-white to-blue-100 px-4 py-10 dark:from-slate-950 dark:via-slate-900 dark:to-cyan-950">
      <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300">
            <KeyRound />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            Forgot Password
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Enter your email and we will send a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="email"
              className="input pl-11"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Submitting..." : "Send Reset Link"}
          </button>
        </form>

        {submitted ? (
          <p className="mt-4 text-center text-sm text-emerald-600 dark:text-emerald-400">
            If your account exists, check your email for the reset link.
          </p>
        ) : null}

        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
          Remembered password?{" "}
          <Link to="/login" className="font-semibold text-cyan-700">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
