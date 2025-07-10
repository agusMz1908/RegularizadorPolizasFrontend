import { apiService } from './api';
import { Cliente, ClienteMapper } from '../types/cliente';
import { Poliza } from '../types/poliza';

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  currentPage: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startItem?: number;
  endItem?: number;
  requestDuration?: number;
  dataSource?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  search?: string;
}

export class ClienteService {
  private baseUrl = '/clientes';

  async getClientes(params: PaginationParams): Promise<PaginatedResponse<Cliente>> {
    try {
      const { page, pageSize, search } = params;
      
      const urlParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      
      if (search && search.trim()) {
        urlParams.append('search', search.trim());
      }

      const url = `${this.baseUrl}?${urlParams.toString()}`;
      console.log('🔗 ClienteService: Solicitando clientes paginados:', url);

      const response = await apiService.get<PaginatedResponse<any>>(url);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Error obteniendo clientes');
      }

      const clientesMapeados = ClienteMapper.fromBackendArray(response.data.items);

      const result: PaginatedResponse<Cliente> = {
        ...response.data,
        items: clientesMapeados,
      };

      console.log('✅ ClienteService: Respuesta recibida:', {
        items: result.items.length,
        totalCount: result.totalCount,
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        dataSource: result.dataSource
      });

      return result;
    } catch (error) {
      console.error('❌ ClienteService: Error obteniendo clientes:', error);
      throw error;
    }
  }

  async getAllClientes(search?: string): Promise<{ items: Cliente[], totalCount: number }> {
    try {
      const urlParams = new URLSearchParams();
      if (search && search.trim()) {
        urlParams.append('search', search.trim());
      }

      const url = `${this.baseUrl}/all${urlParams.toString() ? '?' + urlParams.toString() : ''}`;
      console.log('🔗 ClienteService: Solicitando todos los clientes:', url);

      const response = await apiService.get<{ items: Cliente[], totalCount: number }>(url);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Error obteniendo todos los clientes');
      }

      console.log('✅ ClienteService: Todos los clientes obtenidos:', response.data.totalCount);
      return response.data;
    } catch (error) {
      console.error('❌ ClienteService: Error obteniendo todos los clientes:', error);
      throw error;
    }
  }

  async getClienteById(id: number): Promise<Cliente> {
    try {
      console.log('🔗 ClienteService: Obteniendo cliente por ID:', id);

      const response = await apiService.get<Cliente>(`${this.baseUrl}/${id}`);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Error obteniendo cliente');
      }

      console.log('✅ ClienteService: Cliente obtenido:', response.data.nombre || response.data.clinom);
      return response.data;
    } catch (error) {
      console.error('❌ ClienteService: Error obteniendo cliente por ID:', error);
      throw error;
    }
  }

  async getPolizasByCliente(clienteId: number, params: PaginationParams): Promise<PaginatedResponse<Poliza>> {
    try {
      const { page, pageSize, search } = params;
      
      const urlParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      
      if (search && search.trim()) {
        urlParams.append('search', search.trim());
      }

      const url = `/polizas/cliente/${clienteId}?${urlParams.toString()}`;
      console.log('🔗 ClienteService: Solicitando pólizas paginadas para cliente:', clienteId, url);

      const response = await apiService.get<PaginatedResponse<Poliza>>(url);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Error obteniendo pólizas del cliente');
      }

      console.log('✅ ClienteService: Pólizas del cliente obtenidas:', {
        clienteId,
        items: response.data.items.length,
        totalCount: response.data.totalCount,
        dataSource: response.data.dataSource
      });

      return response.data;
    } catch (error) {
      console.error('❌ ClienteService: Error obteniendo pólizas del cliente:', error);
      throw error;
    }
  }

  async createCliente(cliente: Omit<Cliente, 'id'>): Promise<Cliente> {
    try {
      console.log('🔗 ClienteService: Creando cliente:', cliente.nombre || cliente.clinom);

      const response = await apiService.post<Cliente>(this.baseUrl, cliente);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Error creando cliente');
      }

      console.log('✅ ClienteService: Cliente creado con ID:', response.data.id);
      return response.data;
    } catch (error) {
      console.error('❌ ClienteService: Error creando cliente:', error);
      throw error;
    }
  }

  async updateCliente(id: number, cliente: Partial<Cliente>): Promise<Cliente> {
    try {
      console.log('🔗 ClienteService: Actualizando cliente:', id);

      const response = await apiService.put<Cliente>(`${this.baseUrl}/${id}`, cliente);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Error actualizando cliente');
      }

      console.log('✅ ClienteService: Cliente actualizado:', response.data.nombre || response.data.clinom);
      return response.data;
    } catch (error) {
      console.error('❌ ClienteService: Error actualizando cliente:', error);
      throw error;
    }
  }

  async deleteCliente(id: number): Promise<void> {
    try {
      console.log('🔗 ClienteService: Eliminando cliente:', id);

      const response = await apiService.delete(`${this.baseUrl}/${id}`);
      
      if (!response.success) {
        throw new Error(response.error || 'Error eliminando cliente');
      }

      console.log('✅ ClienteService: Cliente eliminado');
    } catch (error) {
      console.error('❌ ClienteService: Error eliminando cliente:', error);
      throw error;
    }
  }
}

export const clienteService = new ClienteService();