import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { STORAGE_KEYS } from '../utils/constants';
import { AuthState, AuthContextType, LoginDto, User } from '../types/core/auth';
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

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verificar autenticación al cargar la aplicación
  useEffect(() => {
    let isMounted = true; // Prevenir actualizaciones si el componente se desmonta

    const checkAuthStatus = async () => {
      try {
        console.log('🚀 Verificando autenticación...');
        
        // PASO 1: Obtener datos del localStorage
        const storedAuth = authService.getStoredAuthData();
        
        if (!storedAuth || !storedAuth.token) {
          console.log('❌ No hay datos de autenticación almacenados');
          if (isMounted) {
            dispatch({ type: 'AUTH_LOGOUT' });
          }
          return;
        }

        console.log('📦 Datos encontrados en localStorage');

        // PASO 2: Verificar formato del token
        if (!authService.isValidTokenFormat(storedAuth.token)) {
          console.log('❌ Formato de token inválido');
          authService.clearAuthData();
          if (isMounted) {
            dispatch({ type: 'AUTH_LOGOUT' });
          }
          return;
        }

        // ✅ PASO 3: Verificar expiración - CORREGIDO
        console.log('⏰ Verificando expiración del token...');
        try {
          // Decodificar el token para obtener el timestamp de expiración
          const base64Url = storedAuth.token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const tokenPayload = JSON.parse(jsonPayload);
          
          if (!tokenPayload.exp) {
            console.log('❌ Token no tiene fecha de expiración');
            authService.clearAuthData();
            if (isMounted) {
              dispatch({ type: 'AUTH_LOGOUT' });
            }
            return;
          }

          // Verificar si el token ha expirado (exp está en segundos, Date.now() en milisegundos)
          const now = Math.floor(Date.now() / 1000);
          if (tokenPayload.exp <= now) {
            console.log('⏰ Token expirado', {
              exp: new Date(tokenPayload.exp * 1000),
              now: new Date(),
              expired: true
            });
            authService.clearAuthData();
            if (isMounted) {
              dispatch({ type: 'AUTH_LOGOUT' });
            }
            return;
          }

          console.log('✅ Token válido, expira en:', new Date(tokenPayload.exp * 1000));

        } catch (error) {
          console.error('❌ Error decodificando token:', error);
          authService.clearAuthData();
          if (isMounted) {
            dispatch({ type: 'AUTH_LOGOUT' });
          }
          return;
        }

        // PASO 4: Validar token con el servidor (opcional - comentado para simplificar)
        // console.log('🔍 Validando token con el servidor...');
        // const isValidOnServer = await validateTokenWithServer(storedAuth.token);
        // if (!isValidOnServer) {
        //   console.log('❌ Token inválido en el servidor');
        //   authService.clearAuthData();
        //   if (isMounted) {
        //     dispatch({ type: 'AUTH_LOGOUT' });
        //   }
        //   return;
        // }

        // PASO 5: Token válido, restaurar sesión
        console.log('✅ Token válido, restaurando sesión');
        if (isMounted) {
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: storedAuth.user,
              token: storedAuth.token,
            },
          });
        }

      } catch (error) {
        console.error('❌ Error al verificar autenticación:', error);
        authService.clearAuthData();
        if (isMounted) {
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      }
    };

    // ✅ Función para validar token con el servidor (opcional)
    const validateTokenWithServer = async (token: string): Promise<boolean> => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://localhost:7191/api'}/auth/validate-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ token }), // ✅ CORREGIDO: enviar como objeto
        });

        return response.ok;
      } catch (error) {
        console.error('Error validando token:', error);
        return false;
      }
    };

    checkAuthStatus();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []); // Solo ejecutar una vez al montar

  // Función de login
  const login = async (credentials: LoginDto): Promise<void> => {
    console.log('🔐 Iniciando login...');

    dispatch({ type: 'AUTH_START' });

    try {
      // Validar credenciales
      if (!credentials.nombre?.trim() || !credentials.password?.trim()) {
        throw new Error('Por favor completa todos los campos');
      }

      // Realizar login
      const authResult = await authService.login(credentials);
      console.log('✅ Login exitoso');
      
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
      console.error('❌ Error en login:', error);
      
      const errorMessage = error instanceof Error ? 
        error.message : 'Error desconocido';
      
      dispatch({
        type: 'AUTH_FAILURE',
        payload: errorMessage,
      });
      
      throw error;
    }
  };

  // Función de logout
  const logout = async (): Promise<void> => {
    console.log('🚪 Cerrando sesión...');

    try {
      if (state.token) {
        await authService.logout(state.token);
      }
    } catch (error) {
      console.error('⚠️ Error al cerrar sesión en servidor:', error);
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