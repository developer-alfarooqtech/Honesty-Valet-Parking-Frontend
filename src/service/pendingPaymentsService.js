import api from "./axios-instance";

export const getPendingPayments = async (queryParams) => {
  return await api.get(`/invoices/pending?${queryParams}`);
};

export const applyPayment = async (payload) => {
  return await api.post(`/invoices/process-payments`, payload);
};

export const searchCustomers = async (searchTerm) => {
  return await api.get(
    `/customers/searching?term=${encodeURIComponent(searchTerm)}&limit=20`
  );
};

export const addCustomerBalance = async (customerId, body) => {
  return await api.post(`/customers/${customerId}/balance`, body);
};
