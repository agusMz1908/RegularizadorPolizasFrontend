import type { LoginRequest, LoginResponse } from '@/types/auth';
import type { ClientDto } from '../types/cliente';
import type { CompanyDto, SeccionDto } from '@/types/maestros';

class ApiService {
  private baseUrl: string;
  private token: string | null = null;
  private timeout: number;

  constructor() {
    // ✅ Obtener configuración desde variables de entorno
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7191/api';
    this.timeout = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000');
    
    // TODO: Obtener token del localStorage/contexto de auth
    this.token = this.getStoredToken();
    
    console.log('🔧 ApiService initialized:', {
      baseUrl: this.baseUrl,
      timeout: this.timeout,
      hasToken: !!this.token
    });
  }

  private getStoredToken(): string | null {
    // TODO: Implementar obtención de token desde localStorage/sessionStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken') || null;
    }
    return null;
  }

private async request<T>(
  endpoint: string, 
  options: RequestInit = {}
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
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
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

    const params = new URLSearchParams({ filtro: search.trim() });
    const response = await this.request<any>(`/clientes/direct?${params}`);
    
    // Extraer items del response según la estructura de tu API
    return response.items || response.data || response || [];
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
   * Obtener todas las secciones
   * GET /api/secciones (no lo vi en Swagger, tal vez sea otro endpoint)
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
   * Obtener maestros de combustibles
   * GET /api/combustible
   */
  async getCombustibles() {
    const response = await this.request<any>('/combustible');
    return response.data || response || [];
  }

  /**
   * Obtener maestros de categorías
   * GET /api/categoria
   */
  async getCategorias() {
    const response = await this.request<any>('/categoria');
    return response.data || response || [];
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
   * Obtener pólizas por cliente
   * GET /api/poliza/client/{clienteId}
   */
  async getPolizasByCliente(clienteId: number) {
    const response = await this.request<any>(`/poliza/client/${clienteId}`);
    return response.data || response || [];
  }

  /**
   * Crear nueva póliza
   * POST /api/poliza
   */
  async createPoliza(polizaData: any) {
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
  async processDocument(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return fetch(`${this.baseUrl}/azuredocument/process`, {
      method: 'POST',
      headers: {
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        // No agregar Content-Type para FormData
      },
      body: formData
    }).then(response => {
      if (!response.ok) {
        throw new Error(`Azure Error: ${response.status}`);
      }
      return response.json();
    });
  }

  // ==============================================
  // 🔧 UTILIDADES
  // ==============================================

  /**
   * Establecer token de autenticación
   */
  setAuthToken(token: string) {
    this.token = token;
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
  async testConnection() {
    try {
      // Intentar obtener algunas compañías como test
      await this.getCompanies();
      return true;
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return false;
    }
  }
}

// Exportar instancia singleton
export const apiService = new ApiService();
export default apiService;