import { useState } from "react";
import {
  Save,
  UserCircle,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import AppLayout from "../components/AppLayout";
import ConfirmDialog from "../components/ConfirmDialog";
import { useAuth } from "../context/AuthContext";
import {
  updateProfile,
  changePassword,
  sendPhoneOtp,
  verifyPhoneOtp,
  sendEmailOtp,
  verifyEmailOtp,
} from "../services/authService";
import {
  getPasswordValidationMessage,
  isValidEmail,
  isValidPhone,
  normalizePhone,
} from "../utils/authValidation";

function PasswordInput({
  label,
  name,
  value,
  placeholder,
  showPassword,
  togglePassword,
  onChange,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label}
      </label>

      <div className="relative">
        <input
          className="input pr-12"
          type={showPassword ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />

        <button
          type="button"
          onClick={togglePassword}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>
  );
}

function Profile() {
  const { user, loginUser } = useAuth();

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [passwordConfirmOpen, setPasswordConfirmOpen] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneVerificationToken, setPhoneVerificationToken] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailVerificationToken, setEmailVerificationToken] = useState("");
  const [phoneOtpRequested, setPhoneOtpRequested] = useState(false);
  const [emailOtpRequested, setEmailOtpRequested] = useState(false);
  const [phoneOtpSending, setPhoneOtpSending] = useState(false);
  const [emailOtpSending, setEmailOtpSending] = useState(false);
  const [phoneOtpVerifying, setPhoneOtpVerifying] = useState(false);
  const [emailOtpVerifying, setEmailOtpVerifying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const togglePassword = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

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
      const res = await verifyEmailOtp({
        email: normalizedEmail,
        otp: emailOtp,
      });
      setEmailVerified(true);
      setEmailVerificationToken(res.data.emailVerificationToken);
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

    if (!normalizedPhone || !isValidPhone(normalizedPhone)) {
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

    if (!normalizedPhone || !isValidPhone(normalizedPhone)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    if (!phoneOtp.trim()) {
      toast.error("Please enter OTP");
      return;
    }

    try {
      setPhoneOtpVerifying(true);
      const res = await verifyPhoneOtp({
        phone: normalizedPhone,
        otp: phoneOtp,
      });
      setPhoneVerified(true);
      setPhoneVerificationToken(res.data.phoneVerificationToken);
      toast.success("Phone number verified");
    } catch (error) {
      setPhoneVerified(false);
      setPhoneVerificationToken("");
      toast.error(error.response?.data?.message || "OTP verification failed");
    } finally {
      setPhoneOtpVerifying(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    if (!isValidEmail(form.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (form.phone.trim() && !isValidPhone(normalizePhone(form.phone))) {
      toast.error("Please enter a valid phone number");
      return;
    }

    const hasPhoneChanged = normalizePhone(form.phone) !== (user?.phone || "");
    const hasEmailChanged =
      form.email.trim().toLowerCase() !== (user?.email || "").toLowerCase();

    if (hasEmailChanged && !emailVerified) {
      toast.error("Please verify your new email with OTP");
      return;
    }

    if (hasPhoneChanged && !phoneVerified) {
      toast.error("Please verify your new phone number with email OTP");
      return;
    }

    setConfirmOpen(true);
  };

  const confirmUpdate = async () => {
    try {
      setLoading(true);

      const hasPhoneChanged =
        normalizePhone(form.phone) !== (user?.phone || "");
      const hasEmailChanged =
        form.email.trim().toLowerCase() !== (user?.email || "").toLowerCase();

      const res = await updateProfile({
        ...form,
        email: form.email.trim().toLowerCase(),
        phone: normalizePhone(form.phone),
        emailVerificationToken: hasEmailChanged
          ? emailVerificationToken
          : undefined,
        phoneVerificationToken: hasPhoneChanged
          ? phoneVerificationToken
          : undefined,
      });

      loginUser(res.data);
      toast.success("Profile updated successfully");
      setConfirmOpen(false);
      setPhoneVerified(false);
      setPhoneVerificationToken("");
      setPhoneOtp("");
      setPhoneOtpRequested(false);
      setEmailVerified(false);
      setEmailVerificationToken("");
      setEmailOtp("");
      setEmailOtpRequested(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Profile update failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      toast.error("All password fields are required");
      return;
    }

    const passwordValidationMessage = getPasswordValidationMessage(
      passwordForm.newPassword,
    );
    if (passwordValidationMessage) {
      toast.error(passwordValidationMessage);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    setPasswordConfirmOpen(true);
  };

  const confirmPasswordUpdate = async () => {
    try {
      setPasswordLoading(true);

      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      toast.success("Password changed successfully");

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setPasswordConfirmOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Password change failed");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                <UserCircle size={32} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Personal Information
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Update your basic account details
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Full Name
                </label>

                <div className="relative">
                  <input
                    className="input pl-12"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Email Address
                </label>

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      className="input"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Enter email address"
                    />
                    {form.email.trim().toLowerCase() !==
                    (user?.email || "").toLowerCase() ? (
                      <button
                        type="button"
                        onClick={handleSendEmailOtp}
                        disabled={emailOtpSending}
                        className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-slate-800 dark:text-slate-200"
                      >
                        {emailOtpSending ? "Sending..." : "Send OTP"}
                      </button>
                    ) : null}
                  </div>

                  {form.email.trim().toLowerCase() !==
                    (user?.email || "").toLowerCase() && emailOtpRequested ? (
                    <div className="flex gap-2">
                      <input
                        className="input"
                        value={emailOtp}
                        onChange={(e) => setEmailOtp(e.target.value)}
                        placeholder="Enter Email OTP"
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

                  {form.email.trim().toLowerCase() !==
                    (user?.email || "").toLowerCase() && emailVerified ? (
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      New email verified with OTP
                    </p>
                  ) : null}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Phone Number
                </label>

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      className="input"
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Phone number"
                    />
                    {normalizePhone(form.phone) !== (user?.phone || "") ? (
                      <button
                        type="button"
                        onClick={handleSendPhoneOtp}
                        disabled={phoneOtpSending}
                        className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-slate-800 dark:text-slate-200"
                      >
                        {phoneOtpSending ? "Sending..." : "Send OTP"}
                      </button>
                    ) : null}
                  </div>

                  {normalizePhone(form.phone) !== (user?.phone || "") &&
                  phoneOtpRequested ? (
                    <div className="flex gap-2">
                      <input
                        className="input"
                        value={phoneOtp}
                        onChange={(e) => setPhoneOtp(e.target.value)}
                        placeholder="Enter OTP"
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

                  {normalizePhone(form.phone) !== (user?.phone || "") &&
                  phoneVerified ? (
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      New phone number verified with OTP
                    </p>
                  ) : null}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-4 font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Save size={20} />
                {loading ? "Updating..." : "Update Profile"}
              </button>
            </form>
          </div>

          <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
                <KeyRound size={30} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Change Password
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Keep your account secure
                </p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <PasswordInput
                label="Current Password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                placeholder="Enter current password"
                showPassword={showPassword.currentPassword}
                togglePassword={() => togglePassword("currentPassword")}
                onChange={handlePasswordChange}
              />

              <PasswordInput
                label="New Password"
                name="newPassword"
                value={passwordForm.newPassword}
                placeholder="Enter new password"
                showPassword={showPassword.newPassword}
                togglePassword={() => togglePassword("newPassword")}
                onChange={handlePasswordChange}
              />

              <PasswordInput
                label="Confirm New Password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                placeholder="Confirm new password"
                showPassword={showPassword.confirmPassword}
                togglePassword={() => togglePassword("confirmPassword")}
                onChange={handlePasswordChange}
              />

              <button
                type="submit"
                disabled={passwordLoading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 px-5 py-4 font-bold text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <ShieldCheck size={20} />
                {passwordLoading ? "Changing..." : "Change Password"}
              </button>
            </form>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Update Profile?"
        message="Are you sure you want to update your profile information?"
        confirmText="Yes, Update"
        type="info"
        loading={loading}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmUpdate}
      />

      <ConfirmDialog
        open={passwordConfirmOpen}
        title="Change Password?"
        message="Are you sure you want to change your account password?"
        confirmText="Yes, Change"
        type="info"
        loading={passwordLoading}
        onCancel={() => setPasswordConfirmOpen(false)}
        onConfirm={confirmPasswordUpdate}
      />
    </AppLayout>
  );
}

export default Profile;
