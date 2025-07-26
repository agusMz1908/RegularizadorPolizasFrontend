// src/services/ApiClient.ts
// ✅ APICLIENT MEJORADO - Con soporte para timeouts extendidos

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
  metadata?: {
    timestamp: string;
    duration: number;
    endpoint: string;
  };
}

export interface RequestConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

class ApiClient {
  private baseURL: string;
  private defaultTimeout: number;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'https://localhost:7191/api';
    this.defaultTimeout = parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * ✅ UPLOAD CON TIMEOUT EXTENDIDO Y PROGRESO
   */
  async uploadFileWithExtendedTimeout<T>(
    endpoint: string,
    file: File,
    timeout: number = 300000, // 5 minutos por defecto
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    
    const startTime = Date.now();
    const formData = new FormData();
    formData.append('file', file);

    console.log(`📤 ApiClient: Upload con timeout extendido:`, {
      endpoint,
      fileName: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      timeout: `${timeout / 1000}s`
    });

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      let timeoutId: NodeJS.Timeout;

      // ✅ Configurar timeout manual
      timeoutId = setTimeout(() => {
        xhr.abort();
        resolve({
          success: false,
          error: `Timeout después de ${timeout / 1000} segundos. El procesamiento puede continuar en segundo plano.`,
          status: 408,
          metadata: {
            timestamp: new Date().toISOString(),
            duration: Date.now() - startTime,
            endpoint
          }
        });
      }, timeout);

      // ✅ Progreso de upload
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(Math.min(progress, 95)); // Máximo 95% para el upload
          }
        });
      }

      // ✅ Manejo de respuesta
      xhr.addEventListener('load', () => {
        clearTimeout(timeoutId);
        
        const duration = Date.now() - startTime;
        console.log(`✅ Upload completado en ${duration}ms`);

        try {
          const response = JSON.parse(xhr.responseText);
          resolve({
            success: xhr.status >= 200 && xhr.status < 300,
            data: response,
            error: xhr.status >= 400 ? response.message || `HTTP ${xhr.status}` : undefined,
            status: xhr.status,
            metadata: {
              timestamp: new Date().toISOString(),
              duration,
              endpoint
            }
          });
        } catch (parseError) {
          resolve({
            success: false,
            error: 'Error parseando respuesta del servidor',
            status: xhr.status,
            metadata: {
              timestamp: new Date().toISOString(),
              duration,
              endpoint
            }
          });
        }
      });

      // ✅ Manejo de errores
      xhr.addEventListener('error', () => {
        clearTimeout(timeoutId);
        const duration = Date.now() - startTime;
        
        console.error('❌ Error en upload:', xhr.statusText);
        resolve({
          success: false,
          error: `Error de red: ${xhr.statusText || 'Conexión fallida'}`,
          status: xhr.status || 0,
          metadata: {
            timestamp: new Date().toISOString(),
            duration,
            endpoint
          }
        });
      });

      // ✅ Manejo de abort
      xhr.addEventListener('abort', () => {
        clearTimeout(timeoutId);
        const duration = Date.now() - startTime;
        
        console.log('🛑 Upload cancelado');
        resolve({
          success: false,
          error: 'Upload cancelado',
          status: 0,
          metadata: {
            timestamp: new Date().toISOString(),
            duration,
            endpoint
          }
        });
      });

      // ✅ Configurar y enviar request
      xhr.open('POST', `${this.baseURL}${endpoint}`);
      
      // Headers de autenticación
      const authHeaders = this.getAuthHeaders();
      Object.entries(authHeaders).forEach(([key, value]) => {
        if (key !== 'Content-Type') { // No incluir Content-Type para FormData
          xhr.setRequestHeader(key, value);
        }
      });

      xhr.send(formData);
    });
  }

  /**
   * ✅ GET CON CONFIGURACIÓN FLEXIBLE Y QUERY PARAMETERS
   */
  async get<T>(
    endpoint: string, 
    timeoutOrParams?: number | Record<string, any>,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    
    let timeout = this.defaultTimeout;
    let queryParams: Record<string, any> = {};
    
    // ✅ Manejar parámetros flexibles
    if (typeof timeoutOrParams === 'number') {
      timeout = timeoutOrParams;
    } else if (typeof timeoutOrParams === 'object' && timeoutOrParams !== null) {
      queryParams = timeoutOrParams;
    }
    
    // ✅ Construir URL con query parameters si no están ya en el endpoint
    let fullEndpoint = endpoint;
    if (Object.keys(queryParams).length > 0 && !endpoint.includes('?')) {
      const searchParams = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      
      if (searchParams.toString()) {
        fullEndpoint = `${endpoint}?${searchParams.toString()}`;
      }
    }
    
    return this.request<T>('GET', fullEndpoint, undefined, {
      timeout,
      ...config
    });
  }

  /**
   * ✅ POST CON CONFIGURACIÓN FLEXIBLE
   */
  async post<T>(
    endpoint: string, 
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    
    return this.request<T>('POST', endpoint, data, config);
  }

  /**
   * ✅ REQUEST GENÉRICO CON REINTENTOS Y TIMEOUTS
   */
  private async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    
    const {
      timeout = this.defaultTimeout,
      retries = 0,
      retryDelay = 1000,
      signal,
      headers = {}
    } = config || {};

    const startTime = Date.now();
    let lastError: Error | null = null;

    // ✅ Intentos con reintentos
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        console.log(`🌐 ApiClient: ${method} ${endpoint} (intento ${attempt + 1}/${retries + 1})`);

        // ✅ Crear AbortController con timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        // ✅ Combinar signals si se proporciona uno externo
        if (signal) {
          signal.addEventListener('abort', () => controller.abort());
        }

        try {
          const response = await fetch(`${this.baseURL}${endpoint}`, {
            method,
            headers: {
              ...this.defaultHeaders,
              ...this.getAuthHeaders(),
              ...headers
            },
            body: data ? JSON.stringify(data) : undefined,
            signal: controller.signal
          });

          clearTimeout(timeoutId);
          
          const duration = Date.now() - startTime;
          console.log(`✅ Request completado: ${method} ${endpoint} (${duration}ms)`);

          return await this.handleResponse<T>(response, {
            timestamp: new Date().toISOString(),
            duration,
            endpoint
          });

        } finally {
          clearTimeout(timeoutId);
        }

      } catch (error: any) {
        lastError = error;
        const duration = Date.now() - startTime;

        if (error.name === 'AbortError') {
          console.error(`⏰ Timeout después de ${timeout}ms: ${method} ${endpoint}`);
          return {
            success: false,
            error: `Timeout después de ${timeout / 1000} segundos`,
            status: 408,
            metadata: {
              timestamp: new Date().toISOString(),
              duration,
              endpoint
            }
          };
        }

        console.error(`❌ Error en intento ${attempt + 1}:`, error.message);

        // ✅ Si no quedan reintentos, fallar
        if (attempt >= retries) {
          break;
        }

        // ✅ Esperar antes del siguiente intento
        if (retryDelay > 0) {
          console.log(`⏳ Esperando ${retryDelay}ms antes del siguiente intento...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }

    // ✅ Falló todos los intentos
    const duration = Date.now() - startTime;
    return {
      success: false,
      error: lastError?.message || 'Error desconocido',
      status: 0,
      metadata: {
        timestamp: new Date().toISOString(),
        duration,
        endpoint
      }
    };
  }

  /**
   * ✅ MANEJO MEJORADO DE RESPUESTAS
   */
  private async handleResponse<T>(
    response: Response, 
    metadata: { timestamp: string; duration: number; endpoint: string }
  ): Promise<ApiResponse<T>> {
    
    try {
      const responseText = await response.text();
      let data: any;

      // ✅ Intentar parsear JSON
      try {
        data = responseText ? JSON.parse(responseText) : null;
      } catch {
        // Si no es JSON válido, usar el texto como está
        data = responseText;
      }

      const success = response.ok;

      if (!success) {
        console.error(`❌ HTTP ${response.status}:`, {
          endpoint: metadata.endpoint,
          status: response.status,
          statusText: response.statusText,
          data
        });
      }

      return {
        success,
        data: success ? data : undefined,
        error: !success ? (data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`) : undefined,
        status: response.status,
        metadata
      };

    } catch (error: any) {
      console.error('❌ Error procesando respuesta:', error);
      return {
        success: false,
        error: `Error procesando respuesta: ${error.message}`,
        status: response.status,
        metadata
      };
    }
  }

  /**
   * ✅ HEADERS DE AUTENTICACIÓN
   */
