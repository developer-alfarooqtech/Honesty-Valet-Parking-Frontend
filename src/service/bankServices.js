import api from "./axios-instance";

export const fetchAllBanks = async () => {
    return await api.get("/bank-accounts");
}

export const fetchStatements = async (queryParams) => {
  try {
    const response = await api.get(`/bank-statements?${queryParams.toString()}`);
    return response;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const downloadStatement = async (queryParams) => {
  try {
    const response = await api.get(`/download-statements?${queryParams.toString()}`);
    return response;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// Add this new function
export const fetchStatementsSummary = async (queryParams) => {
  try {
    const response = await api.get(`/bank-statements/summary?${queryParams.toString()}`);
    return response;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const createBankAccount = async (bankData) => {
  try {
    const response = await api.post("/create-new-account", bankData);
    return response;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

export const updateBankTransaction = async (transactionId, payload) => {
  try {
    const response = await api.put(`/bank-statements/${transactionId}`, payload);
    return response;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const reverseBankTransaction = async (transactionId, payload) => {
  try {
    const response = await api.delete(`/bank-statements/${transactionId}`, {
      data: payload,
    });
    return response;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};