import api from "./api";

export const setBudget = (data) => {
  return api.post("/budgets", data);
};

export const getBudgetStatus = (params = {}) => {
  return api.get("/budgets/status", { params });
};