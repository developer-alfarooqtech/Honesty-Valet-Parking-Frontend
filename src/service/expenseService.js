import api from "./axios-instance";

export const getExpense = async (params) => {
  return await api.get(
    `/expenses${params.toString() ? `?${params.toString()}` : ""}`
  );
};

export const downloadExpenses = async (params) => {
  return await api.get(
    `/downlaod-expenses${params.toString() ? `?${params.toString()}` : ""}`
  );
};
export const addExpense = async (newExpense) => {
  return await api.post("/expenses", newExpense);
};
export const updateExpense = async (expenseId, updatedExpense) => {
  return await api.put(`/expenses/${expenseId}`, updatedExpense);
};

export const getDepartments = async () => {
  return await api.get("/departments");
};
export const getCategories = async () => {
  return await api.get("/categories");
};
export const addDepartmentPayment = async ({ departmentId, date, amount }) => {
  return await api.post("/departments/payment", { departmentId, date, amount });
};
export const createDepartment = async (formData) => {
  return await api.post("/departments", formData);
};
export const addCategory = async (name) => {
  return await api.post("/categories", { name });
};

export const getDepartmentPaymentHistoryById = async (departmentId) => {
  return await api.get(`/department-payments/${departmentId}`);
};
