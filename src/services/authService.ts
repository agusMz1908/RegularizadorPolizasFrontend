// src/services/authService.ts
import { LoginDto, AuthResultDto, User, Permission, Role } from '../types/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7191/api';

class AuthService {
  private readonly baseUrl = `${API_BASE_URL}/auth`;

  /**
   * Iniciar sesión con credenciales
   */
  async login(credentials: LoginDto): Promise<AuthResultDto> {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Credenciales inválidas. Por favor verifica tu usuario y contraseña.');
        }
        if (response.status === 403) {
          throw new Error('Usuario inactivo. Contacta al administrador.');
        }
        throw new Error(`Error en el servidor: ${response.status}`);
      }

      const data: AuthResultDto = await response.json();
      
      // Validar que recibimos todos los campos necesarios
      if (!data.token || !data.userId || !data.nombre) {
        throw new Error('Respuesta del servidor incompleta');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error de conexión. Verifica tu conexión a internet.');
    }
  }

  /**
   * Obtener información del usuario actual
   * Por ahora usaremos la información que viene en el token de login
   */
  async getCurrentUser(token: string): Promise<User> {
    try {
      // Decodificar el JWT para obtener la información del usuario
      const payload = this.decodeJWT(token);
      
      if (!payload) {
        throw new Error('Token inválido');
      }

      // Simular la estructura User basándose en el token
      const user: User = {
        id: parseInt(payload.nameid || payload.sub || '0'),
        nombre: payload.unique_name || payload.name || '',
        tenantId: payload.tenant || '',
        roles: this.parseRolesFromToken(payload),
        isActive: true,
      };

      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al obtener información del usuario');
    }
  }

  /**
   * Decodificar JWT (versión simple para el cliente)
   */
  private decodeJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1]; // FIX: Completar la línea
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decodificando JWT:', error);
      return null;
    }
  }

  /**
   * Parsear roles desde el token JWT
   */
  private parseRolesFromToken(payload: any): Role[] {
    const roles: Role[] = [];
    
    // El token puede tener roles en diferentes formatos
    const rolesClaim = payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    
    if (rolesClaim) {
      const roleNames = Array.isArray(rolesClaim) ? rolesClaim : [rolesClaim];
      
      roleNames.forEach((roleName: string, index: number) => {
        roles.push({
          id: index + 1,
          name: roleName,
          permissions: [] // Por ahora vacío, se puede extender
        });
      });
    }
    
    return roles;
  }

  /**
   * Cerrar sesión
   */
  async logout(token: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch {
      // Si falla el logout en el servidor, igual limpiamos local
      console.warn('Error al cerrar sesión en el servidor');
    }
  }

  /**
   * Utilidades para manejo de token
   */
  saveAuthData(authResult: AuthResultDto, user: User): void {
    const authData = {
      token: authResult.token,
      user,
      expiration: authResult.expiration,
    };
    localStorage.setItem('regularizador_auth', JSON.stringify(authData));
  }

  getStoredAuthData(): { token: string; user: User; expiration: string } | null {
    try {
      const stored = localStorage.getItem('regularizador_auth');
      if (!stored) return null;

      const authData = JSON.parse(stored);
      
      // Verificar si el token expiró
      if (new Date(authData.expiration) < new Date()) {
        this.clearAuthData();
        return null;
      }

      return authData;
    } catch {
      this.clearAuthData();
      return null;
    }
  }

  clearAuthData(): void {
    localStorage.removeItem('regularizador_auth');
  }

  isTokenExpired(expiration: string): boolean {
    return new Date(expiration) < new Date();
  }

  /**
   * Validar si el token está bien formado
   */
  isValidTokenFormat(token: string): boolean {
    try {
      const parts = token.split('.');
      return parts.length === 3;
    } catch {
      return false;
    }
  }

  /**
   * Interceptor para agregar token automáticamente
   */
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
}

export default new AuthService();