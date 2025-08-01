// api/salaryApi.js
import api from "./axios-instance";

// Salary CRUD operations
export const fetchSalaries = async (page = 1, limit = 10, filters = {}) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
  });
  return await api.get(`/salaries?${params}`);
};

export const createSalary = async (salaryData) => {
  return await api.post("/salaries", salaryData);
};

export const updateSalary = async (salaryId, salaryData) => {
  return await api.put(`/salaries/${salaryId}`, salaryData);
};

export const deleteSalary = async (salaryId) => {
  return await api.delete(`/salaries/${salaryId}`);
};

// Recipient operations
export const fetchRecipientsBySearch = async (searchTerm) => {
  return await api.get(`/recipients/search?term=${searchTerm}`);
};

export const createRecipient = async (recipientData) => {
  return await api.post("/recipients", recipientData);
};

// Frontend Service for Salary Stats
export const fetchSalaryStats = async (filters = {}) => {
  const params = new URLSearchParams(
    Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
  );
  return await api.get(`/salaries/stats?${params}`);
};

// Add this to your salaryService.js
export const downloadSalaries = async (params) => {
  return await api.get(`/downlaod-salary?${params}`);
};