export interface LoginDto {
  nombre: string;
  password: string;
}

export interface AuthResultDto {
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
  roles: Role[];
  isActive: boolean;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  resource: string;
  action: string;
  description: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginDto) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export type LoadingState = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface StoredAuth {
  token: string;
  user: User;
  expiration: string;
}