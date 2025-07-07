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
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  /**
   * Parsear roles del token JWT
   */
  private parseRolesFromToken(payload: any): Role[] {
    const roles: Role[] = [];
    
    // El token puede tener roles en diferentes formatos
    let tokenRoles: string[] = [];
    
    if (payload.role) {
      if (Array.isArray(payload.role)) {
        tokenRoles = payload.role;
      } else {
        tokenRoles = [payload.role];
      }
    }

    // Crear objetos Role básicos
    tokenRoles.forEach((roleName, index) => {
      roles.push({
        id: index + 1,
        name: roleName,
        description: `Rol ${roleName}`,
        permissions: this.getDefaultPermissionsForRole(roleName),
      });
    });

    return roles;
  }

  /**
   * Obtener permisos básicos por rol
   */
  private getDefaultPermissionsForRole(roleName: string): Permission[] {
    const basePermissions: Permission[] = [];
    
    switch (roleName.toLowerCase()) {
      case 'superadmin':
        basePermissions.push(
          { id: 1, name: 'admin.full', resource: 'Admin', action: 'Full', description: 'Acceso completo' },
          { id: 2, name: 'polizas.full', resource: 'Polizas', action: 'Full', description: 'Gestión completa de pólizas' },
          { id: 3, name: 'users.full', resource: 'Users', action: 'Full', description: 'Gestión de usuarios' }
        );
        break;
      case 'admin':
        basePermissions.push(
          { id: 4, name: 'polizas.manage', resource: 'Polizas', action: 'Manage', description: 'Gestionar pólizas' },
          { id: 5, name: 'users.view', resource: 'Users', action: 'View', description: 'Ver usuarios' }
        );
        break;
      case 'manager':
        basePermissions.push(
          { id: 6, name: 'polizas.process', resource: 'Polizas', action: 'Process', description: 'Procesar pólizas' },
          { id: 7, name: 'reports.view', resource: 'Reports', action: 'View', description: 'Ver reportes' }
        );
        break;
      case 'operator':
        basePermissions.push(
          { id: 8, name: 'polizas.upload', resource: 'Polizas', action: 'Upload', description: 'Subir pólizas' }
        );
        break;
      default:
        basePermissions.push(
          { id: 9, name: 'polizas.view', resource: 'Polizas', action: 'View', description: 'Ver pólizas' }
        );
    }

    return basePermissions;
  }

  /**
   * Validar token
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/validate-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(token),
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Renovar token (refresh)
   */
  async refreshToken(token: string): Promise<AuthResultDto> {
    try {
      const response = await fetch(`${this.baseUrl}/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('No se pudo renovar la sesión');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al renovar sesión');
    }
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