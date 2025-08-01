import api from './axios-instance';

export const getAllSuppliers = async () => {
  return await api.get('/getSuppliers');
};

export const downloadSuppliers = async () => {
  return await api.get('/downlaod-suppliers');
};

export const searchSuppliers = async (query) => {
  return await api.get(`/searchSuppliers?query=${query}`);
};

export const getSupplierDetails = async (supplierId,page = 1, limit = 10) => {
  return await api.get(`/getSupplierDetails/${supplierId}?page=${page}&limit=${limit}`);
};