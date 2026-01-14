import api from "./axios-instance";

const appendCustomerIds = (params, customerIds = []) => {
  if (!Array.isArray(customerIds) || customerIds.length === 0) {
    return;
  }

  customerIds
    .filter((id) => typeof id === "string" && id.trim().length > 0)
    .forEach((id) => params.append("customerIds", id));
};

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
  sort = 'newest',
  customerId = "",
  customerIds = [],  withLpoOnly = false,
  withoutLpoOnly = false,}) => {
  const params = new URLSearchParams({
    page: currentPage,
    limit,
    search: debouncedSearchTerm || "",
    startDate: startDate || "",
    endDate: endDate || "",
    overdueOnly,
    paymentClearedOnly,
    pendingOnly,
    cancelledOnly,
    sort,
    withLpoOnly,
    withoutLpoOnly,
  });

  if (customerId) {
    params.append("customerId", customerId);
  }
  appendCustomerIds(params, customerIds);

  return await api.get(`/get-invoices?${params.toString()}`);
};

export const downloadInvoices = async ({
  debouncedSearchTerm,
  startDate,
  endDate,
  overdueOnly,
  paymentClearedOnly,
  pendingOnly,
  cancelledOnly,
  sort = 'newest',
  customerId = "",
  customerIds = [],  withLpoOnly = false,
  withoutLpoOnly = false,}) => {
  const params = new URLSearchParams({
    search: debouncedSearchTerm || "",
    startDate: startDate || "",
    endDate: endDate || "",
    overdueOnly,
    paymentClearedOnly,
    pendingOnly,
    cancelledOnly,
    sort,
    withLpoOnly,
    withoutLpoOnly,
  });

  if (customerId) {
    params.append("customerId", customerId);
  }
  appendCustomerIds(params, customerIds);

  return await api.get(`/download-invoices?${params.toString()}`);
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

export const fetchInvoiceStats  = async ({customerId, customerIds = [], signal}) => {
  const params = new URLSearchParams();
  if (customerId) {
    params.append("customerId", customerId);
  }
  appendCustomerIds(params, customerIds);

  const query = params.toString();

  return await api.get(`/invoice/stats${query ? `?${query}` : ""}`, {
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

export const uploadInvoicesFile = async (formData, onUploadProgress) => {
  return await api.post("/invoices/import", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress,
    timeout: 120000,
  });
}; 

