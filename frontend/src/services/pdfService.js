import api from "./api";

export const downloadMonthlyPDF = (params = {}) => {
  return api.get("/pdf/monthly", {
    params,
    responseType: "blob",
  });
};