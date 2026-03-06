 import axiosInstance from "./axios";

/*
====================================
Error Handler Helper
====================================
*/
const handleError = (error, defaultMessage) => {
  const message =
    error.response?.data?.message ||
    error.message ||
    defaultMessage;

  // Preserve original error details while customizing the message
  const preservedError = new Error(message);
  preservedError.response = error.response;
  preservedError.status = error.response?.status;
  preservedError.config = error.config;
  preservedError.request = error.request;
  
  throw preservedError;
};

/*
====================================
Generic API Service
====================================
*/

const apiService = {
  // GET request
  get: async (url, config = {}) => {
    try {
      const { data } = await axiosInstance.get(url, config);
      return data;
    } catch (error) {
      handleError(error, "Failed to fetch data");
    }
  },

  // POST request
  post: async (url, payload, config = {}) => {
    try {
      const { data } = await axiosInstance.post(url, payload, config);
      return data;
    } catch (error) {
      handleError(error, "Failed to create data");
    }
  },

  // PUT request
  put: async (url, payload, config = {}) => {
    try {
      const { data } = await axiosInstance.put(url, payload, config);
      return data;
    } catch (error) {
      handleError(error, "Failed to update data");
    }
  },

  // PATCH request
  patch: async (url, payload, config = {}) => {
    try {
      const { data } = await axiosInstance.patch(url, payload, config);
      return data;
    } catch (error) {
      handleError(error, "Failed to modify data");
    }
  },

  // DELETE request
  delete: async (url, config = {}) => {
    try {
      const { data } = await axiosInstance.delete(url, config);
      return data;
    } catch (error) {
      handleError(error, "Failed to delete data");
    }
  },
};

export default apiService;