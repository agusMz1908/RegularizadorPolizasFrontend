// services/clienteService.ts - Solución LIMPIA sin adaptadores
import { apiService } from './api';
import { Cliente } from '../types/cliente';
import { Poliza } from '../types/poliza';
import { PaginatedResponse, FilterParams, PaginationParams } from '../types/common';

export class ClienteService {
  private baseUrl = '/clientes';

  public async getClientes(
    pagination?: PaginationParams,
    filters?: FilterParams
  ): Promise<PaginatedResponse<Cliente>> {
    const params = new URLSearchParams();
    
    if (pagination) {
      params.append('page', pagination.page.toString());
      params.append('pageSize', pagination.limit.toString());
      if (pagination.sortBy) params.append('sortBy', pagination.sortBy);
      if (pagination.sortOrder) params.append('sortOrder', pagination.sortOrder);
    }
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }

    console.log('🔗 URL:', `${this.baseUrl}?${params.toString()}`);

    const response = await apiService.get<PaginatedResponse<Cliente>>(
      `${this.baseUrl}?${params.toString()}`
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error obteniendo clientes');
    }
    
    // 🔍 DEBUG - Ver qué llega exactamente
    console.log('🔍 Backend Response:', response.data);
    console.log('🔍 Primer cliente:', response.data.items?.[0]);
    console.log('🔍 Propiedades:', Object.keys(response.data.items?.[0] || {}));
    
    // ✅ USAR LOS DATOS DIRECTAMENTE - SIN MAPEO
    return response.data;
  }

  public async getClienteById(id: number): Promise<Cliente> {
    const response = await apiService.get<Cliente>(`${this.baseUrl}/${id}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error obteniendo cliente');
    }
    
    // ✅ USAR LOS DATOS DIRECTAMENTE
    return response.data;
  }

  public async getPolizasByCliente(clienteId: number): Promise<Poliza[]> {
    try {
      const pageSize = parseInt(import.meta.env.VITE_POLIZAS_PAGE_SIZE || '100', 10);
      
      const response = await apiService.get<Poliza[] | { items: Poliza[] }>(
        `/polizas/cliente/${clienteId}?page=1&pageSize=${pageSize}`
      );
      
      if (!response.success || !response.data) {
        return [];
      }
      
      // Manejar si viene como array directo o dentro de items
      const polizas = Array.isArray(response.data) ? response.data : response.data.items || [];
      
      console.log('✅ Pólizas obtenidas:', polizas.length);
      return polizas;
      
    } catch (err: any) {
      console.error('❌ Error obteniendo pólizas:', err);
      return [];
    }
  }

  public async searchClientes(searchTerm: string): Promise<Cliente[]> {
  console.log('🔍 Búsqueda en clienteService:', searchTerm);
  
  const response = await apiService.get<any>(
    `/clientes/search?searchTerm=${encodeURIComponent(searchTerm)}`
  );
  
  if (!response.success || !response.data) {
    throw new Error(response.error || 'Error en búsqueda');
  }
  
  console.log('✅ Resultados de búsqueda:', response.data.length);
  
    return Array.isArray(response.data) ? response.data : [];
  }
}

export const clienteService = new ClienteService();