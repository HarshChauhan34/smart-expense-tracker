import api from "./api";

export const createSavingGoal = (data) => {
  return api.post("/saving-goals", data);
};

export const getSavingGoals = () => {
  return api.get("/saving-goals");
};

export const updateSavingGoal = (id, data) => {
  return api.put(`/saving-goals/${id}`, data);
};

export const addSavingAmount = (id, data) => {
  return api.patch(`/saving-goals/${id}/add-money`, data);
};

export const deleteSavingGoal = (id) => {
  return api.delete(`/saving-goals/${id}`);
};