// src/services/clienteService.ts
// ✅ VERSIÓN CORREGIDA - Parámetros y tipos arreglados

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

  async getClientes(params?: Record<string, any>): Promise<any> {
    console.log('👥 ClienteService: Obteniendo clientes...');
    
    const response = await apiClient.get<any>(this.endpoint);
    
    if (!response.success) {
      throw new Error(response.error || 'Error obteniendo clientes');
    }
    
    return response.data!;
  }

  /**
   * ✅ BÚSQUEDA CORREGIDA - Con query parameters correctos
   */
  async searchClientes(searchTerm: string): Promise<Cliente[]> {
    console.log('🔍 ClienteService: Buscando clientes:', searchTerm);
    
    if (!searchTerm.trim()) {
      return [];
    }

    try {
      // ✅ Construir URL con query parameters manualmente
      const searchUrl = `${this.endpoint}/direct?filtro=${encodeURIComponent(searchTerm)}`;
      
      console.log('🌐 URL de búsqueda:', searchUrl);
      
      const response = await apiClient.get<any>(searchUrl);
      
      if (!response.success) {
        console.error('❌ Error en búsqueda:', response.error);
        throw new Error(response.error || 'Error buscando clientes');
      }

      console.log('📦 Respuesta de búsqueda:', response.data);

      // ✅ Manejar diferentes formatos de respuesta
      const data = response.data;
      
      if (data && data.items && Array.isArray(data.items)) {
        console.log(`✅ Encontrados ${data.items.length} clientes en data.items`);
        return data.items;
      }
      
      if (Array.isArray(data)) {
        console.log(`✅ Encontrados ${data.length} clientes en array directo`);
        return data;
      }
      
      console.warn('⚠️ Formato de respuesta inesperado:', data);
      return [];

    } catch (error: any) {
      console.error('❌ Error en searchClientes:', error);
      
      // Si es un timeout, mostrar mensaje específico
      if (error.message?.includes('Timeout') || error.message?.includes('timeout')) {
        throw new Error('La búsqueda tardó demasiado. Intenta con un término más específico.');
      }
      
      throw new Error(error.message || 'Error al buscar clientes');
    }
  }

  /**
   * ✅ BÚSQUEDA ALTERNATIVA - Por si la directa no funciona
   */
  async searchClientesAlternative(searchTerm: string): Promise<Cliente[]> {
    console.log('🔍 ClienteService: Búsqueda alternativa para:', searchTerm);
    
    try {
      // Usar endpoint de search si existe
      const searchUrl = `${this.endpoint}/search?searchTerm=${encodeURIComponent(searchTerm)}`;
      
      const response = await apiClient.get<Cliente[]>(searchUrl, 15000); // 15s timeout
      
      if (!response.success) {
        throw new Error(response.error || 'Error en búsqueda alternativa');
      }

      return Array.isArray(response.data) ? response.data : [];

    } catch (error: any) {
      console.error('❌ Error en búsqueda alternativa:', error);
      throw error;
    }
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

  /**
   * ✅ MÉTODO DE PRUEBA - Para verificar conectividad
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔗 Probando conexión con el endpoint de clientes...');
      
      const response = await apiClient.get<any>(this.endpoint, 5000); // 5s timeout
      
      console.log('✅ Conexión exitosa:', response.success);
      return response.success;
      
    } catch (error: any) {
      console.error('❌ Error de conexión:', error.message);
      return false;
    }
  }
}

export const clienteService = new ClienteService();