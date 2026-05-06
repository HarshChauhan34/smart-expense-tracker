import api from "./api";

export const getAIInsights = () => {
  return api.get("/ai/insights");
};