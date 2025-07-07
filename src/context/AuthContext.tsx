// src/context/AuthContext.tsx
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthState, AuthContextType, LoginDto, User } from '../types/auth';
import authService from '../services/authService';

// Estado inicial
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Tipos de acciones
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    default:
      return state;
  }
}

// Context
const AuthContext = createContext<AuthContextType | null>(null);

// Provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verificar autenticación al cargar la app
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const storedAuth = authService.getStoredAuthData();
        
        if (!storedAuth) {
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }

        // Verificar si el token es válido
        const isValid = await authService.validateToken(storedAuth.token);
        
        if (isValid) {
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: storedAuth.user,
              token: storedAuth.token,
            },
          });
        } else {
          // Token inválido, limpiar datos
          authService.clearAuthData();
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        authService.clearAuthData();
        dispatch({ type: 'AUTH_LOGOUT' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuthStatus();
  }, []);

  // Función de login
  const login = async (credentials: LoginDto): Promise<void> => {
    dispatch({ type: 'AUTH_START' });

    try {
      // Validar credenciales
      if (!credentials.nombre?.trim() || !credentials.password?.trim()) {
        throw new Error('Por favor completa todos los campos');
      }

      // Realizar login
      const authResult = await authService.login(credentials);
      
      // Obtener datos completos del usuario
      const user = await authService.getCurrentUser(authResult.token);
      
      // Guardar en localStorage
      authService.saveAuthData(authResult, user);
      
      // Actualizar estado
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user,
          token: authResult.token,
        },
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      dispatch({
        type: 'AUTH_FAILURE',
        payload: errorMessage,
      });
      throw error; // Re-throw para que el componente pueda manejarlo
    }
  };

  // Función de logout
  const logout = async (): Promise<void> => {
    try {
      if (state.token) {
        await authService.logout(state.token);
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      // Limpiar datos locales
      authService.clearAuthData();
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  // Limpiar errores
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Valor del context
  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar el context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  
  return context;
}

// Hook para verificar permisos
export function usePermissions() {
  const { user } = useAuth();

  const hasPermission = (requiredPermission: string): boolean => {
    if (!user) return false;

    return user.roles.some(role =>
      role.permissions.some(permission => permission.name === requiredPermission)
    );
  };

  const hasRole = (requiredRole: string): boolean => {
    if (!user) return false;

    return user.roles.some(role => role.name === requiredRole);
  };

  const hasAnyRole = (requiredRoles: string[]): boolean => {
    if (!user) return false;

    return user.roles.some(role => requiredRoles.includes(role.name));
  };

  return {
    hasPermission,
    hasRole,
    hasAnyRole,
    userRoles: user?.roles.map(role => role.name) || [],
    userPermissions: user?.roles.flatMap(role => 
      role.permissions.map(permission => permission.name)
    ) || [],
  };
}