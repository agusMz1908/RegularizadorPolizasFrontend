// src/types/auth.ts

export interface LoginRequest {
  nombre: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: number;
  nombre: string;
  tenantId: string;
  expiration: string;
}

export interface User {
  id: number;
  nombre: string;
  tenantId: string;
  role?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}