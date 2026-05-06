import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import toast from "react-hot-toast";
import { resetPassword } from "../services/authService";
import { getPasswordValidationMessage } from "../utils/authValidation";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [show, setShow] = useState({ password: false, confirmPassword: false });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const passwordValidationMessage = getPasswordValidationMessage(form.password);
    if (passwordValidationMessage) {
      toast.error(passwordValidationMessage);
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Password and confirm password do not match");
      return;
    }

    try {
      setLoading(true);
      const res = await resetPassword(token, { password: form.password });
      toast.success(res.data?.message || "Password reset successful");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-tr from-amber-100 via-white to-rose-100 px-4 py-10 dark:from-slate-950 dark:via-slate-900 dark:to-rose-950">
      <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            <LockKeyhole />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            Reset Password
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Choose a new strong password for your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {["password", "confirmPassword"].map((field) => (
            <div key={field} className="relative">
              <input
                className="input pr-12"
                type={show[field] ? "text" : "password"}
                placeholder={
                  field === "password" ? "New password" : "Confirm password"
                }
                value={form[field]}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, [field]: e.target.value }))
                }
              />
              <button
                type="button"
                onClick={() => setShow((prev) => ({ ...prev, [field]: !prev[field] }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {show[field] ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          ))}

          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
          Back to{" "}
          <Link to="/login" className="font-semibold text-amber-700">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ResetPassword;

