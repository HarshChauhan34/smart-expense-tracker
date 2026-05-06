import api from "./api";

export const register = (formData) => {
  return api.post("/auth/register", formData);
};

export const login = (formData) => {
  return api.post("/auth/login", formData);
};

export const sendPhoneOtp = (formData) => {
  return api.post("/auth/send-phone-otp", formData);
};

export const verifyPhoneOtp = (formData) => {
  return api.post("/auth/verify-phone-otp", formData);
};

export const sendEmailOtp = (formData) => {
  return api.post("/auth/send-email-otp", formData);
};

export const verifyEmailOtp = (formData) => {
  return api.post("/auth/verify-email-otp", formData);
};

export const forgotPassword = (formData) => {
  return api.post("/auth/forgot-password", formData);
};

export const resetPassword = (token, formData) => {
  return api.put(`/auth/reset-password/${token}`, formData);
};

export const getProfile = () => {
  return api.get("/auth/profile");
};

export const updateProfile = (data) => {
  return api.put("/auth/profile", data);
};

export const changePassword = (data) => {
  return api.put("/auth/change-password", data);
};
