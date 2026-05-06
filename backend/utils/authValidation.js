const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()[\]{}\-_=+\\|;:'",.<>/?`~]).{8,64}$/;
const PHONE_REGEX = /^\+?[0-9]{7,15}$/;

export const isValidEmail = (email = "") => EMAIL_REGEX.test(email.trim());

export const normalizePhone = (phone = "") => {
  const trimmed = phone.trim();
  if (!trimmed) return "";

  const hasPlus = trimmed.startsWith("+");
  const digitsOnly = trimmed.replace(/\D/g, "");
  return hasPlus ? `+${digitsOnly}` : digitsOnly;
};

export const isValidPhone = (phone = "") => PHONE_REGEX.test(phone.trim());

export const getPasswordValidationMessage = (password = "") => {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (password.length > 64) return "Password must be at most 64 characters";
  if (/\s/.test(password)) return "Password cannot contain spaces";

  if (!PASSWORD_REGEX.test(password)) {
    return "Password must include uppercase, lowercase, number, and special character";
  }

  return "";
};
