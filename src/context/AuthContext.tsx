// src/context/AuthContext.tsx - VERSIÓN CORREGIDA
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import authService from '../services/authService';
import { LoginDto, User, AuthState, AuthContextType } from '../types/auth';

// Estado inicial - IMPORTANTE: isAuthenticated debe ser false por defecto
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false, // ✅ CLAVE: Comenzar como false
  isLoading: true,        // ✅ CLAVE: Comenzar en loading para verificar
  error: null,
};

// Tipos de acciones
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_ERROR' };

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
        isAuthenticated: true, // ✅ Solo true cuando login exitoso
        isLoading: false,
        error: null,
      };

    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false, // ✅ False en caso de error
        isLoading: false,
        error: action.payload,
      };

    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false, // ✅ False al hacer logout
        isLoading: false,
        error: null,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

// Contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ✅ VERIFICACIÓN INICIAL - Solo ejecutar una vez al cargar
  useEffect(() => {
    const checkAuthStatus = async () => {
      console.log('🔍 Verificando estado de autenticación...');
      
      try {
        // Buscar datos de autenticación guardados
        const storedAuthData = authService.getStoredAuthData();
        
        if (storedAuthData && storedAuthData.token && storedAuthData.user) {
          console.log('✅ Token encontrado, verificando validez...');
          
          // Verificar si el token no ha expirado
          if (!authService.isTokenExpired(storedAuthData.expiration)) {
            console.log('✅ Token válido, autenticando usuario...');
            
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: {
                user: storedAuthData.user,
                token: storedAuthData.token,
              },
            });
          } else {
            console.log('❌ Token expirado, limpiando datos...');
            authService.clearAuthData();
            dispatch({ type: 'AUTH_LOGOUT' });
          }
        } else {
          console.log('❌ No hay datos de autenticación guardados');
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      } catch (error) {
        console.error('❌ Error al verificar autenticación:', error);
        authService.clearAuthData();
        dispatch({ type: 'AUTH_LOGOUT' });
      } finally {
        // ✅ IMPORTANTE: Terminar loading independientemente del resultado
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuthStatus();
  }, []); // ✅ Array vacío - solo ejecutar una vez

  // Función de login
  const login = async (credentials: LoginDto): Promise<void> => {
    console.log('🔄 Iniciando login para:', credentials.nombre);
    dispatch({ type: 'AUTH_START' });

    try {
      // Validar credenciales básicas
      if (!credentials.nombre?.trim() || !credentials.password?.trim()) {
        throw new Error('Por favor completa todos los campos');
      }

      // Realizar login en el backend
      const authResult = await authService.login(credentials);
      
      if (!authResult || !authResult.token) {
        throw new Error('Respuesta inválida del servidor');
      }

      // Obtener datos completos del usuario
      const user = await authService.getCurrentUser(authResult.token);
      
      // Guardar en localStorage
      authService.saveAuthData(authResult, user);
      
      console.log('✅ Login exitoso para:', user.nombre);
      
      // Actualizar estado
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user,
          token: authResult.token,
        },
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido durante el login';
      console.error('❌ Error en login:', errorMessage);
      
      // Limpiar cualquier dato corrupto
      authService.clearAuthData();
      
      dispatch({
        type: 'AUTH_ERROR',
        payload: errorMessage,
      });
    }
  };

  // Función de logout
  const logout = async (): Promise<void> => {
    console.log('🔄 Cerrando sesión...');
    
    try {
      // Intentar logout en el backend si hay token
      if (state.token) {
        await authService.logout(state.token);
      }
    } catch (error) {
      console.warn('⚠️ Error al cerrar sesión en el backend:', error);
    } finally {
      // Limpiar datos locales siempre
      authService.clearAuthData();
      dispatch({ type: 'AUTH_LOGOUT' });
      console.log('✅ Sesión cerrada');
    }
  };

  // Limpiar errores
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Valor del contexto
  const value: AuthContextType = {
    ...state,
    login,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// HOC para componentes protegidos
export const withAuth = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return <div>Cargando...</div>;
    }

    if (!isAuthenticated) {
      return <div>Acceso denegado</div>;
    }

    return <Component {...props} />;
  };
};