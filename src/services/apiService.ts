// src/services/apiService.ts - VERSIÓN CORREGIDA CON TIPOS COMPATIBLES

import type { LoginRequest, LoginResponse } from '@/types/auth';
import type { CompanyDto, MasterDataOptionsDto, SeccionDto } from '../types/masterData';
import { API_CONFIG } from '../constants/velneoDefault';
import type { ClientDto } from '@/types/cliente';
import type { PolizaCreateRequest } from '@/types/poliza';

class ApiService {
  private baseUrl: string;
  private token: string | null = null;
  private timeout: number;

  constructor() {
    // ✅ Obtener configuración desde variables de entorno
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7191/api';
    this.timeout = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000');
    
    // Obtener token del localStorage/contexto de auth
    this.token = this.getStoredToken();
    
    console.log('🔧 ApiService initialized:', {
      baseUrl: this.baseUrl,
      timeout: this.timeout,
      hasToken: !!this.token
    });
  }

  private getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken') || null;
    }
    return null;
  }

  /**
   * 🚀 Request wrapper principal con retry logic mejorado
   */
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {},
    retries: number = API_CONFIG.MAX_RETRIES
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    
    const config: RequestInit = {
      ...options,
      signal: controller.signal,
      headers: {
        // ✅ ASEGURAR Content-Type para JSON
        ...(options.body && !(options.body instanceof FormData) && {
          'Content-Type': 'application/json'
        }),
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        ...options.headers,
      },
    };

    console.log('🔗 API Request:', { 
      url, 
      method: config.method || 'GET',
      hasAuth: !!this.token,
      bodyLength: options.body ? options.body.toString().length : 0
    });

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ API Response:', { status: response.status, dataLength: JSON.stringify(data).length });
      
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`Request timeout after ${this.timeout}ms`);
        }
        console.error('❌ API Error:', error.message);
      }
      
      // Retry logic para errores de red
      if (retries > 0 && !controller.signal.aborted) {
        console.warn(`Request failed, retrying... (${retries} attempts left)`, error);
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
        return this.request<T>(endpoint, options, retries - 1);
      }
      
      throw error;
    }
  }

  // ==============================================
  // 🔐 AUTENTICACIÓN
  // ==============================================

  /**
   * Login de usuario
   * POST /api/auth/login
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    console.log('🔐 Attempting login for user:', credentials.nombre);
    
    const loginPayload = {
      nombre: credentials.nombre,
      password: credentials.password
    };
    
    console.log('📤 Login payload:', loginPayload);
    
    const response = await this.request<LoginResponse>('/Auth/login', {
      method: 'POST',
      body: JSON.stringify(loginPayload)
    });

    // Guardar token automáticamente
    this.setAuthToken(response.token);
    
    console.log('✅ Login successful:', {
      userId: response.userId,
      nombre: response.nombre,
      tenantId: response.tenantId,
      expiration: response.expiration
    });

    return response;
  }

  /**
   * Limpiar autenticación
   */
  clearAuth() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      localStorage.removeItem('tokenExpiration');
    }
    console.log('🔓 Auth cleared');
  }

  // ==============================================
  // 👥 CLIENTES
  // ==============================================

  /**
   * Búsqueda de clientes
   * GET /api/clientes/direct?filtro=texto
   */
  async searchClientes(search: string): Promise<ClientDto[]> {
    if (!search || search.trim().length < 2) {
      return [];
    }

    console.log(`🔍 Buscando clientes: "${search}"`);
    
    const params = new URLSearchParams({ filtro: search.trim() });
    const response = await this.request<any>(`/clientes/direct?${params}`);
    
    // Extraer items del response según la estructura de tu API
    const clientes = response.items || response.data || response || [];
    console.log(`✅ Encontrados ${clientes.length} clientes`);
    
    return clientes;
  }

  /**
   * Obtener cliente por ID
   * GET /api/clientes/{id}
   */
  async getClienteById(id: number): Promise<ClientDto> {
    return this.request<ClientDto>(`/clientes/${id}`);
  }

  // ==============================================
  // 🏢 MAESTROS
  // ==============================================

  /**
   * 📊 Obtener opciones de maestros para el formulario 
   */
