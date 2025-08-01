import api from "./axios-instance";

export const getProducts = async ({
  page = 1,
  limit = 20,
  search = "",
  availableOnly = false,
  unavailableOnly = false,
}) => {
  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("limit", limit.toString());

  if (search) {
    queryParams.append("search", search);
  }

  // Send as strings to avoid any conversion issues
  queryParams.append("availableOnly", availableOnly.toString());
  queryParams.append("unavailableOnly", unavailableOnly.toString());

  return await api.get(`/products?${queryParams.toString()}`);
};

export const downloadProducts = async ({
  search = "",
  availableOnly = false,
  unavailableOnly = false,
}) => {
  const queryParams = new URLSearchParams();
  if (search) {
    queryParams.append("search", search);
  }

  // Send as strings to avoid any conversion issues
  queryParams.append("availableOnly", availableOnly.toString());
  queryParams.append("unavailableOnly", unavailableOnly.toString());

  return await api.get(`/downlaod-products?${queryParams.toString()}`);
};

export const getSuppliers = async () => {
  return await api.get("/suppliers");
};

export const getInvoices = async (params = {}) => {
  const {
    page = 1,
    limit = 10, 
    search = "",
    searchType = "invoice",
    dateFrom = "",
    dateTo = "",
    showUnpaid = false,
    documentType = "all", // can be "all", "invoice", or "lpo"
  } = params;

  const queryParams = new URLSearchParams();
  queryParams.append("page", page);
  queryParams.append("limit", limit);
  if (search) queryParams.append("search", search);
  if (searchType) queryParams.append("searchType", searchType);
  if (dateFrom) queryParams.append("dateFrom", dateFrom);
  if (dateTo) queryParams.append("dateTo", dateTo);
  if (showUnpaid) queryParams.append("showUnpaid", "true");
  if (documentType !== "all") queryParams.append("documentType", documentType);

  return await api.get(`/invoices?${queryParams.toString()}`);
};

// Add this to your productService.js file
export const getInvoiceStats = async (params = {}) => {
  const {
    search = "",
    dateFrom = "",
    dateTo = "",
    showUnpaid = false,
  } = params;

  const queryParams = new URLSearchParams();
  if (search) queryParams.append("search", search);
  if (dateFrom) queryParams.append("dateFrom", dateFrom);
  if (dateTo) queryParams.append("dateTo", dateTo);
  if (showUnpaid) queryParams.append("showUnpaid", "true");

  return await api.get(`/p-invoices/stats?${queryParams.toString()}`);
};

export const downloadPurchaseInvs = async (params = {}) => {
  const {
    search = "",
    dateFrom = "",
    dateTo = "",
    showUnpaid = false,
    searchType = "invoice",
    documentType = "all",
  } = params;
  const queryParams = new URLSearchParams();
  if (search) queryParams.append("search", search);
  if (dateFrom) queryParams.append("dateFrom", dateFrom);
  if (dateTo) queryParams.append("dateTo", dateTo);
  if (showUnpaid) queryParams.append("showUnpaid", "true");
  if (searchType) queryParams.append("searchType", searchType);
  if (documentType !== "all") queryParams.append("documentType", documentType);
  return await api.get(`/downlaod-purchase-invoices?${queryParams.toString()}`);
};

export const createInvoices = async (payload) => {
  return await api.post("/create-inv", payload);
};

export const getLPOById = async (id) => {
  return await api.get(`/lpo/${id}`);
};

export const updateLPO = async (id, payload) => {
  return await api.put(`/update-lpo/${id}`, payload);
};

export const convertToInvoice = async (id, name, selectedDate) => {
  return await api.post("/convert-to-invoice", { id, name, selectedDate });
};

export const createSupplier = async (payload) => {
  return await api.post("/create-supplier", payload);
};

export const addProduct = async (productData) => {
  try {
    const response = await api.post("/add-product", productData);
    return response;
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
};

export const getProductById = async (id) => {
  try {
    const response = await api.get(`/get-productById/${id}`);
    return response;
  } catch (error) {
    console.error("Error fetching product details:", error);
    throw error;
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const response = await api.put(`/update-product/${id}`, productData);
    return response;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

// Service API
export const getServices = async (params) => {
  try {
    // Build query string from params
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search || "",
    }).toString();

    const response = await api.get(`/get-services?${queryParams}`);
    return response;
  } catch (error) {
    console.error("Error fetching services:", error);
    throw error;
  }
};

export const downloadServices = async (params) => {
  try {
    // Build query string from params
    const queryParams = new URLSearchParams({
      search: params.search || "",
    }).toString();

    const response = await api.get(`/downlaod-services?${queryParams}`);
    return response;
  } catch (error) {
    console.error("Error fetching services:", error);
    throw error;
  }
};

export const addService = async (serviceData) => {
  try {
    const response = await api.post("/add-service", serviceData);
    return response;
  } catch (error) {
    console.error("Error adding service:", error);
    throw error;
  }
};

export const getServiceById = async (id) => {
  try {
    const response = await api.get(`/get-serviceById/${id}`);
    return response;
  } catch (error) {
    console.error("Error fetching service details:", error);
    throw error;
  }
};

export const updateService = async (id, serviceData) => {
  try {
    const response = await api.put(`/update-service/${id}`, serviceData);
    return response;
  } catch (error) {
    console.error("Error updating service:", error);
    throw error;
  }
};

export const updateBatchStock = async (productId, batchIndex, newStock) => {
  try {
    const response = await api.put(`/update-batchStock/${productId}`, {
      batchIndex,
      newStock,
    });
    return response;
  } catch (error) {
    console.error("Error updating service:", error);
    throw error;
  }
};

export const searchProducts = async (searchTerm) => {
  return await api.get(`/searchProducts?q=${searchTerm}`);
};

export const addRepayment = async (date, amount, invoiceId, bankAccount) => {
  return await api.post("/inv-repayment", {
    date,
    amount,
    invoiceId,
    bankAccount,
  });
};

export const addStock = async ({
  stock,
  purchasePrice,
  sellingPrice,
  productId,
}) => {
  return await api.post("/addStock", {
    stock,
    purchasePrice,
    sellingPrice,
    productId,
  });
};

export const cancelLPO = async (id) => {
  return await api.put(`/cancel-lpo/${id}`);
};
