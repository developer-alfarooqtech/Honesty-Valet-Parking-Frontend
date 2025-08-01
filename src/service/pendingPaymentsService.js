import api from "./axios-instance";

export const getPendingPayments = async (queryParams) => {
  return await api.get(`/invoices/pending?${queryParams}`);
};

export const applyPayment = async ({ payment }) => {
  return await api.post(`/invoices/process-payments`, payment);
};

export const searchCustomers = async (searchTerm) => {
  return await api.get(
    `/customers/searching?term=${encodeURIComponent(searchTerm)}&limit=20`
  );
};
