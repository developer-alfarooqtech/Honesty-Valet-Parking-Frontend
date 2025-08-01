import api from "./axios-instance";

export const getDashboardSummary = async () => {
  return await api.get("/report/dashboard-summary");
};

export const getProfitLossReport = async ({
  startDate = null,
  endDate = null,
}) => {
  const params = new URLSearchParams();

  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  return await api.get("/report/profit-loss", { params });
};

export const getSalesReport = async ({ startDate = null, endDate = null }) => {
  const params = new URLSearchParams();

  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  return await api.get("/report/sales", { params });
};

export const getPurchaseReport = async ({
  startDate = null,
  endDate = null,
}) => {
  const params = new URLSearchParams();

  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  return await api.get("/report/purchase", { params });
};

export const getInventoryReport = async () => {
  return await api.get("/report/inventory");
};

export const getAccountsReceivableReport = async () => {
  return await api.get("/report/accounts-receivable");
};

export const getExpenseReport = async ({
  startDate = null,
  endDate = null,
}) => {
  const params = new URLSearchParams();

  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  return await api.get("/report/expense", { params });
};
