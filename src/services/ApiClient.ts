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

  // ✅ OBTENER HEADERS DE AUTENTICACIÓN ANTES DE CREAR EL XMLHttpRequest
  const authHeaders = this.getAuthHeaders();
  console.log('🔐 Headers de autenticación para upload:', authHeaders);

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    let timeoutId: NodeJS.Timeout;

    // ✅ Configurar timeout manual
    timeoutId = setTimeout(() => {
      xhr.abort();
      resolve({
        success: false,
        error: `Timeout después de ${timeout / 1000} segundos`,
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
          onProgress(Math.min(progress, 95));
        }
      });
    }

    // ✅ Manejo de respuesta
    xhr.addEventListener('load', () => {
      clearTimeout(timeoutId);
      
      const duration = Date.now() - startTime;
      console.log(`✅ Upload completado en ${duration}ms`, { status: xhr.status });

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

    // ✅ Configurar y enviar request
    xhr.open('POST', `${this.baseURL}${endpoint}`);
    
    // ✅ AÑADIR HEADERS DE AUTENTICACIÓN CORRECTAMENTE
    Object.entries(authHeaders).forEach(([key, value]) => {
      console.log(`🔐 Añadiendo header: ${key}: ${value.substring(0, 20)}...`);
      xhr.setRequestHeader(key, value);
    });

    // ✅ NO añadir Content-Type para FormData (el browser lo añade automáticamente)
    console.log('📤 Enviando FormData con file:', file.name);
    xhr.send(formData);
  });
}

  /**
   * ✅ GET CON CONFIGURACIÓN FLEXIBLE Y QUERY PARAMETERS
   */
// src/services/ApiClient.ts
// ✅ CORRECCIÓN COMPLETA DEL PROBLEMA DE AUTENTICACIÓN

/**
 * ✅ GET CON CONFIGURACIÓN FLEXIBLE Y QUERY PARAMETERS - VERSIÓN CORREGIDA
 */
async get<T>(
  endpoint: string, 
  paramsOrTimeout?: Record<string, any> | number,
  config?: RequestConfig
): Promise<ApiResponse<T>> {
  
  let timeout = this.defaultTimeout;
  let queryParams: Record<string, any> = {};
  let requestConfig: RequestConfig = {};
  
  // ✅ Manejar diferentes tipos de parámetros
  if (typeof paramsOrTimeout === 'number') {
    // Caso: apiClient.get('/endpoint', 15000)
    timeout = paramsOrTimeout;
  } else if (typeof paramsOrTimeout === 'object' && paramsOrTimeout !== null) {
    // Caso: apiClient.get('/endpoint', { filtro: 'leo' })
    queryParams = paramsOrTimeout;
  }
  
  // ✅ Combinar config
  if (config) {
    requestConfig = { ...config };
    if (config.timeout) {
      timeout = config.timeout;
    }
  }
  
  // ✅ Construir URL con query parameters SOLO si no están ya en el endpoint
  let fullEndpoint = endpoint;
  
  if (Object.keys(queryParams).length > 0 && !endpoint.includes('?')) {
    const searchParams = new URLSearchParams();
    
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    
    const queryString = searchParams.toString();
    if (queryString) {
      fullEndpoint = `${endpoint}?${queryString}`;
    }
  }
  
  console.log(`🌐 ApiClient GET: ${fullEndpoint}`);
  console.log(`🔐 Query params enviados:`, queryParams);
  
  return this.request<T>('GET', fullEndpoint, undefined, {
    timeout,
    ...requestConfig
  });
}

/**
 * ✅ REQUEST GENÉRICO CON REINTENTOS Y TIMEOUTS - VERSIÓN CORREGIDA
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

      // ✅ Obtener headers de autenticación
      const authHeaders = this.getAuthHeaders();
      console.log('🔐 Headers de auth para request:', Object.keys(authHeaders));

      try {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
          method,
          headers: {
            ...this.defaultHeaders,
            ...authHeaders,  // ✅ Headers de autenticación aquí
            ...headers      // ✅ Headers adicionales del config
          },
          body: data ? (method === 'GET' ? undefined : JSON.stringify(data)) : undefined,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        return await this.handleResponse<T>(response, {
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime,
          endpoint
        });

      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          throw new Error(`Timeout de ${timeout}ms excedido`);
        }
        
        throw fetchError;
      }

    } catch (error: any) {
      lastError = error;
      
      // ✅ No reintentar en ciertos errores
      if (error.message?.includes('401') || error.message?.includes('403')) {
        console.error('❌ Error de autenticación, no reintentando');
        break;
      }
      
      if (attempt < retries) {
        console.warn(`⚠️ Intento ${attempt + 1} fallido, reintentando en ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  // ✅ Si llegamos aquí, todos los intentos fallaron
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


  async post<T>(
    endpoint: string, 
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    
    return this.request<T>('POST', endpoint, data, config);
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
  // ✅ ORDEN CORRECTO: Buscar primero en 'regularizador_token'
  const possibleKeys = [
    'regularizador_token',  // ✅ Esta es la key principal que usa authService
    'authToken',
    import.meta.env.VITE_JWT_STORAGE_KEY || 'regularizador_token'
  ];

  for (const key of possibleKeys) {
    const token = localStorage.getItem(key);
    if (token && token.trim()) {
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
  // ✅ LIMPIAR TODAS LAS POSIBLES KEYS
  const possibleKeys = [
    'regularizador_token',
    'regularizador_user',
    'authToken',
    import.meta.env.VITE_JWT_STORAGE_KEY || 'regularizador_token'
  ];

  possibleKeys.forEach(key => {
    localStorage.removeItem(key);
  });
  
  console.log('🧹 ApiClient: Tokens removidos del localStorage');
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