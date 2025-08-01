// axios-instance.js
import axios from "axios";

const API_URL = import.meta.env.VITE_BASEURL
console.log("API URL:", API_URL);

// Create axios instance optimized for the login flow
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // ✅ Attach the current pathname to every request
    if (typeof window !== "undefined") {
      config.headers["x-pathname"] = window.location.pathname;
    }

    return config;
  },
  (error) => {
    console.error("Request error:", error.message);
    return Promise.reject(error);
  }
);

// Response interceptor with token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    console.error("Response error:", error.message);

    if (error.response) {
      console.log("Error status:", error.response.status);
      console.log("Error data:", error.response.data);
    }

    const originalRequest = error.config;

    //  FIX: Don't try token refresh for login/register endpoints
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || 
                          originalRequest.url?.includes('/auth/register') ||
                          originalRequest.url?.includes('/login') ||
                          originalRequest.url?.includes('/register');

    // Token refresh logic for 401 errors (but NOT for auth endpoints)
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        console.log("Attempting token refresh");
        const refreshResponse = await axios.post(
          `${API_URL}auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = refreshResponse.data;
        localStorage.setItem("accessToken", accessToken);

        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
        console.log("Token refreshed, retrying original request");

        return api(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError.message);
        localStorage.removeItem("accessToken");

        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    //  FIX: For auth endpoints with 401, just reject without refresh
    if (error.response?.status === 401 && isAuthEndpoint) {
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;