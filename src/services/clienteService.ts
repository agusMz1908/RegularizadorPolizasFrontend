// src/services/clienteService.ts - ACTUALIZADO
import { apiService } from './api';
import { Cliente } from '../types/cliente';
import { Poliza } from '../types/poliza';
import { FilterParams, PaginationParams, PagedResult } from '../types/common';
import { ClientDto, ClienteMapper } from '../types/dto';

export class ClienteService {
  private baseUrl = '/api/clients'; 

  public async getClientes(
    pagination?: PaginationParams,
    filters?: FilterParams
  ): Promise<PagedResult<Cliente>> {
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

    const response = await apiService.get<PagedResult<ClientDto>>(
      `${this.baseUrl}?${params.toString()}`
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error obteniendo clientes');
    }
    
    const mappedClientes = ClienteMapper.fromDtoArray(response.data.items);
    
    return {
      items: mappedClientes,
      totalCount: response.data.totalCount,
      pageNumber: response.data.pageNumber,
      pageSize: response.data.pageSize,
      totalPages: response.data.totalPages || Math.ceil(response.data.totalCount / response.data.pageSize)
    };
  }

  public async getClienteById(id: number): Promise<Cliente> {
    const response = await apiService.get<Cliente>(`${this.baseUrl}/${id}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error obteniendo cliente');
    }
    
    return response.data;
  }

  public async createCliente(cliente: Omit<Cliente, 'id'>): Promise<Cliente> {
    const response = await apiService.post<Cliente>(this.baseUrl, cliente);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error creando cliente');
    }
    
    return response.data;
  }

  public async updateCliente(id: number, cliente: Partial<Cliente>): Promise<Cliente> {
    const response = await apiService.put<Cliente>(`${this.baseUrl}/${id}`, cliente);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error actualizando cliente');
    }
    
    return response.data;
  }

  public async deleteCliente(id: number): Promise<void> {
    const response = await apiService.delete(`${this.baseUrl}/${id}`);
    
    if (!response.success) {
      throw new Error(response.error || 'Error eliminando cliente');
    }
  }

  public async getPolizasByCliente(clienteId: number): Promise<Poliza[]> {
    const response = await apiService.get<Poliza[]>(`${this.baseUrl}/${clienteId}/polizas`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error obteniendo pólizas del cliente');
    }
    
    return response.data;
  }

  public async searchClientes(query: string): Promise<Cliente[]> {
    const params = new URLSearchParams();
    params.append('search', query);
    
    const response = await apiService.get<Cliente[]>(`${this.baseUrl}/search?${params.toString()}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error buscando clientes');
    }
    
    return response.data;
  }
}

export const clienteService = new ClienteService();