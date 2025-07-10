// src/services/api.ts - UNIFICADO
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, LoginRequest, LoginResponse } from '../types/api';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'https://localhost:7191/api',
      timeout: 120000, // 🔧 AUMENTAR A 2 MINUTOS para consultas de Velneo
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor para agregar el token CORRECTO
    this.client.interceptors.request.use(
      (config) => {
        // LEER EL TOKEN DEL MISMO LUGAR QUE AuthService
        const token = this.getTokenFromAuthService();
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('🔐 Token agregado a request:', config.url);
        } else {
          console.log('⚠️ No hay token disponible para:', config.url);
        }
        
        return config;
      },
      (error) => {
        console.error('❌ Error en request interceptor:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor para manejar errores
    this.client.interceptors.response.use(
      (response) => {
        console.log('✅ API Response OK:', response.config.url);
        return response;
      },
      async (error) => {
        console.error('❌ API Error:', error.config?.url, error.response?.status);
        
        if (error.response?.status === 401) {
          console.log('🚪 401 detectado - token inválido, limpiando datos...');
          this.clearAuthData();
          
          // Recargar la página para forzar el login
          window.location.reload();
        }
        
        return Promise.reject(error);
      }
    );
  }

  /**
   * Obtener token del mismo storage que AuthService
   */
  private getTokenFromAuthService(): string | null {
    try {
      const stored = localStorage.getItem('regularizador_auth');
      if (!stored) return null;

      const authData = JSON.parse(stored);
      
      // Verificar expiración
      if (authData.expiration && new Date(authData.expiration) < new Date()) {
        console.log('⏰ Token expirado en ApiService');
        this.clearAuthData();
        return null;
      }

      return authData.token || null;
    } catch (error) {
      console.error('❌ Error leyendo token:', error);
      return null;
    }
  }

  /**
   * Limpiar datos de autenticación
   */
  private clearAuthData(): void {
    localStorage.removeItem('regularizador_auth');
    localStorage.removeItem('auth_token'); // Por compatibilidad
    localStorage.removeItem('refresh_token');
  }

  /**
   * Métodos HTTP con mejor manejo de errores
   */
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      console.log('📡 GET Request:', url);
      const response: AxiosResponse<T> = await this.client.get(url, config);
      
      return {
        success: true,
        data: response.data,
        statusCode: response.status,
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      console.log('📡 POST Request:', url);
      const response: AxiosResponse<T> = await this.client.post(url, data, config);
      
      return {
        success: true,
        data: response.data,
        statusCode: response.status,
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      console.log('📡 PUT Request:', url);
      const response: AxiosResponse<T> = await this.client.put(url, data, config);
      
      return {
        success: true,
        data: response.data,
        statusCode: response.status,
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      console.log('📡 DELETE Request:', url);
      const response: AxiosResponse<T> = await this.client.delete(url, config);
      
      return {
        success: true,
        data: response.data,
        statusCode: response.status,
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * Manejo centralizado de errores
   */
  private handleError<T>(error: any): ApiResponse<T> {
    console.error('🚨 API Error Details:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });

    let message = 'Error desconocido';
    let statusCode = 500;

    if (error.response) {
      // El servidor respondió con un código de error
      statusCode = error.response.status;
      
      switch (statusCode) {
        case 400:
          message = 'Solicitud inválida';
          break;
        case 401:
          message = 'No autorizado - token inválido o expirado';
          break;
        case 403:
          message = 'Acceso denegado';
          break;
        case 404:
          message = 'Recurso no encontrado';
          break;
        case 500:
          message = 'Error interno del servidor';
          break;
        default:
          message = error.response.data?.message || `Error ${statusCode}`;
      }
    } else if (error.request) {
      // La solicitud se hizo pero no hubo respuesta
      message = 'Error de conexión - verifica tu conexión a internet';
      statusCode = 0;
    } else {
      // Error en la configuración de la solicitud
      message = error.message || 'Error configurando la solicitud';
    }

    return {
      success: false,
      error: message,
      statusCode,
    };
  }

  /**
   * Métodos de autenticación
   */
  public async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.post<LoginResponse>('/auth/login', credentials);
  }

  public async logout(): Promise<ApiResponse<void>> {
    const response = await this.post<void>('/auth/logout');
    
    // Limpiar tokens después del logout
    this.clearAuthData();
    
    return response;
  }

  public async refreshToken(): Promise<ApiResponse<LoginResponse>> {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      return {
        success: false,
        error: 'No hay refresh token disponible',
        statusCode: 401,
      };
    }

    return this.post<LoginResponse>('/auth/refresh', { refreshToken });
  }

  /**
   * Verificar si el cliente está autenticado
   */
  public isAuthenticated(): boolean {
    const token = this.getTokenFromAuthService();
    return !!token;
  }

  /**
   * Obtener el token actual
   */
  public getCurrentToken(): string | null {
    return this.getTokenFromAuthService();
  }
}

// Exportar instancia singleton
export const apiService = new ApiService();
export default apiService;