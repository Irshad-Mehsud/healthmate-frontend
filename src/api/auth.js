
import apiService from "./apiService";

/*
====================================
Auth APIs
====================================
*/

export const uploadProfileImage = async (file) => {
  // Accept FormData directly and do not set Content-Type header manually
  return await apiService.post("/users/", file);
};

export const loginUser = (credentials) => {
  return apiService.post("/users/login", credentials);
};

export const registerUser = (userData) => {
  const config = userData instanceof FormData ? {
    headers: { 'Content-Type': 'multipart/form-data' }
  } : {};
  return apiService.post("/users/", userData, config);
};

export const logoutUser = () => {
  return apiService.post("/auth/logout");
};

export const getCurrentUser = (userId) => {
  return apiService.get(`/users/${userId}`);
};

export const updateUser = (userId, userData) => {
  const config = userData instanceof FormData ? {
    headers: { 'Content-Type': 'multipart/form-data' }
  } : {};
  return apiService.put(`/users/${userId}`, userData, config);
};

/*
====================================
Report APIs
====================================
*/

export const uploadReport = async (reportData) => {
  return await apiService.post("/reports/upload", reportData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const getReportAnalysis = (reportId) => {
  return apiService.post(`/ai-insights/${reportId}`);
}

export const saveReportAnalysis = (reportId, analysisData) => {
  return apiService.post(`/reports/${reportId}/analysis`, analysisData);
}

export const getReportDetails = (reportId) => {
  return apiService.get(`/reports/details/${reportId}`);
}


export const getUserReports = (userId) => {
  return apiService.get(`/reports/${userId}`);
};