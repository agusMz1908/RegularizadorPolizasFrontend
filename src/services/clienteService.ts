import { apiService } from './api';
import { Cliente } from '../types/cliente';
import { Poliza } from '../types/poliza';
import { PaginatedResponse, FilterParams, PaginationParams } from '../types/common';
import { AzureDocumentService } from './azureDocumentService';
import { VelneoService } from './velneoService';

export class ClienteService {
  private baseUrl = '/clientes';

  public async getClientes(
    pagination?: PaginationParams,
    filters?: FilterParams
  ): Promise<PaginatedResponse<Cliente>> {
    const params = new URLSearchParams();
    
    if (pagination) {
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      if (pagination.sortBy) params.append('sortBy', pagination.sortBy);
      if (pagination.sortOrder) params.append('sortOrder', pagination.sortOrder);
    }
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }

    const response = await apiService.get<PaginatedResponse<Cliente>>(
      `${this.baseUrl}?${params.toString()}`
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error obteniendo clientes');
    }
    
    return response.data;
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
    const response = await apiService.get<Cliente[]>(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error buscando clientes');
    }
    
    return response.data;
  }
}

export const azureDocumentService = new AzureDocumentService();
export const velneoService = new VelneoService();
export const clienteService = new ClienteService();