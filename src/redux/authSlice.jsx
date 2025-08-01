// authSlice.jsx
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../service/authService';

// Route mapping for permissions
const routeMap = {
  'dashboard': '/',
  'customers': '/customers',
  'products-services': '/products-services',
  'sales-orders': '/sales-orders',
  'bank-statements': '/bank-statements',
  'pending-payments': '/pending-payments',
  'expense': '/expense',
  'purchase-invoices': '/purchase-invoices',
  'invoices': '/invoices',
  'suppliers': '/suppliers',
  'credit-note': '/credit-note',
};

// Helper function to get the first available route based on permissions
export const getFirstAvailableRoute = (user) => {
  if (!user) return '/unauthorized';
  
  // If super admin, redirect to dashboard
  if (user.is_Super) {
    return '/';
  }
  
  // If no permissions object, redirect to unauthorized
  if (!user.permissions) {
    return '/unauthorized';
  }
  
  // Find first permission that is true
  const availablePermissions = Object.entries(user.permissions)
    .filter(([key, value]) => value === true)
    .map(([key]) => key);
  
  // If no permissions are true, redirect to unauthorized
  if (availablePermissions.length === 0) {
    return '/unauthorized';
  }
  
  // Get the first available route
  const firstPermission = availablePermissions[0];
  return routeMap[firstPermission] || '/unauthorized';
};

// Async thunks with improved error handling
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData);
      const data = response.data || response;
      localStorage.setItem('accessToken', data.accessToken);
      return data;
    } catch (error) {
      console.error('Register error:', error);
      if (error.response) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: error.message || 'Registration failed' });
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      // Before sending to API, verify we have required fields
      if (!credentials.loginId || !credentials.password) {
        return rejectWithValue({ message: 'Login ID and password are required' });
      }
      
      const response = await authAPI.login(credentials);
      
      // Handle both response formats
      const data = response.data;
      
      // Validation check
      if (!data || !data.accessToken) {
        return rejectWithValue({ message: 'Invalid response from server' });
      }
      
      localStorage.setItem('accessToken', data.accessToken);
      return data;
    } catch (error) {
      console.error('Login error details:', error);
      
      // Detailed error logging
      if (error.response) {
        console.error('Server response error:', error.response.data);
        return rejectWithValue(error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
        return rejectWithValue({ message: 'No response from server. Check your network connection.' });
      } else {
        console.error('Request setup error:', error.message);
        return rejectWithValue({ message: error.message || 'Login failed' });
      }
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();
      localStorage.removeItem('accessToken');
      return null;
    } catch (error) {
      console.error('Logout error:', error);
      // Still remove token even if server request fails
      localStorage.removeItem('accessToken');
      
      if (error.response) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: error.message || 'Logout failed' });
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getCurrentUser();
      return response.data?.user || response.user || response.data || response;
    } catch (error) {
      console.error('Fetch user error:', error);
      
      if (error.response) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: error.message || 'Failed to fetch user' });
    }
  }
);

// Initial state
const initialState = {
  user: null,
  isAuthenticated: !!localStorage.getItem('accessToken'), // Check token on init
  loading: true,
  error: null,
  redirectRoute: null, // New field to store the redirect route
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearRedirectRoute: (state) => {
      state.redirectRoute = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.redirectRoute = getFirstAvailableRoute(action.payload.user);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Registration failed';
      })
      
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.redirectRoute = getFirstAvailableRoute(action.payload.user);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Login failed';
      })
      
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.redirectRoute = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.loading = false;
        // Still log out even if server request fails
        state.isAuthenticated = false;
        state.user = null;
        state.redirectRoute = null;
      })
      
      // Fetch current user
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.redirectRoute = getFirstAvailableRoute(action.payload);
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.redirectRoute = null;
      });
  },
});

export const { clearError, clearRedirectRoute } = authSlice.actions;

export default authSlice.reducer;