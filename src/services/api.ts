// src/services/api.ts - CORREGIDO
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, LoginRequest, LoginResponse } from '../types/api';

class ApiService {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      // CORREGIDO: Cambiar REACT_APP_ por VITE_ para Vite
      baseURL: import.meta.env.VITE_API_URL || 'https://localhost:7191/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    this.loadTokenFromStorage();
  }

  private setupInterceptors(): void {
    // Request interceptor para agregar el token
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor para manejar errores globales
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          this.clearToken();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  private loadTokenFromStorage(): void {
    this.token = localStorage.getItem('auth_token');
  }

  public setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  public clearToken(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
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

  public async uploadFile<T>(
    url: string, 
    file: File, 
    onUploadProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response: AxiosResponse<T> = await this.client.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onUploadProgress) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onUploadProgress(progress);
          }
        },
      });

      return {
        success: true,
        data: response.data,
        statusCode: response.status,
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  private handleError(error: any): ApiResponse {
    const message = error.response?.data?.message || error.message || 'Error desconocido';
    const statusCode = error.response?.status || 500;
    
    console.error('API Error:', {
      message,
      statusCode,
      url: error.config?.url,
      method: error.config?.method,
    });

    return {
      success: false,
      error: message,
      statusCode,
    };
  }

  // Métodos de autenticación
  public async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await this.post<LoginResponse>('/auth/login', credentials);
    
    if (response.success && response.data) {
      this.setToken(response.data.token);
      localStorage.setItem('refresh_token', response.data.refreshToken);
    }
    
    return response;
  }

  public async logout(): Promise<void> {
    try {
      await this.post('/auth/logout');
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      this.clearToken();
    }
  }

  public async refreshToken(): Promise<ApiResponse<LoginResponse>> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.post<LoginResponse>('/auth/refresh', { refreshToken });
    
    if (response.success && response.data) {
      this.setToken(response.data.token);
      localStorage.setItem('refresh_token', response.data.refreshToken);
    }
    
    return response;
  }
}

// Singleton instance
export const apiService = new ApiService();