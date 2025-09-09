export interface User {
  id: number;
  username: string;
  email: string;
  role: "USER" | "ADMIN";
  createdAt?: string;
  updatedAt?: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  userId?: number; // Keep for backward compatibility
  ownerId: number; // This is what the backend actually returns
  user?: User; // The full user object from backend
  shareToken?: string;
  shareExpirationTime?: string;
  expirationTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
  success: boolean;
}

export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  userId: number;
  username: string;
  email: string;
  role: "USER" | "ADMIN";
}

export interface CreateNoteRequest {
  title: string;
  content: string;
  expirationTime?: string;
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
  expirationTime?: string;
}

export interface ShareNoteRequest {
  expirationHours: number;
}

export interface ShareNoteResponse {
  shareUrl: string;
  shareToken: string;
  expirationTime: string;
}

export interface AdminStats {
  userStats: {
    totalUsers: number;
    adminUsers: number;
    regularUsers: number;
  };
  noteStats: {
    totalNotes: number;
    sharedNotes: number;
    expiredNotes: number;
  };
}
