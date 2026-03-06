
import axios from "axios";

// Create instance
const axiosInstance = axios.create({
//   baseURL: "https://notes-app-backend-3ihupco1o-irshad-mehsuds-projects.vercel.app/", // your backend API base URL
    baseURL: "http://localhost:5000/api/", // your backend API base URL
  withCredentials: true, // required for HTTP-only cookies
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // optional: request timeout (10s)
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
