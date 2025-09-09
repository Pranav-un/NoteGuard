import { useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import type { ApiResponse } from "../types";

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

interface UseApiOptions {
  requireAuth?: boolean;
}

interface ApiCallOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
}

export const useApi = (options: UseApiOptions = { requireAuth: true }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const callApi = useCallback(
    async <T>(
      url: string,
      apiOptions: ApiCallOptions = {}
    ): Promise<ApiResponse<T> | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const { method = "GET", body, headers = {} } = apiOptions;

        const requestHeaders: Record<string, string> = {
          "Content-Type": "application/json",
          ...headers,
        };

        if (options.requireAuth && token) {
          requestHeaders["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${url}`, {
          method,
          headers: requestHeaders,
          body: body ? JSON.stringify(body) : undefined,
        });

        const data: ApiResponse<T> = await response.json();

        if (!data.success) {
          setError(data.message || "API call failed");
          return null;
        }

        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Network error occurred";
        setError(errorMessage);
        console.error("API call error:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [token, options.requireAuth]
  );

  return {
    callApi,
    isLoading,
    error,
    setError,
  };
};
