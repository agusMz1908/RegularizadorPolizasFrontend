import { STORAGE_KEYS, API_CONFIG } from '../utils/constants';

export interface ApiClientOptions {
  timeout?: number;
  retries?: number;
  baseURL?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode: number;
}

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private retries: number;

  constructor(options: ApiClientOptions = {}) {
    this.baseURL = options.baseURL || API_CONFIG.BASE_URL;
    this.timeout = options.timeout || API_CONFIG.TIMEOUT;
    this.retries = options.retries || API_CONFIG.RETRIES;
    
    console.log('🔧 ApiClient initialized:', {
      baseURL: this.baseURL,
      timeout: this.timeout,
      retries: this.retries
    });
  }

  public getToken(): string | null {
  return this.getStoredToken();
    }

  public getStoredToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  private getAuthHeaders(): Record<string, string> {
    const token = this.getStoredToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔑 Token agregado a headers');
    } else {
      console.warn('⚠️ No hay token disponible');
    }
    
    return headers;
  }

  private async handleError(response: Response): Promise<never> {
    let errorMessage = `Error HTTP ${response.status}`;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      errorMessage = `${errorMessage}: ${response.statusText}`;
    }

    // Manejo específico de errores
    if (response.status === 401) {
      console.error('🚫 Sesión expirada');
      // Disparar evento para logout automático
      window.dispatchEvent(new CustomEvent('auth:session-expired'));
    }

    const error = new Error(errorMessage);
    (error as any).statusCode = response.status;
    throw error;
  }

  private async executeRequest<T>(
    endpoint: string, 
    options: RequestInit = {},
    attempt = 1
  ): Promise<ApiResponse<T>> {
    try {
      const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
      
      console.log(`📡 [${options.method || 'GET'}] ${url} (intento ${attempt})`);

      const config: RequestInit = {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
        signal: AbortSignal.timeout(this.timeout),
      };

      const response = await fetch(url, config);

      if (!response.ok) {
        // Si es 401 o 403, no reintentamos
        if (response.status === 401 || response.status === 403) {
          await this.handleError(response);
        }
        
        // Para otros errores, reintentamos si es posible
        if (attempt < this.retries && response.status >= 500) {
          console.warn(`⚠️ Error ${response.status}, reintentando... (${attempt}/${this.retries})`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          return this.executeRequest(endpoint, options, attempt + 1);
        }
        
        await this.handleError(response);
      }

      const data = await response.json();
      
      console.log(`✅ Request exitoso: ${response.status}`);
      
      return {
        success: true,
        data,
        statusCode: response.status
      };

    } catch (error: any) {
      console.error(`❌ Request falló:`, error);
      
      // Reintentamos solo para errores de red
      if (attempt < this.retries && (error.name === 'AbortError' || error.message.includes('fetch'))) {
        console.warn(`⚠️ Error de red, reintentando... (${attempt}/${this.retries})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        return this.executeRequest(endpoint, options, attempt + 1);
      }

      return {
        success: false,
        error: error.message || 'Error desconocido',
        statusCode: error.statusCode || 0
      };
    }
  }

  // Métodos públicos
  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      url += `?${searchParams.toString()}`;
    }
    
    return this.executeRequest<T>(url, { method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.executeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.executeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.executeRequest<T>(endpoint, { method: 'DELETE' });
  }

async uploadFile<T = any>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<T>> {
  try {
    console.log('📤 ApiClient.uploadFile: Preparando upload...', {
      endpoint,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      additionalData
    });

    const formData = new FormData();
    
    formData.append('file', file, file.name);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    console.log('📋 FormData contents:');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    }

    const token = this.getStoredToken();
    const headers: Record<string, string> = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    console.log('🔑 Headers para upload:', headers);

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    console.log('🌐 URL del upload:', url);

    console.log('🚀 Iniciando upload...');
    
    const response = await fetch(url, {
      method: 'POST',
      headers, 
      body: formData,
      signal: AbortSignal.timeout(this.timeout),
    });

    console.log('📡 Respuesta del servidor:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      let errorMessage = `Error HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorText = await response.text();
        console.error('❌ Error response body:', errorText);

        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (parseError) {
        console.error('❌ No se pudo parsear error response:', parseError);
        errorMessage = `${errorMessage}`;
      }

      if (response.status === 415) {
        errorMessage = 'El servidor no puede procesar el tipo de archivo enviado. Verifica que sea un PDF válido.';
      } else if (response.status === 413) {
        errorMessage = 'El archivo es demasiado grande para el servidor.';
      } else if (response.status === 401) {
        errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
      } else if (response.status === 400) {
        errorMessage = 'Archivo inválido o datos incorrectos.';
      }

      const error = new Error(errorMessage);
      (error as any).statusCode = response.status;
      throw error;
    }

    const responseData = await response.json();
    
    console.log('✅ Upload exitoso. Datos recibidos:', responseData);
    
    return {
      success: true,
      data: responseData,
      statusCode: response.status
    };

  } catch (error: any) {
    console.error('❌ Error en uploadFile:', error);
    
    return {
      success: false,
      error: error.message || 'Error desconocido en upload',
      statusCode: error.statusCode || 0
    };
  }
}

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get('/health');
      return response.success;
    } catch {
      return false;
    }
  }
}

export const apiClient = new ApiClient();