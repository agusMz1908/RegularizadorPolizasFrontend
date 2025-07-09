import { apiService } from './api';
import { Cliente } from '../types/cliente';
import { Poliza } from '../types/poliza';

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export class ClienteService {
  private baseUrl = '/clients'; 

  public async getClientes(params?: PaginationParams): Promise<PagedResult<Cliente>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

      const url = `${this.baseUrl}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await apiService.get<PagedResult<Cliente>>(url);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Error obteniendo clientes');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching clientes:', error);
      throw new Error(error.message || 'Error obteniendo clientes desde Velneo');
    }
  }

  public async getClientesCount(): Promise<{ total_clients: number }> {
    try {
      const response = await apiService.get<{ total_clients: number }>(`${this.baseUrl}/count`);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Error obteniendo conteo de clientes');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching clients count:', error);
      throw new Error(error.message || 'Error obteniendo conteo de clientes');
    }
  }

  public async getClienteById(id: number): Promise<Cliente> {
    try {
      const response = await apiService.get<Cliente>(`${this.baseUrl}/${id}`);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Error obteniendo cliente');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching cliente:', error);
      throw new Error(error.message || 'Error obteniendo cliente');
    }
  }

  public async searchClientes(query: string): Promise<Cliente[]> {
    try {
      const response = await apiService.get<Cliente[]>(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Error buscando clientes');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error searching clientes:', error);
      throw new Error(error.message || 'Error buscando clientes');
    }
  }

  public async getPolizasByCliente(clienteId: number, params?: PaginationParams): Promise<PagedResult<Poliza>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

      const url = `/polizas/cliente/${clienteId}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await apiService.get<PagedResult<Poliza>>(url);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Error obteniendo pólizas del cliente');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching polizas:', error);
      throw new Error(error.message || 'Error obteniendo pólizas del cliente');
    }
  }

  public async testConnection(): Promise<{ connected: boolean; message: string }> {
    try {
      const response = await apiService.get<{ connected: boolean; message: string }>(`${this.baseUrl}/test-connection`);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Error probando conexión');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error testing connection:', error);
      throw new Error(error.message || 'Error probando conexión con Velneo');
    }
  }
}

export const clienteService = new ClienteService();