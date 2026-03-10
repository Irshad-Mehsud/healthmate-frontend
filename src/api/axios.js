
import axios from "axios";

// Create instance
const axiosInstance = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? "https://healthmate-backend-three.vercel.app/api/"
      : "http://localhost:5000/api/",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// ============================
// Request Interceptor
// ============================

axiosInstance.interceptors.request.use((config) => {
  // Let browser set Content-Type automatically for FormData
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

// ============================
// Response Interceptor
// ============================

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Preserve original error for debugging
    console.error('Axios Interceptor - Full Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL
      }
    });

    // If server responds with 401 (Unauthorized)
    if (error.response?.status === 401) {
      console.warn("Session expired. Redirecting to login...");
      window.location.href = "/login";
    }

    // If server error - but don't hide the details
    if (error.response?.status === 500) {
      console.error("Server error. Response details:", error.response?.data);
    }

    // Return the original error with all details intact
    return Promise.reject(error);
  }
);

export default axiosInstance;
