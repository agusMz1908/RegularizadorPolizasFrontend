// src/services/clienteService.ts
// ✅ CORRECCIÓN COMPLETA DE TIPOS TYPESCRIPT

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

// ✅ TIPOS PARA LAS RESPUESTAS DEL API
interface ClienteSearchResponse {
  items?: Cliente[];
  data?: Cliente[];
  [key: string]: any; // Para permitir otras propiedades
}

class ClienteService {
  private readonly endpoint = ENDPOINTS.CLIENTES;

  // ✅ COPIADO EXACTO DEL companyService
  private getAuthToken(): string | null {
    const token = localStorage.getItem('authToken') || localStorage.getItem('regularizador_token');
    if (!token) {
      console.warn('🔐 ClienteService: No se encontró token de autenticación');
      return null;
    }
    return token;
  }

  // ✅ COPIADO EXACTO DEL companyService
  private isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch {
      return false;
    }
  }

  // ✅ EXACTO COMO getActiveCompanies()
  async getClientes(): Promise<Cliente[]> {
    const token = this.getAuthToken();
    if (!token || !this.isTokenValid(token)) {
      throw new Error('Token de autenticación inválido o expirado');
    }

    console.log('👥 ClienteService: Obteniendo clientes...');
    
    const response = await apiClient.get<Cliente[]>(this.endpoint);
    
    if (!response.success) {
      if (response.status === 401) {
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
      throw new Error(response.error || 'Error obteniendo clientes');
    }
    
    console.log('👥 Clientes recibidos del backend:', response.data);
    
    return response.data || [];
  }

  // ✅ CORREGIDO: Con tipos flexibles para la respuesta
  async searchClientes(searchTerm: string): Promise<Cliente[]> {
    const token = this.getAuthToken();
    if (!token || !this.isTokenValid(token)) {
      throw new Error('Token de autenticación inválido o expirado');
    }

    console.log('🔍 ClienteService: Buscando clientes:', searchTerm);
    
    if (!searchTerm.trim()) {
      return [];
    }

    // ✅ CORRECCIÓN: Usar tipo flexible para la respuesta
    const response = await apiClient.get<ClienteSearchResponse | Cliente[]>(
      `${this.endpoint}/direct?filtro=${encodeURIComponent(searchTerm)}`
    );
    
    if (!response.success) {
      if (response.status === 401) {
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
      throw new Error(response.error || 'Error buscando clientes');
    }
    
    console.log('👥 Clientes encontrados del backend:', response.data);

    // ✅ CORRECCIÓN: Manejo de tipos seguro
    const data = response.data;
    
    // Caso 1: Respuesta tiene estructura { items: Cliente[] }
    if (data && typeof data === 'object' && 'items' in data && Array.isArray(data.items)) {
      console.log(`✅ Encontrados ${data.items.length} clientes en data.items`);
      return data.items;
    }
    
    // Caso 2: Respuesta es directamente un array de clientes
    if (Array.isArray(data)) {
      console.log(`✅ Encontrados ${data.length} clientes en array directo`);
      return data;
    }
    
    // Caso 3: Respuesta tiene estructura { data: Cliente[] }
    if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
      console.log(`✅ Encontrados ${data.data.length} clientes en data.data`);
      return data.data;
    }
    
    console.warn('⚠️ Formato de respuesta inesperado:', data);
    return [];
  }

  // ✅ EXACTO COMO getCompanyById()
  async getClienteById(id: number): Promise<Cliente> {
    const token = this.getAuthToken();
    if (!token || !this.isTokenValid(token)) {
      throw new Error('Token de autenticación inválido o expirado');
    }

    console.log('👥 ClienteService: Obteniendo cliente por ID:', id);
    
    const response = await apiClient.get<Cliente>(`${this.endpoint}/${id}`);
    
    if (!response.success) {
      if (response.status === 401) {
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
      throw new Error(response.error || 'Error obteniendo cliente');
    }
    
    return response.data!;
  }

  // ✅ Método adicional para crear clientes
  async createCliente(cliente: Partial<Cliente>): Promise<Cliente> {
    const token = this.getAuthToken();
    if (!token || !this.isTokenValid(token)) {
      throw new Error('Token de autenticación inválido o expirado');
    }

    console.log('👥 ClienteService: Creando cliente...');
    
    const response = await apiClient.post<Cliente>(this.endpoint, cliente);
    
    if (!response.success) {
      if (response.status === 401) {
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
      throw new Error(response.error || 'Error creando cliente');
    }
    
    return response.data!;
  }
}

export const clienteService = new ClienteService();