import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, Wallet } from "lucide-react";
import toast from "react-hot-toast";
import { login } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { isValidEmail } from "../utils/authValidation";

function Login() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error("Email and password are required");
      return;
    }

    if (!isValidEmail(form.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      const res = await login(form);

      loginUser(res.data);
      toast.success("Login successful");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-cyan-100 via-white to-emerald-100 px-4 py-8 dark:from-slate-950 dark:via-cyan-950 dark:to-slate-900">
      <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-cyan-200/40 blur-3xl dark:bg-cyan-500/20" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-500/20" />

      <div className="grid w-full max-w-5xl overflow-hidden rounded-4xl border border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 md:grid-cols-2">
        <div className="hidden bg-linear-to-br from-cyan-700 via-slate-900 to-emerald-700 p-10 text-white md:block">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/20 p-3">
              <Wallet size={32} />
            </div>
            <h1 className="text-2xl font-bold">SpendSense AI</h1>
          </div>

          <div className="mt-20">
            <h2 className="text-4xl font-bold leading-tight">
              Welcome back. Your money story starts here.
            </h2>
            <p className="mt-5 text-white/80">
              Track every rupee, spot trends faster, and make confident choices.
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300">
              <LogIn />
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Login
            </h2>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Continue to SpendSense AI dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              className="input"
              type="email"
              name="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
            />

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

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-cyan-700 hover:text-cyan-800 dark:text-cyan-300 dark:hover:text-cyan-200"
              >
                Forgot password?
              </Link>
            </div>

            <button
              disabled={loading}
              className="w-full rounded-2xl bg-cyan-700 px-5 py-3 font-bold text-white shadow-lg shadow-cyan-700/30 transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            New user?{" "}
            <Link
              to="/register"
              className="font-semibold text-cyan-700 hover:text-cyan-800 dark:text-cyan-300 dark:hover:text-cyan-200"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
