// authService.js
import api from './axios-instance';

// Auth API service class with improved error handling
export const authAPI = {
  // Login user
  async login(credentials) {
    try {
      // Convert loginId/password to the format expected by the backend
      // This change helps avoid the query property error
      const loginPayload = {
        loginId: credentials.loginId, // Server might expect email instead of loginId
        password: credentials.password
      };
      
      const response = await api.post('/auth/login', loginPayload);
      return response;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Register user 
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      console.log('Registration successful');
      return response;
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get current user info
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      return response;
    } catch (error) {
      console.error('Get current user error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Logout user
  async logout() {
    try {
      const response = await api.post('/auth/logout');
      console.log('Logout successful');
      return response;
    } catch (error) {
      console.error('Logout error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Refresh token
  async refreshToken() {
    try {
      const response = await api.post('/auth/refresh-token');
      console.log('Token refreshed successfully');
      return response;
    } catch (error) {
      console.error('Token refresh error:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default authAPI;