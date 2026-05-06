import api from "./api";

export const createRecurringTransaction = (data) => {
  return api.post("/recurring", data);
};

export const getRecurringTransactions = () => {
  return api.get("/recurring");
};

export const generateRecurringTransactions = () => {
  return api.post("/recurring/generate");
};

export const toggleRecurringTransaction = (id) => {
  return api.patch(`/recurring/${id}/toggle`);
};

export const deleteRecurringTransaction = (id) => {
  return api.delete(`/recurring/${id}`);
};