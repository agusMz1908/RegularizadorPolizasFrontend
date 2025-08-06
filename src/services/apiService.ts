// src/services/apiService.ts - Servicio API actualizado para el nuevo formulario

import type { LoginRequest, LoginResponse } from '@/types/auth';
import type { ClientDto } from '../types/cliente';
import type { CompanyDto, SeccionDto } from '@/types/maestros';
import type { VelneoMasterDataOptions, VelneoPolizaRequest } from '../types/velneo';
import type { MasterDataResponse } from '../types/masterData';
import { API_CONFIG } from '../constants/velneoDefault';

/**
 * 🌐 SERVICIO API UNIFICADO
 * Maneja todas las comunicaciones con el backend de forma consistente
 * Actualizado para mantener compatibilidad con el sistema existente
 */
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
    
    // ✅ CORREGIDO: Usar el formato exacto del Swagger
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
   * 📊 CORREGIDO: Obtener opciones de maestros para el formulario 
   * Endpoint principal para cargar todos los selects del nuevo formulario
   */
  async getMasterDataOptions(): Promise<VelneoMasterDataOptions> {
    try {
      console.log('📊 Obteniendo opciones de maestros...');
      console.log('🔗 URL completa:', `${this.baseUrl}/Velneo/mapping-options`);
      
      // ✅ CORREGIDO: Usar el endpoint correcto con mayúscula
      const response = await this.request<any>(
        '/Velneo/mapping-options',
        { method: 'GET' }
      );

      console.log('📋 Respuesta cruda del servidor:', response);

      // ✅ CORREGIDO: Manejar la respuesta directa sin wrapper .success/.data
      // Según tu VelneoController, devuelve directamente el objeto MasterDataOptionsDto
      if (!response) {
        throw new Error('Respuesta vacía del servidor');
      }

      console.log('✅ Opciones de maestros cargadas exitosamente', {
        categorias: response.Categorias?.length || 0,
        destinos: response.Destinos?.length || 0,
        calidades: response.Calidades?.length || 0,
        combustibles: response.Combustibles?.length || 0,
        monedas: response.Monedas?.length || 0,
        estadosPoliza: response.EstadosPoliza?.length || 0,
        tiposTramite: response.TiposTramite?.length || 0
      });

      return response;
    } catch (error) {
      console.error('❌ Error cargando opciones de maestros:', error);
      
      // Mejorar el mensaje de error
      let errorMessage = 'Error desconocido cargando maestros';
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          errorMessage = 'No autorizado. Por favor, inicie sesión nuevamente.';
        } else if (error.message.includes('403')) {
          errorMessage = 'No tiene permisos para acceder a los maestros.';
        } else if (error.message.includes('404')) {
          errorMessage = 'Endpoint de maestros no encontrado. Verifique la configuración.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Error interno del servidor al cargar maestros.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Timeout cargando maestros. Verifique su conexión.';
        } else {
          errorMessage = error.message;
        }
      }
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Obtener todas las compañías
   * GET /api/companies
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

  /**
   * Obtener secciones disponibles (por ahora solo AUTOMÓVILES)
   */
  async getAvailableSections(): Promise<SeccionDto[]> {
    const allSections = await this.getSecciones();
    
    // Por ahora solo AUTOMÓVILES, después se puede quitar este filtro
    const availableSections = allSections.filter((section: SeccionDto) => 
      section.seccion === 'AUTOMOVILES' ||
      section.seccion === 'AUTOMÓVIL' ||
      section.seccion?.includes('AUTO')
    );
    
    console.log('🚗 Secciones disponibles:', availableSections);
    
    // Si no hay AUTOMÓVILES, usar la primera disponible como fallback
    return availableSections.length > 0 ? availableSections : allSections.slice(0, 1);
  }

  /**
   * ⛽ CORREGIDO: Obtener maestros de combustibles
   * Usando el método principal de maestros
   */
  async getCombustibles(): Promise<any[]> {
    try {
      const masterOptions = await this.getMasterDataOptions();
      return masterOptions.Combustibles || [];
    } catch (error) {
      console.error('❌ Error obteniendo combustibles:', error);
      // Fallback: intentar endpoint directo
      try {
        const response = await this.request<any>('/combustible');
        return response.data || response || [];
      } catch (fallbackError) {
        console.error('❌ Error en fallback de combustibles:', fallbackError);
        return [];
      }
    }
  }

  /**
   * 🏷️ CORREGIDO: Obtener maestros de categorías
   * Usando el método principal de maestros
   */
  async getCategorias(): Promise<any[]> {
    try {
      const masterOptions = await this.getMasterDataOptions();
      return masterOptions.Categorias || [];
    } catch (error) {
      console.error('❌ Error obteniendo categorías:', error);
      // Fallback: intentar endpoint directo
      try {
        const response = await this.request<any>('/categoria');
        return response.data || response || [];
      } catch (fallbackError) {
        console.error('❌ Error en fallback de categorías:', fallbackError);
        return [];
      }
    }
  }

  /**
   * 🎯 NUEVO: Obtener destinos
   */
  async getDestinos(): Promise<any[]> {
    try {
      const masterOptions = await this.getMasterDataOptions();
      return masterOptions.Destinos || [];
    } catch (error) {
      console.error('❌ Error obteniendo destinos:', error);
      return [];
    }
  }

  /**
   * 💎 NUEVO: Obtener calidades
   */
  async getCalidades(): Promise<any[]> {
    try {
      const masterOptions = await this.getMasterDataOptions();
      return masterOptions.Calidades || [];
    } catch (error) {
      console.error('❌ Error obteniendo calidades:', error);
      return [];
    }
  }

  /**
   * 💰 NUEVO: Obtener monedas
   */
  async getMonedas(): Promise<any[]> {
    try {
      const masterOptions = await this.getMasterDataOptions();
      return masterOptions.Monedas || [];
    } catch (error) {
      console.error('❌ Error obteniendo monedas:', error);
      return [];
    }
  }

  /**
   * Obtener maestros de coberturas
   * GET /api/cobertura
   */
  async getCoberturas() {
    const response = await this.request<any>('/cobertura');
    return response.data || response || [];
  }

  // ==============================================
  // 📄 PÓLIZAS
  // ==============================================

  /**
   * 📝 NUEVO: Crear nueva póliza en Velneo con el objeto correcto
   * POST /api/polizas (usado por el nuevo formulario)
   */
  async createPoliza(polizaData: VelneoPolizaRequest): Promise<any> {
    try {
      console.log('🚀 Enviando póliza a Velneo...', {
        poliza: polizaData.conpol,
        cliente: polizaData.clinom,
        compania: polizaData.com_alias
      });

      const response = await this.request<any>('/polizas', {
        method: 'POST',
        body: JSON.stringify(polizaData)
      });

      console.log('✅ Póliza creada exitosamente en Velneo:', {
        id: response.id || response.data?.id,
        message: response.message
      });

      return response;
    } catch (error) {
      console.error('❌ Error creando póliza en Velneo:', error);
      
      // Mejorar el mensaje de error para el usuario
      let userMessage = 'Error enviando póliza a Velneo';
      if (error instanceof Error) {
        if (error.message.includes('400')) {
          userMessage = 'Datos de póliza inválidos. Verifique los campos requeridos.';
        } else if (error.message.includes('500')) {
          userMessage = 'Error interno del servidor. Contacte al administrador.';
        } else if (error.message.includes('timeout')) {
          userMessage = 'Timeout enviando póliza. Intente nuevamente.';
        } else {
          userMessage = `Error: ${error.message}`;
        }
      }
      
      throw new Error(userMessage);
    }
  }

  /**
   * Obtener pólizas por cliente
   * GET /api/poliza/client/{clienteId}
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
   * LEGACY: Crear póliza (mantenido para compatibilidad)
   * POST /api/poliza
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
   * POST /api/azuredocument/process
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
  // 🔧 UTILIDADES
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
   * Establecer URL base
   */
  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  /**
   * Test de conexión
   */
  async testConnection(): Promise<boolean> {
    try {
      // Intentar obtener algunas compañías como test
      await this.getCompanies();
      return true;
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return false;
    }
  }

  /**
   * 🏥 Health check del API
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 segundos timeout
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * ⚙️ Configurar timeout personalizado
   */
  setTimeout(timeout: number): void {
    this.timeout = timeout;
  }

  /**
   * 📊 Obtener estadísticas de uso (para analytics futuros)
   */
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

  /**
   * 🔍 Buscar maestros específicos (para funcionalidad futura)
   */
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

/**
 * 🔧 HELPER FUNCTIONS PARA APIS ESPECÍFICAS - CORREGIDAS
 * Mantienen compatibilidad con el código existente
 */
export const MasterDataApi = {
  getCategorias: () => apiService.getCategorias(),
  getDestinos: () => apiService.getDestinos(),       // ✅ CORREGIDO
  getCalidades: () => apiService.getCalidades(),     // ✅ CORREGIDO
  getCombustibles: () => apiService.getCombustibles(),
  getMonedas: () => apiService.getMonedas(),         // ✅ CORREGIDO
  // PRINCIPAL: Para el formulario
  getMasterDataOptions: () => apiService.getMasterDataOptions()
};

export const ClienteApi = {
  search: (term: string) => apiService.searchClientes(term),
  getById: (id: number) => apiService.getClienteById(id)
};

export const PolizaApi = {
  create: (data: VelneoPolizaRequest) => apiService.createPoliza(data),
  createLegacy: (data: any) => apiService.createPolizaLegacy(data),
  getByCliente: (clienteId: number, filters?: any) => apiService.getPolizasByCliente(clienteId, filters)
};

export const AzureApi = {
  processDocument: (file: File) => apiService.processDocument(file)
};

export default apiService;