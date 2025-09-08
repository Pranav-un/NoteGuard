import { api } from "../lib/api";
import type { LoginRequest, RegisterRequest, AuthResponse } from "../types";

export const authApi = {
  async login(credentials: LoginRequest) {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    return response;
  },

  async register(userData: RegisterRequest) {
    const response = await api.post<AuthResponse>("/auth/register", userData);
    return response;
  },

  async validateToken() {
    try {
      const response = await api.get<{ valid: boolean }>("/auth/validate");
      return response;
    } catch (error) {
      return { success: false, data: { valid: false } };
    }
  },
};
