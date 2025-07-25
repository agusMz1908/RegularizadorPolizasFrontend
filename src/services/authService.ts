import { LoginDto, AuthResultDto, User, Permission, Role } from '../types/auth';
import { apiClient } from './ApiClient';
import { ENDPOINTS, STORAGE_KEYS } from '../utils/constants';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7191/api';

class AuthService {
  private readonly baseUrl = `${API_BASE_URL}/auth`;

async login(credentials: LoginDto): Promise<AuthResultDto> {
  console.log('🔐 AuthService: Iniciando login...');
  
  const response = await apiClient.post<AuthResultDto>(ENDPOINTS.AUTH_LOGIN, credentials);
  
  if (!response.success) {
    console.error('❌ Login fallido:', response.error);
    
    // Mapear errores específicos
    if (response.statusCode === 401) {
      throw new Error('Credenciales inválidas. Por favor verifica tu usuario y contraseña.');
    } else if (response.statusCode === 403) {
      throw new Error('Usuario inactivo. Contacta al administrador.');
    } else {
      throw new Error(response.error || 'Error en el servidor. Intenta nuevamente.');
    }
  }
  
  const authResult = response.data!;
  
  // Guardar en localStorage usando constantes
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, authResult.token);
  localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(authResult.nombre));
  
  console.log('✅ Login exitoso:', authResult.nombre);
  
  return authResult;
}

  async getCurrentUser(token: string): Promise<User> {
    const payload = this.decodeJWT(token);
    
    if (!payload) {
      throw new Error('Token inválido');
    }

    const user: User = {
      id: parseInt(payload.nameid || payload.sub || '0'),
      nombre: payload.unique_name || payload.name || '',
      tenantId: payload.tenant || '',
      roles: this.parseRolesFromToken(payload),
      isActive: true,
    };

    return user;
  }

  async logout(token: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      // Si falla el logout en servidor, continuar con limpieza local
    }
  }

  getStoredToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }


  saveAuthData(authResult: AuthResultDto, user: User): void {
    const authData = {
      token: authResult.token,
      user: user,
      expiration: authResult.expiration,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem('regularizador_token', authResult.token);
    localStorage.setItem('regularizador_user', JSON.stringify(authData));
  }

  getStoredAuthData(): { token: string; user: User; expiration: string } | null {
    try {
      const token = localStorage.getItem('regularizador_token');
      const userData = localStorage.getItem('regularizador_user');

      if (!token || !userData) {
        return null;
      }

      const parsedData = JSON.parse(userData);
      return {
        token,
        user: parsedData.user,
        expiration: parsedData.expiration,
      };
    } catch {
      return null;
    }
  }

clearAuthData(): void {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  console.log('🧹 Datos de autenticación limpiados');
}

isTokenExpired(expiration: number): boolean {
  return Date.now() > expiration;
}

  isValidTokenFormat(token: string): boolean {
    try {
      const parts = token.split('.');
      return parts.length === 3;
    } catch {
      return false;
    }
  }

  createAuthenticatedFetch(token: string) {
    return (url: string, options: RequestInit = {}) => {
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    };
  }

  private decodeJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }
  
  getStoredUser(): any | null {
  try {
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
}

  private parseRolesFromToken(payload: any): Role[] {
    const roles: Role[] = [];
    
    if (payload.role) {
      const roleNames = Array.isArray(payload.role) ? payload.role : [payload.role];
      
      roleNames.forEach((roleName: string) => {
        roles.push({
          id: 0,
          name: roleName,
          permissions: [],
        });
      });
    }

    return roles;
  }
}


export default new AuthService();