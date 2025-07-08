import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { User, AuthState, LoginRequest } from '../types/user';
import { apiService } from '../services/api';

const AuthContext = createContext<{
  authState: AuthState;
  login: (credentials: LoginRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
  isLoading: boolean;
} | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthProvider = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    token: null,
    refreshToken: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  const login = useCallback(async (credentials: LoginRequest): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiService.login(credentials);
      
      if (response.success && response.data) {
        setAuthState({
          user: response.data.user,
          isAuthenticated: true,
          token: response.data.token,
          refreshToken: response.data.refreshToken,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await apiService.logout();
    } finally {
      setAuthState({
        user: null,
        isAuthenticated: false,
        token: null,
        refreshToken: null,
      });
      setIsLoading(false);
    }
  }, []);

  const refreshAuth = useCallback(async (): Promise<boolean> => {
    try {
      const response = await apiService.refreshToken();
      
      if (response.success && response.data) {
        setAuthState({
          user: response.data.user,
          isAuthenticated: true,
          token: response.data.token,
          refreshToken: response.data.refreshToken,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Refresh auth error:', error);
      await logout();
      return false;
    }
  }, [logout]);

  // Verificar autenticación al cargar
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const success = await refreshAuth();
        if (!success) {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [refreshAuth]);

  return {
    authState,
    login,
    logout,
    refreshAuth,
    isLoading,
  };
};