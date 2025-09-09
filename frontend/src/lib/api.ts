import axios from "axios";
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import toast from "react-hot-toast";

// Smart API base URL detection
const getApiBaseUrl = () => {
  // If we have an explicit environment variable, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In production (Railway), use relative path since backend serves frontend
  if (import.meta.env.PROD) {
    return "/api";
  }
  
  // Development fallback
  return "http://localhost:8080/api";
};

const API_BASE_URL = getApiBaseUrl();

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";
    const status = error.response?.status;

    // Handle different error types
    switch (status) {
      case 401:
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        break;
      case 403:
        toast.error("You don't have permission to access this resource.");
        break;
      case 404:
        toast.error("Resource not found.");
        break;
      case 422:
        // Handle validation errors
        if (error.response?.data?.fieldErrors) {
          const fieldErrors = error.response.data.fieldErrors;
          Object.values(fieldErrors).forEach((msg) => {
            toast.error(msg as string);
          });
        } else {
          toast.error(message);
        }
        break;
      case 500:
        toast.error("Server error. Please try again later.");
        break;
      default:
        toast.error(message);
    }

    return Promise.reject(error);
  }
);

// Generic API response type
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errorCode?: string;
  timestamp?: number;
}

// Utility functions for making API calls
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    apiClient.get(url, config).then((response) => response.data),

  post: <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> =>
    apiClient.post(url, data, config).then((response) => response.data),

  put: <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> =>
    apiClient.put(url, data, config).then((response) => response.data),

  delete: <T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> =>
    apiClient.delete(url, config).then((response) => response.data),
};

export default apiClient;
