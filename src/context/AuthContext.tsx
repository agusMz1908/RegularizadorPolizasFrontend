// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiService } from '@/services/apiService';
import type { User, AuthState, LoginRequest } from '@/types/auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  isTokenExpired: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Inicializar desde localStorage al cargar
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('authUser');
        const storedExpiration = localStorage.getItem('tokenExpiration');

        if (storedToken && storedUser && storedExpiration) {
          const user = JSON.parse(storedUser);
          const expirationDate = new Date(storedExpiration);
          
          // Verificar si el token no ha expirado
          if (expirationDate > new Date()) {
            // Token válido, restaurar sesión
            apiService.setAuthToken(storedToken);
            setState({
              user,
              token: storedToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            
            console.log('✅ Sesión restaurada:', { user: user.nombre, tenantId: user.tenantId });
            return;
          } else {
            // Token expirado, limpiar
            console.log('⏰ Token expirado, limpiando sesión');
            clearStoredAuth();
          }
        }
      } catch (error) {
        console.error('❌ Error inicializando auth:', error);
        clearStoredAuth();
      }

      setState(prev => ({ ...prev, isLoading: false }));
    };

    initializeAuth();
  }, []);

  const clearStoredAuth = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    localStorage.removeItem('tokenExpiration');
    apiService.clearAuth();
  };

  const login = async (credentials: LoginRequest): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('🔐 Intentando login con:', { nombre: credentials.nombre });
      
      const response = await apiService.login(credentials);
      
      const user: User = {
        id: response.userId,
        nombre: response.nombre,
        tenantId: response.tenantId,
      };

      // Guardar en localStorage
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('authUser', JSON.stringify(user));
      localStorage.setItem('tokenExpiration', response.expiration);

      // Configurar token en apiService
      apiService.setAuthToken(response.token);

      setState({
        user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      console.log('✅ Login exitoso:', { 
        user: user.nombre, 
        tenantId: user.tenantId,
        expiration: response.expiration 
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error de autenticación';
      
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });

      console.error('❌ Login fallido:', errorMessage);
      throw error;
    }
  };

  const logout = () => {
    console.log('🔓 Cerrando sesión');
    
    clearStoredAuth();
    
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  const isTokenExpired = (): boolean => {
    const storedExpiration = localStorage.getItem('tokenExpiration');
    if (!storedExpiration) return true;
    
    return new Date(storedExpiration) <= new Date();
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    isTokenExpired,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};