import api from "./axios-instance";

export const fetchStats  = async () => {
  return await api.get('/dashboard/stats');
};
export const monthlyRevenueApi  = async () => {
  return await api.get('/dashboard/monthly-revenue');
};
export const paymentStats  = async () => {
  return await api.get('/dashboard/payment-status');
};
export const recentInvs  = async () => {
  return await api.get('/dashboard/recent-invoices');
};
export const topCustomersApi  = async () => {
  return await api.get('/dashboard/top-customers');
};
export const conversionRateApi  = async () => {
  return await api.get('/dashboard/conversion-rate');
};