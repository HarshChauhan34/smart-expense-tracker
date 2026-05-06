import api from "./api";

export const getSummary = (params = {}) => {
  return api.get("/reports/summary", { params });
};

export const getCategoryReport = (params = {}) => {
  return api.get("/reports/category", { params });
};

export const getMonthlyReport = () => {
  return api.get("/reports/monthly");
};