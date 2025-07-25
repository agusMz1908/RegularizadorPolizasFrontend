import { apiClient } from './ApiClient';
import { ENDPOINTS } from '../utils/constants';

export interface Cliente {
  id: number;
  clinom: string;
  cliced?: string;
  cliruc?: string;
  cliemail?: string;
  telefono?: string;
  clidir?: string;
  activo: boolean;
}

class ClienteService {
  private readonly endpoint = ENDPOINTS.CLIENTES;

  async getClientes(params?: any): Promise<any> {
    console.log('👥 ClienteService: Obteniendo clientes...');
    
    const response = await apiClient.get<any>(this.endpoint, params);
    
    if (!response.success) {
      throw new Error(response.error || 'Error obteniendo clientes');
    }
    
    return response.data!;
  }

  async searchClientes(searchTerm: string): Promise<Cliente[]> {
    console.log('🔍 ClienteService: Buscando clientes:', searchTerm);
    
    const response = await apiClient.get<any>(`${this.endpoint}/direct`, {
      filtro: searchTerm  
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Error buscando clientes');
    }

    const data = response.data;
    
    if (data && data.items) {
      return data.items;
    }

    return Array.isArray(response.data) ? response.data : [];
  }

  async getClienteById(id: number): Promise<Cliente> {
    console.log('👥 ClienteService: Obteniendo cliente por ID:', id);
    
    const response = await apiClient.get<Cliente>(`${this.endpoint}/${id}`);
    
    if (!response.success) {
      throw new Error(response.error || 'Error obteniendo cliente');
    }
    
    return response.data!;
  }

  async createCliente(cliente: Partial<Cliente>): Promise<Cliente> {
    console.log('👥 ClienteService: Creando cliente...');
    
    const response = await apiClient.post<Cliente>(this.endpoint, cliente);
    
    if (!response.success) {
      throw new Error(response.error || 'Error creando cliente');
    }
    
    return response.data!;
  }
}

export const clienteService = new ClienteService();