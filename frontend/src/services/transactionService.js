import api from "./api";

export const addTransaction = (data) => {
  return api.post("/transactions", data);
};

export const getTransactions = () => {
  return api.get("/transactions");
};

export const getTransactionById = (id) => {
  return api.get(`/transactions/${id}`);
};

export const updateTransaction = (id, data) => {
  return api.put(`/transactions/${id}`, data);
};

export const deleteTransaction = (id) => {
  return api.delete(`/transactions/${id}`);
};