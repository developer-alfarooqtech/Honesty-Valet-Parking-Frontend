import api from './axios-instance';

// Create a new customer
export const createCustomer = async (customerData) => {
  return await api.post('/create-customer', customerData);
};

export const updateCustomer = async (customerId, customerData) => {
  return await api.put(`/update-customer/${customerId}`, customerData);
};

export const searchCustomers = async (searchTerm) => {
  return await api.get(`/search-customers?term=${encodeURIComponent(searchTerm)}`);
};
// Get customers with pagination and optional search
export const getCustomers = async ({ page = 1, limit = 10, search = '' }) => {
  return await api.get('/customers', {
    params: {
      page,
      limit,
      search
    }
  });
};

export const downloadCustomers = async ({ search = '' }) => {
  return await api.get('/downlaod-customers', {
    params: {
      search
    }
  });
};

// Get a single customer by ID
export const getCustomerById = async (customerId) => {
  return await api.get(`/customer/${customerId}`);
};

// Update a customer