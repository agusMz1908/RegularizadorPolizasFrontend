// src/services/apiService.ts - VERSIÓN CORREGIDA CON TIPOS COMPATIBLES

import type { LoginRequest, LoginResponse } from '@/types/auth';
import type { CompanyDto, MasterDataOptionsDto, SeccionDto, TarifaDto } from '@/types/masterData';
import type { ClientDto } from '@/types/cliente';
import type { PolizaCreateRequest, PolicyFormData, CreatePolizaResponse  } from '@/types/poliza';
import { API_CONFIG } from '@/constants/velneoDefault';
import { VelneoMappingService } from './velneoMapping';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  timestamp?: string;
}

interface CreatePolizaParams {
  formData: PolicyFormData;
  selectedClient: ClientDto | null;
  selectedCompany: CompanyDto | null;
  selectedSection: SeccionDto | null;
  masterOptions?: MasterDataOptionsDto;
  scannedData?: any;
}

class ApiService {
  private baseUrl: string;
  private token: string | null = null;
  private timeout: number;
  private tenantId: string | null = null;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7191/api';
    this.timeout = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000');
    this.token = this.getStoredToken();
    this.tenantId = this.getStoredTenantId();
  }
  private getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken') || null;
    }
    return null;
  }

   private getStoredTenantId(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tenantId') || sessionStorage.getItem('tenantId') || null;
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
 * @param companiaId - ID de la compañía para filtrar tarifas (opcional)
 */
async getMasterDataOptions(companiaId?: number): Promise<MasterDataOptionsDto> {
  try {
    console.log('🔄 [ApiService] Cargando opciones de maestros...');
    
    const response = await this.request<any>('/velneo/mapping-options', {
      method: 'GET'
    });

    let data: MasterDataOptionsDto;
    
    if (response.success && response.data) {
      data = response.data;
      console.log('📦 [ApiService] Using wrapped response format');
    } else if (response.categorias && response.destinos) {
      data = response;
      console.log('📦 [ApiService] Using direct camelCase response format');
    } else if (response.Categorias && response.Destinos) {
      data = response;
      console.log('📦 [ApiService] Using direct PascalCase response format (fallback)');
    } else {
      console.error('❌ [ApiService] Unrecognized response structure:', {
        keys: Object.keys(response),
        sampleData: JSON.stringify(response).substring(0, 500) + '...'
      });
      throw new Error('Estructura de respuesta no válida del servidor');
    }

    // 🆕 AGREGAR: Cargar tarifas para la compañía especificada
    try {
      const companyId = companiaId || 1; // Default a BSE si no se especifica
      const tarifas = await this.getTarifas(companyId);
      data.tarifas = tarifas;
      console.log(`✅ [ApiService] ${tarifas.length} tarifas cargadas para compañía ID: ${companyId}`);
    } catch (error) {
      console.warn('⚠️ [ApiService] No se pudieron cargar tarifas:', error);
      data.tarifas = [];
    }

    const summary = {
      categorias: data.categorias?.length || 0,
      destinos: data.destinos?.length || 0,
      calidades: data.calidades?.length || 0,
      combustibles: data.combustibles?.length || 0,
      monedas: data.monedas?.length || 0,
      tarifas: data.tarifas?.length || 0, // 🆕 AGREGAR
      estadosPoliza: data.estadosPoliza?.length || 0,
      tiposTramite: data.tiposTramite?.length || 0,
      formasPago: data.formasPago?.length || 0
    };

    console.log('📊 [ApiService] Master data summary:', summary);

    if (summary.categorias === 0 && summary.destinos === 0) {
      throw new Error('El servidor devolvió datos vacíos para todos los maestros');
    }
    
    return data;
    
  } catch (error) {
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
// src/services/apiService.ts
// SOLO NECESITAS CAMBIAR ESTAS LÍNEAS:
private validatePolizaRequest(request: PolizaCreateRequest): void {
    const errors: string[] = [];

    // Campos absolutamente requeridos según el backend
    if (!request.Comcod || request.Comcod <= 0) {
      errors.push('Código de compañía es requerido');
    }
    
    // CORREGIDO: Seccod puede ser 0 (que es válido según el backend)
    if (request.Seccod === undefined || request.Seccod === null || request.Seccod < 0 || request.Seccod > 9) {
      errors.push('Código de sección debe estar entre 0 y 9');
    }
    
    if (!request.Conpol) {
      errors.push('Número de póliza es requerido');
    }
    if (!request.Confchdes) {
      errors.push('Fecha desde es requerida');
    }
    if (!request.Confchhas) {
      errors.push('Fecha hasta es requerida');
    }
    if (request.Conpremio === undefined || request.Conpremio === null || request.Conpremio < 0) {
      errors.push('Premio es requerido y debe ser mayor o igual a 0');
    }
    if (!request.Asegurado) {
      errors.push('Nombre del asegurado es requerido');
    }

    if (errors.length > 0) {
      const errorMessage = `Errores de validación:\n${errors.join('\n')}`;
      console.error('❌ Validación fallida:', errors);
      throw new Error(errorMessage);
    }

    console.log('✅ Validación de póliza exitosa');
  }
/**
 * ✅ CORRECCIÓN: Crear nueva póliza
 * POST /api/Poliza (SINGULAR, no plural)
 */
async createPoliza(
    formData: PolicyFormData,
    selectedClient: ClientDto | null,
    selectedCompany: CompanyDto | null,
    selectedSection: SeccionDto | null,
    masterOptions?: MasterDataOptionsDto,
    scannedData?: any
  ): Promise<CreatePolizaResponse> {
    try {
      console.log('📋 Iniciando creación de póliza...');
      
      // Validar datos requeridos
      if (!selectedClient) {
        throw new Error('Cliente es requerido');
      }
      
      // Mapear los datos del formulario al formato del backend
      const polizaRequest: PolizaCreateRequest = VelneoMappingService.mapFormDataToVelneoRequest(
        formData,
        selectedClient,
        selectedCompany,
        selectedSection,
        masterOptions,
        scannedData
      );

      // Log del request para debug
      console.log('📤 Póliza Request:', {
        cliente: polizaRequest.Clinro,
        compania: polizaRequest.Comcod,
        seccion: polizaRequest.Seccod,
        numeroPoliza: polizaRequest.Conpol,
        premio: polizaRequest.Conpremio,
        monedaCobertura: polizaRequest.Moncod,
        monedaPago: polizaRequest.Conviamon,
        request: polizaRequest
      });

      // Validar que los campos requeridos estén presentes
      this.validatePolizaRequest(polizaRequest);

      // Hacer el POST al backend
      const response = await this.request<any>('/Poliza', {
        method: 'POST',
        body: JSON.stringify(polizaRequest)
      });

      console.log('✅ Póliza creada exitosamente:', response);

      // Formatear respuesta
      return {
        success: true,
        data: {
          id: response.id || response.data?.id,
          numeroPoliza: response.numeroPoliza || response.data?.numeroPoliza || polizaRequest.Conpol,
          message: response.message || 'Póliza creada exitosamente',
          ...response
        },
        message: 'Póliza creada exitosamente'
      };

    } catch (error: any) {
      console.error('❌ Error creando póliza:', error);
      
      // Manejar errores de validación
      if (error.validationErrors) {
        return {
          success: false,
          error: 'Error de validación',
          validationErrors: error.validationErrors,
          message: 'Por favor, corrija los errores en el formulario'
        };
      }

      // Otros errores
      return {
        success: false,
        error: error.message || 'Error al crear la póliza',
        message: error.message || 'Ocurrió un error al crear la póliza'
      };
    }
  }

  async getPoliza(id: number): Promise<ApiResponse<any>> {
    try {
      const response = await this.request<any>(`/Poliza/${id}`, {
        method: 'GET'
      });
      
      return {
        success: true,
        data: response,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async getPolizas(filters?: {
    clienteId?: number;
    companiaId?: number;
    estado?: string;
    desde?: string;
    hasta?: string;
  }): Promise<ApiResponse<any[]>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/Poliza?${queryString}` : '/Poliza';
      
      const response = await this.request<any[]>(endpoint, {
        method: 'GET'
      });
      
      return {
        success: true,
        data: response,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        data: [],
        timestamp: new Date().toISOString()
      };
    }
  }

  async updatePoliza(id: number, polizaData: Partial<PolizaCreateRequest>): Promise<ApiResponse> {
    try {
      const response = await this.request<any>(`/Poliza/${id}`, {
        method: 'PUT',
        body: JSON.stringify(polizaData)
      });
      
      return {
        success: true,
        data: response,
        message: 'Póliza actualizada exitosamente',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
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

    // ✅ TAMBIÉN CORREGIR AQUÍ: Usar 'Poliza' singular
    const url = `/Poliza/client/${clienteId}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await this.request<any[]>(url);
    
    return response || [];
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

async getTarifas(companiaId: number = 1): Promise<any[]> {
  try {
    console.log(`📋 [ApiService] Obteniendo tarifas para compañía ${companiaId}...`);
    
    // Intentar primero con el endpoint directo
    const response = await this.request<any>('/Tarifa', {
      method: 'GET'
    });
    
    console.log('🔍 [ApiService] Respuesta de tarifas:', response);
    
    // El formato de tu respuesta parece ser { success: true, data: [...] }
    let tarifas: any[] = [];
    
    if (response && response.success && response.data) {
      tarifas = response.data;
    } else if (Array.isArray(response)) {
      tarifas = response;
    }
    
    // Filtrar por companiaId si es necesario
    if (companiaId && tarifas.length > 0) {
      tarifas = tarifas.filter(t => t.companiaId === companiaId);
    }
    
    // Filtrar solo las activas
    tarifas = tarifas.filter(t => t.activa !== false);
    
    console.log(`✅ [ApiService] ${tarifas.length} tarifas encontradas para compañía ${companiaId}`);
    
    return tarifas;
  } catch (error) {
    console.error(`❌ [ApiService] Error obteniendo tarifas:`, error);
    // No lanzar error, retornar array vacío para no romper la UI
    return [];
  }
}

async getTarifaById(id: number): Promise<TarifaDto | null> {
  try {
    const response = await this.request<any>(`/Tarifa/${id}`, {
      method: 'GET'
    });
    
    if (response.success && response.data) {
      return response.data;
    } else if (response.id) {
      return response;
    }
    
    return null;
  } catch (error) {
    console.error(`❌ Error obteniendo tarifa ${id}:`, error);
    return null;
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

export const MasterDataApi = {
  getCategorias: () => apiService.getCategorias(), 
  getDestinos: () => apiService.getDestinos(),   
  getCalidades: () => apiService.getCalidades(),  
  getCombustibles: () => apiService.getCombustibles(), 
  getMonedas: () => apiService.getMonedas(),     
  getTarifas: (companiaId?: number) => apiService.getTarifas(companiaId || 1), 
  getMasterDataOptions: (companiaId?: number) => apiService.getMasterDataOptions(companiaId) 
};

export const ClienteApi = {
  search: (term: string) => apiService.searchClientes(term),
  getById: (id: number) => apiService.getClienteById(id)
};

export const PolizaApi = {
  /**
   * Crear nueva póliza
   */
  create: (params: CreatePolizaParams) => {
    return apiService.createPoliza(
      params.formData,
      params.selectedClient,
      params.selectedCompany,
      params.selectedSection,
      params.masterOptions,
      params.scannedData
    );
  },

  getByCliente: (clienteId: number, filters?: any) => {
    return apiService.getPolizas({ 
      clienteId, 
      ...filters 
    });
  },

  getById: (id: number) => {
    return apiService.getPoliza(id);
  },

  getAll: (filters?: {
    clienteId?: number;
    companiaId?: number;
    estado?: string;
    desde?: string;
    hasta?: string;
  }) => {
    return apiService.getPolizas(filters);
  },

  update: (id: number, data: Partial<PolizaCreateRequest>) => {
    return apiService.updatePoliza(id, data);
  }
};


export const AzureApi = {
  processDocument: (file: File) => apiService.processDocument(file)
};

export const TarifaApi = {
  getAll: (companiaId?: number) => apiService.getTarifas(companiaId),
  getById: (id: number) => apiService.getTarifaById(id),
  getForBSE: () => apiService.getTarifas(1) // BSE = companiaId 1
};

// ✅ EXPORTAR TIPO PARA USO EN OTROS ARCHIVOS
export type { PolizaCreateRequest };

export default apiService;