import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User, LoginRequest, RegisterRequest } from "../types";
import { authApi } from "../api/auth";
import { useLoading } from "./LoadingContext";
import toast from "react-hot-toast";
import { Spinner } from "../components/ui/LoadingComponents";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const { setLoading, isLoadingKey } = useLoading();

  // Load user data from localStorage on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(userData);

          // Validate token with backend
          const response = await authApi.validateToken();
          if (!response.success || !response.data?.valid) {
            // Token is invalid, clear auth
            clearAuth();
            toast.error("Session expired. Please login again.");
          }
        } catch (error) {
          console.error("Error validating stored auth:", error);
          clearAuth();
        }
      }
      setIsInitializing(false);
    };

    initializeAuth();
  }, []);

  const clearAuth = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const login = async (credentials: LoginRequest) => {
    setLoading("login", true);
    try {
      const response = await authApi.login(credentials);

      if (response.success && response.data) {
        const {
          token: authToken,
          userId,
          username,
          email,
          role,
        } = response.data;
        const userData: User = { id: userId, username, email, role };

        setToken(authToken);
        setUser(userData);

        // Store in localStorage
        localStorage.setItem("token", authToken);
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        throw new Error(response.message || "Login failed");
      }
    } finally {
      setLoading("login", false);
    }
  };

  const register = async (userData: RegisterRequest) => {
    setLoading("register", true);
    try {
      const response = await authApi.register(userData);

      if (response.success && response.data) {
        const {
          token: authToken,
          userId,
          username,
          email,
          role,
        } = response.data;
        const userInfo: User = { id: userId, username, email, role };

        setToken(authToken);
        setUser(userInfo);

        // Store in localStorage
        localStorage.setItem("token", authToken);
        localStorage.setItem("user", JSON.stringify(userInfo));

        toast.success("Registration successful! Welcome to NoteGuard.");
      } else {
        throw new Error(response.message || "Registration failed");
      }
    } finally {
      setLoading("register", false);
    }
  };

  const logout = async () => {
    setLoading("logout", true);
    try {
      clearAuth();
      toast.success("Logged out successfully");
    } finally {
      setLoading("logout", false);
    }
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === "ADMIN";
  const isLoading =
    isLoadingKey("login") || isLoadingKey("register") || isLoadingKey("logout");

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated,
    isAdmin,
    isLoading,
  };

  // Show loading spinner while initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mb-4" />
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
