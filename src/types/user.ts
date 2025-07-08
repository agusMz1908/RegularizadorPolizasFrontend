export interface User {
  id: number;
  nombre: string;
  activo: boolean;
  rol?: string;
  permisos?: string[];
  fechaCreacion?: Date;
  ultimoAcceso?: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
}

export interface LoginRequest {
  nombre: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}