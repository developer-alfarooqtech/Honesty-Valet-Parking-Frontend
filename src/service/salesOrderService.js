import api from "./axios-instance";

// Corrected API function for frontend
export const getSalesOrders = async (params = {}) => {
  const { page = 1, limit = 10, search = "", startDate, endDate, isInvCreated } = params;
  
  // Build query string
  const queryParams = new URLSearchParams({ page, limit, search });
  
  // Add optional parameters if they exist
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  if (isInvCreated !== undefined) queryParams.append('isInvCreated', isInvCreated);
  
  return await api.get(`/salesOrders?${queryParams.toString()}`);
};

export const downloadSalesOrders = async (params = {}) => {
  const { search = "", startDate, endDate, isInvCreated } = params;
  
  // Build query string
  const queryParams = new URLSearchParams({ search });
  
  // Add optional parameters if they exist
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  if (isInvCreated !== undefined) queryParams.append('isInvCreated', isInvCreated);
  
  return await api.get(`/downlaod-salesOrders?${queryParams.toString()}`);
};

export const createSalesOrder = async (orderData) => {
  return await api.post("/create-salesOrder", orderData);
};

export const checkDuplicateOrderId = async (orderId) => {
  return await api.get(`/check-duplicate-order-id/${encodeURIComponent(orderId)}`);
};

export const checkDuplicateLpo = async (lpo) => {
  return await api.get(`/check-duplicate-lpo/${encodeURIComponent(lpo)}`);
};

export const checkDuplicateSalesOrder = async (data) => {
  return await api.post("/check-duplicate-salesOrder", data);
};

export const fetchCustomers = async (searchTerm) => {
  return await api.get(`/searchCustomer?q=${searchTerm}`);
};
export const fetchProducts = async (searchTerm) => {
  return await api.get(`/products/search?q=${searchTerm}`);
};
export const getProductDetails = async (id) => {
  return await api.get(`/products/details?id=${id}`);
};

export const fetchServices = async (searchTerm) => {
  return await api.get(`/services/search?q=${searchTerm}`);
};

export const searchExistSalesOrder = async (value) => {
  return await api.get(`/orderId/search?search=${value}`);
};

export const createInvoices = async({orderIds})=>{
  return await api.post('/create-invoices',{orderIds})
}

export const getSalesOrderById = async (id) => {
  return await api.get(`/fetch-salesorders/${id}`);
};

// Update a sales order
export const updateSalesOrder = async (id, orderData) => {
  return await api.put(`/update-salesorder/${id}`, orderData);
};