async getMasterDataOptions(): Promise<MasterDataOptionsDto> {
  try {
    console.log('🔄 [ApiService] Cargando opciones de maestros...');
    
    const response = await this.request<any>('/velneo/mapping-options', {
      method: 'GET'
    });

    console.log('🔍 [ApiService] Raw response structure:', {
      hasSuccess: 'success' in response,
      hasData: 'data' in response,
      hasCategorias: 'categorias' in response,
      hasDestinos: 'destinos' in response,
      // ✅ TAMBIÉN VERIFICAR PASCALCASE PARA DEBUGGING
      hasCategoriasUpper: 'Categorias' in response,
      hasDestinosUpper: 'Destinos' in response,
      topLevelKeys: Object.keys(response).slice(0, 10) // Primeras 10 keys para debugging
    });

    // ✅ VERIFICAR ESTRUCTURA DE RESPUESTA - AHORA CON CAMELCASE
    let data: MasterDataOptionsDto;
    
    if (response.success && response.data) {
      // Formato wrapped: { success: true, data: {...} }
      data = response.data;
      console.log('📦 [ApiService] Using wrapped response format');
    } else if (response.categorias && response.destinos) {
      // ✅ CORREGIDO: Formato directo camelCase: { categorias: [...], destinos: [...] }
      data = response;
      console.log('📦 [ApiService] Using direct camelCase response format');
    } else if (response.Categorias && response.Destinos) {
      // ✅ FALLBACK: Si por alguna razón aún viene PascalCase
      data = response;
      console.log('📦 [ApiService] Using direct PascalCase response format (fallback)');
    } else {
      console.error('❌ [ApiService] Unrecognized response structure:', {
        keys: Object.keys(response),
        sampleData: JSON.stringify(response).substring(0, 500) + '...'
      });
      throw new Error('Estructura de respuesta no válida del servidor');
    }

    // ✅ VERIFICAR DATOS - CORREGIDO PARA CAMELCASE
    const summary = {
      // Intentar camelCase primero
      categorias: data.categorias?.length || data.categorias?.length || 0,
      destinos: data.destinos?.length || data.destinos?.length || 0,
      calidades: data.calidades?.length || data.calidades?.length || 0,
      combustibles: data.combustibles?.length || data.combustibles?.length || 0,
      monedas: data.monedas?.length || data.monedas?.length || 0,
      estadosPoliza: data.estadosPoliza?.length || data.estadosPoliza?.length || 0,
      tiposTramite: data.tiposTramite?.length || data.tiposTramite?.length || 0,
      formasPago: data.formasPago?.length || data.formasPago?.length || 0
    };
    
    console.log('📊 [ApiService] Master data summary:', summary);

    if (summary.categorias === 0 && summary.destinos === 0) {
      console.warn('⚠️ [ApiService] No master data found. Full response:', response);
      throw new Error('El servidor devolvió datos vacíos para todos los maestros');
    }

    console.log('✅ [ApiService] Master data loaded successfully!');
    return data;
    
  } catch (error) {
    console.error('❌ [ApiService] Error in getMasterDataOptions:', error);
    
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('Error de conectividad. Verifica que el backend esté ejecutándose.');
    }
    
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      throw new Error('El servidor devolvió HTML en lugar de JSON. Posible problema de autenticación.');
    }
    
    throw error;
  }
}

  /**
   * Obtener todas las compañías
   */
  async getCompanies(): Promise<CompanyDto[]> {
    const response = await this.request<any>('/companies');
    return response.data || response || [];
  }

  async getAvailableCompanies(): Promise<CompanyDto[]> {
    const allCompanies = await this.getCompanies();
    
    // Por ahora solo BSE, después se puede quitar este filtro
    const availableCompanies = allCompanies.filter((company: CompanyDto) => 
      company.alias === 'BSE' || 
      company.comalias === 'BSE' ||
      company.nombre?.includes('BANCO DE SEGUROS')
    );
    
    console.log('🏢 Compañías disponibles:', availableCompanies);
    
    // Si no hay BSE, usar la primera disponible como fallback
    return availableCompanies.length > 0 ? availableCompanies : allCompanies.slice(0, 1);
  }

  async getSecciones(): Promise<SeccionDto[]> {
    const response = await this.request<any>('/secciones');
    return response.data || response || [];
  }

  async getAvailableSections(): Promise<SeccionDto[]> {
    const allSections = await this.getSecciones();
    
    // Por ahora solo AUTOMÓVILES
    const availableSections = allSections.filter((section: SeccionDto) => 
      section.seccion === 'AUTOMOVILES' ||
      section.seccion === 'AUTOMÓVIL' ||
      section.seccion?.includes('AUTO')
    );
    
    console.log('🚗 Secciones disponibles:', availableSections);
    
    return availableSections.length > 0 ? availableSections : allSections.slice(0, 1);
  }

  // ===== MÉTODOS DE MAESTROS INDIVIDUALES =====
  async getCombustibles(): Promise<any[]> {
    try {
      const masterOptions = await this.getMasterDataOptions();
      return masterOptions.combustibles || [];
    } catch (error) {
      console.error('❌ Error obteniendo combustibles:', error);
      return [];
    }
  }

  async getCategorias(): Promise<any[]> {
    try {
      const masterOptions = await this.getMasterDataOptions();
      return masterOptions.categorias || [];
    } catch (error) {
      console.error('❌ Error obteniendo categorías:', error);
      return [];
    }
  }

  async getDestinos(): Promise<any[]> {
    try {
      const masterOptions = await this.getMasterDataOptions();
      return masterOptions.destinos || [];
    } catch (error) {
      console.error('❌ Error obteniendo destinos:', error);
      return [];
    }
  }

  async getCalidades(): Promise<any[]> {
    try {
      const masterOptions = await this.getMasterDataOptions();
      return masterOptions.calidades || [];
    } catch (error) {
      console.error('❌ Error obteniendo calidades:', error);
      return [];
    }
  }

  async getMonedas(): Promise<any[]> {
    try {
      const masterOptions = await this.getMasterDataOptions();
      return masterOptions.monedas || [];
    } catch (error) {
      console.error('❌ Error obteniendo monedas:', error);
      return [];
    }
  }

  async getCoberturas() {
    const response = await this.request<any>('/cobertura');
    return response.data || response || [];
  }

  // ==============================================
  // 📄 PÓLIZAS
  // ==============================================

  /**
   * ✅ CORREGIDO: Crear nueva póliza con el tipo correcto del backend
   * POST /api/polizas
   */
  async createPoliza(polizaData: PolizaCreateRequest): Promise<any> {
    try {
      console.log('🚀 [ApiService] Enviando póliza a Velneo...', {
        poliza: polizaData.Conpol,
        cliente: polizaData.Clinom || polizaData.Asegurado,
        clienteId: polizaData.Clinro,
        companiaId: polizaData.Comcod,
        premio: polizaData.Conpremio
      });

      // ✅ LOG DEL PAYLOAD COMPLETO EN DESARROLLO
      if (process.env.NODE_ENV === 'development') {
        console.log('📋 [ApiService] Payload completo:', {
          ...polizaData,
          // Ocultar campos sensibles si los hay
          Password: polizaData.Password ? '[HIDDEN]' : undefined
        });
      }

      const response = await this.request<any>('/polizas', {
        method: 'POST',
        body: JSON.stringify(polizaData)
      });

      console.log('✅ [ApiService] Póliza creada exitosamente:', {
        success: response.success,
        message: response.message,
        numeroPoliza: response.numeroPoliza || response.polizaCreada?.numeroPoliza,
        timestamp: response.timestamp
      });

      return response;
    } catch (error) {
      console.error('❌ [ApiService] Error creando póliza:', error);
      
      // ✅ MENSAJES DE ERROR MEJORADOS
      let userMessage = 'Error enviando póliza a Velneo';
      if (error instanceof Error) {
        if (error.message.includes('400')) {
          userMessage = 'Datos de póliza inválidos. Verifique los campos requeridos.';
        } else if (error.message.includes('500')) {
          userMessage = 'Error interno del servidor. Contacte al administrador.';
        } else if (error.message.includes('timeout')) {
          userMessage = 'Timeout enviando póliza. Intente nuevamente.';
        } else if (error.message.includes('401') || error.message.includes('403')) {
          userMessage = 'Error de autenticación. Vuelva a iniciar sesión.';
        } else {
          userMessage = `Error: ${error.message}`;
        }
      }
      
      throw new Error(userMessage);
    }
  }

  /**
   * Obtener pólizas por cliente
   */
  async getPolizasByCliente(clienteId: number, filters?: any): Promise<any[]> {
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, String(value));
        });
      }

      const url = `/poliza/client/${clienteId}${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await this.request<any>(url);
      
      return response.data || response || [];
    } catch (error) {
      console.error(`❌ Error obteniendo pólizas del cliente ${clienteId}:`, error);
      return [];
    }
  }

  /**
   * LEGACY: Mantener compatibilidad
   */
  async createPolizaLegacy(polizaData: any) {
    return this.request('/poliza', {
      method: 'POST',
      body: JSON.stringify(polizaData)
    });
  }

  // ==============================================
  // 📄 AZURE DOCUMENT INTELLIGENCE
  // ==============================================

  /**
   * Procesar documento con Azure
   */
  async processDocument(file: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('🔄 Procesando documento con Azure Document Intelligence...');

      const response = await fetch(`${this.baseUrl}/azuredocument/process`, {
        method: 'POST',
        headers: {
          ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
          // No agregar Content-Type para FormData
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Azure Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      console.log('✅ Documento procesado exitosamente:', {
        completitud: result.porcentajeCompletitud,
        campos: result.datosVelneo?.metricas?.camposExtraidos
      });

      return result;
    } catch (error) {
      console.error('❌ Error procesando documento:', error);
      throw error;
    }
  }

  // ==============================================
  // 🔧 UTILIDADES - MÉTODOS FALTANTES AGREGADOS
  // ==============================================

  /**
   * Establecer token de autenticación
   */
  setAuthToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  /**
   * ✅ NUEVO: Obtener token de autenticación actual
   */
  getAuthToken(): string | null {
    return this.token || this.getStoredToken();
  }

  /**
   * Establecer URL base
   */
  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  /**
   * ✅ NUEVO: Obtener URL base actual
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.getCompanies();
      return true;
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return false;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  setTimeout(timeout: number): void {
    this.timeout = timeout;
  }

  async getUsageStats(tenantId?: string): Promise<any> {
    try {
      const url = tenantId ? `/analytics/stats/${tenantId}` : '/analytics/stats';
      const response = await this.request<any>(url, { method: 'GET' });
      return response;
    } catch (error) {
      console.warn('⚠️ Error obteniendo estadísticas:', error);
      return null;
    }
  }

  async searchMaestro<T>(tipo: string, query: string): Promise<T[]> {
    try {
      const response = await this.request<{ success: boolean; data: T[] }>(
        `/maestros/${tipo}/search?q=${encodeURIComponent(query)}`,
        { method: 'GET' }
      );

      return response.success ? response.data : [];
    } catch (error) {
      console.warn(`⚠️ Error buscando en maestro ${tipo}:`, error);
      return [];
    }
  }
}

// Exportar instancia singleton
export const apiService = new ApiService();

// ✅ HELPERS CORREGIDOS CON EL TIPO CORRECTO
export const MasterDataApi = {
  getCategorias: () => apiService.getCategorias(),
  getDestinos: () => apiService.getDestinos(),
  getCalidades: () => apiService.getCalidades(),
  getCombustibles: () => apiService.getCombustibles(),
  getMonedas: () => apiService.getMonedas(),
  getMasterDataOptions: () => apiService.getMasterDataOptions()
};

export const ClienteApi = {
  search: (term: string) => apiService.searchClientes(term),
  getById: (id: number) => apiService.getClienteById(id)
};

export const PolizaApi = {
  create: (data: PolizaCreateRequest) => apiService.createPoliza(data),
  createLegacy: (data: any) => apiService.createPolizaLegacy(data),
  getByCliente: (clienteId: number, filters?: any) => apiService.getPolizasByCliente(clienteId, filters)
};

export const AzureApi = {
  processDocument: (file: File) => apiService.processDocument(file)
};

// ✅ EXPORTAR TIPO PARA USO EN OTROS ARCHIVOS
export type { PolizaCreateRequest };

export default apiService;