// src/services/clienteService.ts
import { apiService } from './api';  // ✅ Import nombrado
import { Cliente } from '../types/cliente';
import { Poliza } from '../types/poliza';
import { PaginatedResponse, FilterParams, PaginationParams } from '../types/common';
import { ClientDto, ClienteMapper } from '../types/dto';

export class ClienteService {
  private baseUrl = '/clientes';

  public async getClientes(
    pagination?: PaginationParams,
    filters?: FilterParams
  ): Promise<PaginatedResponse<Cliente>> {
    const params = new URLSearchParams();
    
    if (pagination) {
      // Mapear a los nombres que espera el backend
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

    console.log('🔗 Solicitando clientes con URL:', `${this.baseUrl}?${params.toString()}`);

    const response = await apiService.get<PaginatedResponse<ClientDto>>(
      `${this.baseUrl}?${params.toString()}`
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error obteniendo clientes');
    }
    
    console.log('✅ Respuesta del servicio:', {
      items: response.data.items.length,
      totalCount: response.data.totalCount,
      pageNumber: response.data.pageNumber,
      totalPages: response.data.totalPages
    });
    
    // ✅ Usar el mapper existente en lugar del adaptador
    const clientesMapeados = ClienteMapper.fromDtoArray(response.data.items);
    
    return {
      ...response.data,
      items: clientesMapeados,
    };
  }

  public async getClienteById(id: number): Promise<Cliente> {
    const response = await apiService.get<ClientDto>(`${this.baseUrl}/${id}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error obteniendo cliente');
    }
    
    return ClienteMapper.fromDto(response.data);
  }

  public async createCliente(cliente: Omit<Cliente, 'id'>): Promise<Cliente> {
    const clienteDto = ClienteMapper.toDto(cliente as Cliente);
    const response = await apiService.post<ClientDto>(this.baseUrl, clienteDto);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error creando cliente');
    }
    
    return ClienteMapper.fromDto(response.data);
  }

  public async updateCliente(id: number, cliente: Partial<Cliente>): Promise<Cliente> {
    const clienteDto = ClienteMapper.toDto(cliente as Cliente);
    const response = await apiService.put<ClientDto>(`${this.baseUrl}/${id}`, clienteDto);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error actualizando cliente');
    }
    
    return ClienteMapper.fromDto(response.data);
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

  public async searchClientes(query: string, pagination?: PaginationParams): Promise<PaginatedResponse<Cliente>> {
    const params = new URLSearchParams();
    params.append('search', query);
    
    if (pagination) {
      params.append('page', pagination.page.toString());
      params.append('pageSize', pagination.limit.toString());
      if (pagination.sortBy) params.append('sortBy', pagination.sortBy);
      if (pagination.sortOrder) params.append('sortOrder', pagination.sortOrder);
    }
    
    const response = await apiService.get<PaginatedResponse<ClientDto>>(
      `${this.baseUrl}?${params.toString()}`
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error buscando clientes');
    }
    
    // ✅ Usar el mapper existente
    const clientesMapeados = ClienteMapper.fromDtoArray(response.data.items);
    
    return {
      ...response.data,
      items: clientesMapeados,
    };
  }
}

export const clienteService = new ClienteService();