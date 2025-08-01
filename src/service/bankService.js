import api from "./axios-instance";

export const createBank = async(name) => {
  return await api.post('/banks', { name });
};

export const fetchBanks = async() => {
  return await api.get('/banks');
};