private getAuthHeaders(): Record<string, string> {
  const token = this.getStoredToken();
  
  if (!token) {
    console.warn('🔐 ApiClient: No se encontró token de autenticación');
    return {};
  }

  // Verificar si el token es válido
  if (!this.isTokenValid(token)) {
    console.warn('🔐 ApiClient: Token expirado, removiendo del storage');
    this.removeStoredToken();
    return {};
  }

  console.log('🔐 ApiClient: Usando token de autenticación');
  return { 'Authorization': `Bearer ${token}` };
}

private getStoredToken(): string | null {
  // Buscar en múltiples posibles keys
  const possibleKeys = [
    'authToken',
    'regularizador_token',
    import.meta.env.VITE_JWT_STORAGE_KEY || 'regularizador_token'
  ];

  for (const key of possibleKeys) {
    const token = localStorage.getItem(key);
    if (token) {
      console.log(`🔐 ApiClient: Token encontrado en key: ${key}`);
      return token;
    }
  }

  console.warn('🔐 ApiClient: No se encontró token en ningún storage key');
  return null;
}

private isTokenValid(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    const isValid = payload.exp > now;
    
    if (!isValid) {
      console.warn('🔐 ApiClient: Token expirado', {
        exp: new Date(payload.exp * 1000),
        now: new Date()
      });
    }
    
    return isValid;
  } catch (error) {
    console.error('🔐 ApiClient: Error validando token:', error);
    return false;
  }
}

private removeStoredToken(): void {
  const possibleKeys = [
    'authToken',
    'regularizador_token',
    import.meta.env.VITE_JWT_STORAGE_KEY || 'regularizador_token'
  ];

  possibleKeys.forEach(key => {
    localStorage.removeItem(key);
  });
}


  /**
   * ✅ MÉTODOS DE UTILIDAD
   */
  
  setBaseURL(url: string): void {
    this.baseURL = url;
  }

  setDefaultTimeout(timeout: number): void {
    this.defaultTimeout = timeout;
  }

  setDefaultHeaders(headers: Record<string, string>): void {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }

  /**
   * ✅ CREAR ABORT CONTROLLER PARA CANCELACIONES
   */
  createAbortController(timeout?: number): AbortController {
    const controller = new AbortController();
    
    if (timeout) {
      setTimeout(() => controller.abort(), timeout);
    }
    
    return controller;
  }

  /**
   * ✅ LEGACY METHODS (mantener compatibilidad)
   */
  async uploadFile<T>(endpoint: string, file: File): Promise<ApiResponse<T>> {
    return this.uploadFileWithExtendedTimeout<T>(endpoint, file, this.defaultTimeout);
  }
}

export const apiClient = new ApiClient();