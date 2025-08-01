import api from "./axios-instance";

export const fetchAllInvoices = async ({
  currentPage,
  limit,
  debouncedSearchTerm,
  startDate,
  endDate,
  pendingOnly,
  cancelledOnly,
  overdueOnly,
  paymentClearedOnly,
  customerId = "",
}) => {
  return await api.get(
    `/get-invoices?page=${currentPage}&limit=${limit}&search=${debouncedSearchTerm}&startDate=${startDate}&endDate=${endDate}&overdueOnly=${overdueOnly}&paymentClearedOnly=${paymentClearedOnly}&pendingOnly=${pendingOnly}&cancelledOnly=${cancelledOnly}&customerId=${customerId}`
  );
};

export const downloadInvoices = async ({
  debouncedSearchTerm,
  startDate,
  endDate,
  overdueOnly,
  paymentClearedOnly,
  customerId = "",
}) => {
  return await api.get(
    `/download-invoices?search=${debouncedSearchTerm}&startDate=${startDate}&endDate=${endDate}&overdueOnly=${overdueOnly}&paymentClearedOnly=${paymentClearedOnly}&customerId=${customerId}`
  );
};

export const fetchInvDetails = async (invoiceId) => {
  return await api.get(`/invoice-details/${invoiceId}`);
};

export const repayInvoices = async (paymentData) => {
  return await api.post("/repay-invoices", paymentData);
};

export const updateInvoiceExpDate = async (invoiceId, newExpDate) => {
  return await api.post("/update-invoice-expdate", { invoiceId, newExpDate });
};

export const updateItemDescription  = async (invoiceId, itemId, itemType, newDescription) => {
  return await api.put("/update-description", { invoiceId, itemId, itemType, newDescription});
};

export const fetchCustomersBySearch = async (searchTerm) => {
  return await api.get(`/customers/search?term=${searchTerm}`);
};

export const fetchInvoiceStats  = async ({customerId, signal}) => {
  return await api.get(`/invoice/stats?customerId=${customerId}`, {
    signal,
    timeout: 30000, // Increase timeout to 30 seconds for stats
  });
};

// Create invoice directly (bypassing sales order)
export const createInvoiceDirectly = async (invoiceData) => {
  return await api.post("/create-invoice-direct", invoiceData);
};

// Update invoice
export const updateInvoice = async (invoiceId, invoiceData) => {
  return await api.patch(`/update-invoice/${invoiceId}`, invoiceData);
};

// Cancel invoice
export const cancelInvoice = async (invoiceId) => {
  return await api.put(`/cancel-invoice/${invoiceId}`);
};

