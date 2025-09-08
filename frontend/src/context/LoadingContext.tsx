import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface LoadingContextType {
  isLoading: boolean;
  loadingStates: Record<string, boolean>;
  setLoading: (key: string, loading: boolean) => void;
  isLoadingKey: (key: string) => boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({
  children,
}) => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );

  const setLoading = (key: string, loading: boolean) => {
    setLoadingStates((prev) => ({
      ...prev,
      [key]: loading,
    }));
  };

  const isLoadingKey = (key: string): boolean => {
    return loadingStates[key] || false;
  };

  const isLoading = Object.values(loadingStates).some((loading) => loading);

  const value: LoadingContextType = {
    isLoading,
    loadingStates,
    setLoading,
    isLoadingKey,
  };

  return (
    <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>
  );
};
