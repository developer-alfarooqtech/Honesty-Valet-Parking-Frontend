import api from './axios-instance';

// Create a new user
export const createUser = async (userData) => {
  return await api.post('/create-user', userData);
};

// Get all users
export const getAllUsers = async () => {
  return await api.get('/users');
};

// Get a single user by ID
export const getUserById = async (userId) => {
  return await api.get(`/users/${userId}`);
};

// Update user
export const updateUser = async (userId, userData) => {
  return await api.put(`/update-user/${userId}`, userData);
};

// Block/unblock user
export const blockUser = async (userId, isBlocked) => {
  return await api.patch(`/block-user/${userId}`, { isBlocked });
};