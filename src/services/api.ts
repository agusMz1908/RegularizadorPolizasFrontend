import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, LoginRequest, LoginResponse } from '../types/api';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'https://localhost:7191/api',
      timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 120000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config) => {
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
          
          window.location.reload();
        }
        
        return Promise.reject(error);
      }
    );
  }

  private getTokenFromAuthService(): string | null {
    try {
      const stored = localStorage.getItem('regularizador_auth');
      if (!stored) return null;

      const authData = JSON.parse(stored);

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

  private clearAuthData(): void {
    localStorage.removeItem('regularizador_auth');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
  }

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
      message = 'Error de conexión - verifica tu conexión a internet';
      statusCode = 0;
    } else {
      message = error.message || 'Error configurando la solicitud';
    }

    return {
      success: false,
      error: message,
      statusCode,
    };
  }

  public async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.post<LoginResponse>('/auth/login', credentials);
  }

  public async logout(): Promise<ApiResponse<void>> {
    const response = await this.post<void>('/auth/logout');
    
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

  public isAuthenticated(): boolean {
    const token = this.getTokenFromAuthService();
    return !!token;
  }

  public getCurrentToken(): string | null {
    return this.getTokenFromAuthService();
  }
}

export const apiService = new ApiService();
export default apiService;