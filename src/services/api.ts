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
        const token = this.getTokenFromStorage();
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('🔐 Token agregado a request:', {
            url: config.url,
            tokenLength: token.length,
            tokenStart: token.substring(0, 20) + '...'
          });
        } else {
          console.log('⚠️ No hay token disponible para:', config.url);
          console.log('⚠️ Revisando storage:', {
            regularizador_auth: !!localStorage.getItem('regularizador_auth'),
            auth_token: !!localStorage.getItem('auth_token'),
            regularizador_token: !!localStorage.getItem('regularizador_token')
          });
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
        console.error('❌ API Error:', {
          url: error.config?.url,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
        
        if (error.response?.status === 401) {
          console.log('🚪 401 detectado - token inválido o expirado');
          this.clearAuthData();
          
          // Disparar evento de logout
          window.dispatchEvent(new CustomEvent('auth:logout'));
        }
        
        return Promise.reject(error);
      }
    );
  }

  private getTokenFromStorage(): string | null {
    try {
      // Intentar múltiples fuentes de token
      const sources = [
        'regularizador_auth',    // AuthContext
        'auth_token',            // Backup
        'regularizador_token'    // Variable de entorno
      ];

      for (const source of sources) {
        const stored = localStorage.getItem(source);
        if (!stored) continue;

        if (source === 'regularizador_auth') {
          // Formato del AuthContext
          try {
            const authData = JSON.parse(stored);
            
            // Verificar expiración
            if (authData.expiration && new Date(authData.expiration) < new Date()) {
              console.log('⏰ Token expirado en:', source);
              continue;
            }

            if (authData.token) {
              console.log('✅ Token encontrado en:', source);
              return authData.token;
            }
          } catch (e) {
            console.error('❌ Error parseando auth data:', e);
            continue;
          }
        } else {
          // Token directo
          console.log('✅ Token encontrado en:', source);
          return stored;
        }
      }

      console.log('❌ No se encontró token válido en ninguna fuente');
      return null;
    } catch (error) {
      console.error('❌ Error leyendo token:', error);
      return null;
    }
  }

  private clearAuthData(): void {
    const keys = [
      'regularizador_auth',
      'auth_token', 
      'refresh_token',
      'regularizador_token',
      'regularizador_user'
    ];
    
    keys.forEach(key => {
      localStorage.removeItem(key);
      console.log('🗑️ Removed:', key);
    });
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

  private handleError(error: any): ApiResponse<any> {
    if (error.response) {
      console.error('❌ Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url
      });

      return {
        success: false,
        error: error.response.data?.message || error.response.statusText || 'Error del servidor',
        statusCode: error.response.status,
      };
    } else if (error.request) {
      console.error('❌ Error Request:', error.request);
      return {
        success: false,
        error: 'No se pudo conectar con el servidor',
        statusCode: 0,
      };
    } else {
      console.error('❌ Error:', error.message);
      return {
        success: false,
        error: error.message || 'Error desconocido',
        statusCode: 0,
      };
    }
  }

  // Método para verificar si hay token disponible
  public hasValidToken(): boolean {
    const token = this.getTokenFromStorage();
    return !!token;
  }

  // Método para obtener el token actual (para debugging)
  public getCurrentToken(): string | null {
    return this.getTokenFromStorage();
  }

  // Método para debug del estado de autenticación
  public debugAuthState(): void {
    console.log('🔍 DEBUG AUTH STATE:');
    console.log('- regularizador_auth:', localStorage.getItem('regularizador_auth'));
    console.log('- auth_token:', localStorage.getItem('auth_token'));
    console.log('- regularizador_token:', localStorage.getItem('regularizador_token'));
    console.log('- Current token:', this.getCurrentToken()?.substring(0, 20) + '...');
  }
}

export const apiService = new ApiService();
export default apiService;
