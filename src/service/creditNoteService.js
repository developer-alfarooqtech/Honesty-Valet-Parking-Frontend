import api from "./axios-instance";

// Fetch all credit notes with filters
export const fetchAllCreditNotes = async ({
  currentPage,
  limit,
  debouncedSearchTerm,
  startDate,
  endDate,
  showProcessedOnly,
  showPendingOnly,
  showCancelledOnly,
  customerId = "",
  creditTypeFilter = "all", 
}) => {
  return await api.get(
    `/credit-notes?page=${currentPage}&limit=${limit}&search=${debouncedSearchTerm}&startDate=${startDate}&endDate=${endDate}&processedOnly=${showProcessedOnly}&pendingOnly=${showPendingOnly}&cancelledOnly=${showCancelledOnly}&customerId=${customerId}&creditType=${creditTypeFilter}`
  );
};

// Download credit notes report
export const downloadCreditNotes = async ({
  debouncedSearchTerm,
  startDate,
  endDate,
  showProcessedOnly,
  showPendingOnly,
  showCancelledOnly,
  customerId = "",
  creditTypeFilter = "all",
}) => {
  return await api.get(
    `/download-credit-notes?search=${debouncedSearchTerm}&startDate=${startDate}&endDate=${endDate}&processedOnly=${showProcessedOnly}&pendingOnly=${showPendingOnly}&cancelledOnly=${showCancelledOnly}&customerId=${customerId}&creditType=${creditTypeFilter}`
  );
};

// Fetch credit note details by ID
export const fetchCreditNoteDetails = async (creditNoteId) => {
  return await api.get(`/credit-notes/${creditNoteId}`);
};

// Create invoice-based credit note
export const createInvoiceCreditNote = async (creditNoteData) => {
  return await api.post("/create-invoice-credit-note", creditNoteData);
};

// Create independent credit note
export const createIndependentCreditNote = async (creditNoteData) => {
  return await api.post("/credit-notes/indipendent", creditNoteData);
};

// Update credit note
export const updateCreditNote = async (creditNoteId, creditNoteData) => {
  return await api.patch(`/update-credit-note/${creditNoteId}`, creditNoteData);
};

// Process credit note (change status to processed)
export const processCreditNote = async (creditNoteId) => {
  return await api.put(`/process-credit-note/${creditNoteId}`);
};

// Cancel credit note
export const cancelCreditNote = async (creditNoteId, cancelReason) => {
  try {
    return await api.put(`/cancel-credit-note/${creditNoteId}`, { cancelReason });
  } catch (error) {
    console.error("Error cancelling credit note:", error);
    throw error;
  }
};

// Get credit note statistics
export const fetchCreditNoteStats = async ({ customerId = "" }) => {
  return await api.get(`/credit-notes/stats?customerId=${customerId}`);
};

// Search customers for credit note creation
export const fetchCustomersForCreditNote = async (searchTerm) => {
  return await api.get(`/customers/search?term=${searchTerm}`);
};

// Search invoices for credit note creation - using existing invoice search pattern
export const fetchInvoicesForCreditNote = async (searchTerm, customerId = "") => {
  const params = new URLSearchParams();
  params.append('search', searchTerm);
  if (customerId) params.append('customerId', customerId);
  
  return await api.get(`/get-invoices?${params.toString()}&limit=50&page=1`);
};

// Delete credit note (if allowed)
export const deleteCreditNote = async (creditNoteId) => {
  return await api.delete(`/delete-credit-note/${creditNoteId}`);
};

// Apply credit note to customer account
export const applyCreditNoteToAccount = async (creditNoteId, applicationData) => {
  return await api.post(`/apply-credit-note/${creditNoteId}`, applicationData);
};
