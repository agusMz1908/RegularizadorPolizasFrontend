import { Cliente } from '../types/cliente';

interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}

class VelneoClienteService {
  private baseUrl: string;
  private circuitBreaker: CircuitBreakerState;
  private readonly maxFailures = 3;
  private readonly resetTimeout = 30000; // 30 segundos
  
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'https://localhost:7191/api';
    this.circuitBreaker = {
      failures: 0,
      lastFailureTime: 0,
      state: 'CLOSED'
    };
    
    console.log('🔧 VelneoService configurado para producción:', {
      baseUrl: this.baseUrl,
      timeout: import.meta.env.VITE_VELNEO_TIMEOUT || '60000ms'
    });
  }

  private updateCircuitBreaker(success: boolean) {
    const now = Date.now();
    
    if (success) {
      this.circuitBreaker.failures = 0;
      this.circuitBreaker.state = 'CLOSED';
    } else {
      this.circuitBreaker.failures++;
      this.circuitBreaker.lastFailureTime = now;
      
      if (this.circuitBreaker.failures >= this.maxFailures) {
        this.circuitBreaker.state = 'OPEN';
        console.warn('🚨 Circuit breaker OPEN - demasiados errores con Velneo');
      }
    }
  }

  private isCircuitBreakerOpen(): boolean {
    if (this.circuitBreaker.state === 'CLOSED') return false;
    
    const now = Date.now();
    const timeSinceLastFailure = now - this.circuitBreaker.lastFailureTime;
    
    if (timeSinceLastFailure > this.resetTimeout) {
      this.circuitBreaker.state = 'HALF_OPEN';
      console.log('🔄 Circuit breaker HALF_OPEN - intentando reconexión con Velneo');
      return false;
    }
    
    return this.circuitBreaker.state === 'OPEN';
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    
    try {
      // Obtener token de autenticación del sistema
      const authData = localStorage.getItem('regularizador_auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        if (parsed.token) {
          headers['Authorization'] = `Bearer ${parsed.token}`;
        }
      }
    } catch (error) {
      console.warn('⚠️ No se pudo obtener token de autenticación:', error);
    }
    
    // Headers adicionales para Velneo
    headers['X-Requested-With'] = 'XMLHttpRequest';
    headers['Accept'] = 'application/json';
    headers['Content-Type'] = 'application/json';
    
    // Tenant ID si está configurado
    const tenantId = import.meta.env.VITE_VELNEO_TENANT_ID;
    if (tenantId) {
      headers['X-Tenant-ID'] = tenantId;
    }
    
    return headers;
  }

  private async makeRequest<T>(
    url: string, 
    options: RequestInit = {},
    signal?: AbortSignal
  ): Promise<T> {
    if (this.isCircuitBreakerOpen()) {
      throw new Error('Conexión con API temporalmente bloqueada. Reintentando en unos momentos...');
    }

    const timeoutMs = parseInt(import.meta.env.VITE_VELNEO_TIMEOUT) || 120000; // 2 minutos
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      console.log(`🌐 Petición a API: ${url} (timeout: ${timeoutMs/1000}s)`);
      
      const response = await fetch(url, {
        ...options,
        signal: signal || controller.signal,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);
      console.log(`📡 Respuesta API ${url}: ${response.status} ${response.statusText}`);

      if (response.status === 401) {
        console.error('🚫 Error 401: No autorizado para acceder a la API');
        throw new Error('No autorizado: Verifica las credenciales en el backend');
      }

      if (response.status === 403) {
        console.error('🚫 Error 403: Acceso denegado a la API');
        throw new Error('Acceso denegado: Sin permisos para acceder a los datos');
      }

      if (response.status === 404) {
        console.warn('🔍 Error 404: Endpoint no encontrado en la API');
        throw new Error('Endpoint no encontrado: Verifica la configuración de la API');
      }

      if (response.status >= 500) {
        console.error('🔥 Error 5xx: Problema en el servidor');
        throw new Error(`Error del servidor (${response.status}): ${response.statusText}`);
      }

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch {
          if (errorText) errorMessage = errorText;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(`✅ Datos recibidos de API ${url}:`, Array.isArray(data) ? `${data.length} elementos` : typeof data);
      
      this.updateCircuitBreaker(true);
      return data;
    } catch (error) {
      this.updateCircuitBreaker(false);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.error(`⏰ Timeout en ${url} - La solicitud tardó más de ${timeoutMs/1000} segundos`);
          throw new Error(`Timeout: La API tardó más de ${timeoutMs/1000} segundos en responder`);
        }
        throw error;
      }
      
      throw new Error('Error desconocido en la comunicación con la API');
    }
  }

  // ✅ MÉTODOS ACTUALIZADOS PARA TU BACKEND REAL
  async getClientes(page: number = 1, pageSize?: number): Promise<Cliente[]> {
    console.log('🔍 Obteniendo clientes con paginación real - Página:', page);
    
    try {
      const endpoint = import.meta.env.VITE_CLIENTES_ENDPOINT || 'Clients';
      const size = pageSize || import.meta.env.VITE_INITIAL_PAGE_SIZE || '50';
      const url = `${this.baseUrl}/${endpoint}?page=${page}&pageSize=${size}`;
      
      const data = await this.makeRequest<Cliente[]>(url);
      console.log(`✅ Clientes página ${page} obtenidos:`, data?.length || 0);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('❌ Error obteniendo clientes del API:', error);
      throw error;
    }
  }

  async getClientesCount(): Promise<number> {
    console.log('🔍 Obteniendo conteo total de clientes...');
    
    try {
      const endpoint = import.meta.env.VITE_CLIENTES_ENDPOINT || 'Clients';
      const url = `${this.baseUrl}/${endpoint}/count`;
      
      const data = await this.makeRequest<{total: number}>(url);
      const count = data?.total || 0;
      console.log('✅ Conteo obtenido del backend:', count);
      return count;
    } catch (error) {
      console.error('❌ Error obteniendo conteo:', error);
      return 0;
    }
  }

  async searchClientes(query: string, page: number = 1, pageSize?: number): Promise<{clientes: Cliente[], total: number}> {
    console.log('🔍 Buscando clientes en API:', query, 'Página:', page);
    
    if (!query.trim()) {
      const clientes = await this.getClientes(page, pageSize);
      const total = await this.getClientesCount();
      return { clientes, total };
    }
    
    try {
      const endpoint = import.meta.env.VITE_CLIENTES_ENDPOINT || 'Clients';
      const encodedQuery = encodeURIComponent(query.trim());
      const url = `${this.baseUrl}/${endpoint}/search?searchTerm=${encodedQuery}`;
      
      const data = await this.makeRequest<Cliente[]>(url);
      const clientes = Array.isArray(data) ? data : [];
      
      console.log('✅ Búsqueda completada:', clientes.length);
      return { clientes, total: clientes.length };
    } catch (error) {
      console.error('❌ Error en búsqueda del API:', error);
      throw error;
    }
  }

  async getClienteById(id: number): Promise<Cliente> {
    console.log('🔍 Obteniendo cliente por ID desde API:', id);
    
    try {
      const endpoint = import.meta.env.VITE_CLIENTES_ENDPOINT || 'Clients';
      const url = `${this.baseUrl}/${endpoint}/${id}`;
      
      const data = await this.makeRequest<Cliente>(url);
      console.log('✅ Cliente obtenido del API:', data?.nombre || 'Sin nombre');
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo cliente del API:', error);
      throw error;
    }
  }

  async getPolizasByCliente(clienteId: number, page: number = 1): Promise<any[]> {
    console.log('🔍 Obteniendo pólizas desde API para cliente:', clienteId, 'Página:', page);
    
    try {
      const endpoint = import.meta.env.VITE_POLIZAS_ENDPOINT || 'Polizas';
      const pageSize = import.meta.env.VITE_POLIZAS_PAGE_SIZE || '25';
      const url = `${this.baseUrl}/${endpoint}/cliente/${clienteId}?page=${page}&pageSize=${pageSize}`;
      
      const data = await this.makeRequest<any[]>(url);
      console.log('✅ Pólizas obtenidas del API:', data?.length || 0);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('❌ Error obteniendo pólizas del API:', error);
      // Mantener UI funcionando con array vacío
      console.log('⚠️ Retornando array vacío de pólizas para mantener UI funcionando');
      return [];
    }
  }

  async getPolizasCountByCliente(clienteId: number): Promise<number> {
    console.log('🔍 Obteniendo conteo de pólizas para cliente:', clienteId);
    
    try {
      const endpoint = import.meta.env.VITE_POLIZAS_ENDPOINT || 'Polizas';
      const url = `${this.baseUrl}/${endpoint}/cliente/${clienteId}/count`;
      
      const data = await this.makeRequest<{total: number}>(url);
      const count = data?.total || 0;
      console.log('✅ Conteo de pólizas obtenido:', count);
      return count;
    } catch (error) {
      console.error('❌ Error obteniendo conteo de pólizas:', error);
      return 0;
    }
  }

  async createCliente(cliente: Omit<Cliente, 'id'>): Promise<Cliente> {
    console.log('🔍 Creando cliente en Velneo:', cliente.nombre);
    
    try {
      const data = await this.makeRequest<Cliente>(`${this.baseUrl}/clients`, {
        method: 'POST',
        body: JSON.stringify(cliente),
      });
      console.log('✅ Cliente creado en Velneo con ID:', data?.id);
      return data;
    } catch (error) {
      console.error('❌ Error creando cliente en Velneo:', error);
      throw error;
    }
  }

  async updateCliente(id: number, cliente: Partial<Cliente>): Promise<Cliente> {
    console.log('🔍 Actualizando cliente en Velneo:', id);
    
    try {
      const data = await this.makeRequest<Cliente>(`${this.baseUrl}/clients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(cliente),
      });
      console.log('✅ Cliente actualizado en Velneo:', data?.nombre);
      return data;
    } catch (error) {
      console.error('❌ Error actualizando cliente en Velneo:', error);
      throw error;
    }
  }

  async deleteCliente(id: number): Promise<void> {
    console.log('🔍 Eliminando cliente en Velneo:', id);
    
    try {
      await this.makeRequest<void>(`${this.baseUrl}/clients/${id}`, {
        method: 'DELETE',
      });
      console.log('✅ Cliente eliminado de Velneo');
    } catch (error) {
      console.error('❌ Error eliminando cliente de Velneo:', error);
      throw error;
    }
  }

  // Método para obtener el estado del circuit breaker
  getCircuitBreakerStatus() {
    return {
      state: this.circuitBreaker.state,
      failures: this.circuitBreaker.failures,
      isOpen: this.isCircuitBreakerOpen(),
    };
  }

  // Método para resetear manualmente el circuit breaker
  resetCircuitBreaker() {
    this.circuitBreaker = {
      failures: 0,
      lastFailureTime: 0,
      state: 'CLOSED'
    };
    console.log('🔄 Circuit breaker reseteado para reconexión con Velneo');
  }
}

export const velneoClienteService = new VelneoClienteService();