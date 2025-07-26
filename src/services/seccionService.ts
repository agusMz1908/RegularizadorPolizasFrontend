// src/services/seccionService.ts
// ✅ SERVICIO CORREGIDO CON TODOS LOS MÉTODOS NECESARIOS

import { apiClient } from './ApiClient';
import { ENDPOINTS } from '../utils/constants';
import { Seccion } from '../types/core/seccion';

export interface SeccionLookup {
  id: number;
  seccion: string;
  descripcion: string;
  icono?: string;
  activo: boolean;
}

class SeccionService {
  private readonly endpoint = ENDPOINTS.SECCIONES; 

  async getActiveSecciones(): Promise<Seccion[]> {
    console.log('🔍 SeccionService: Obteniendo secciones activas...');
    
    const response = await apiClient.get<Seccion[]>(`${this.endpoint}/active`);
    
    if (!response.success) {
      throw new Error(response.error || 'Error obteniendo secciones activas');
    }
    
    console.log('🔍 Secciones recibidas del backend:', response.data);
    
    return response.data || [];
  }

  async getSeccionesForLookup(): Promise<SeccionLookup[]> {
    console.log('🔍 SeccionService: Obteniendo secciones para lookup...');
    
    const response = await apiClient.get<SeccionLookup[]>(`${this.endpoint}/lookup`);
    
    if (!response.success) {
      throw new Error(response.error || 'Error obteniendo secciones para lookup');
    }
    
    return response.data || [];
  }

  // ✅ MÉTODOS AGREGADOS QUE FALTAN
  async getSecciones(token: string, companyId: number): Promise<Seccion[]> {
    console.log('🔍 SeccionService: Obteniendo secciones por compañía (con token):', companyId);
    
    const response = await apiClient.get<Seccion[]>(`${this.endpoint}/company/${companyId}`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Error obteniendo secciones por compañía');
    }
    
    return response.data || [];
  }

  async getSeccionesLookup(token: string, companyId: number): Promise<SeccionLookup[]> {
    console.log('🔍 SeccionService: Obteniendo secciones lookup por compañía (con token):', companyId);
    
    const response = await apiClient.get<SeccionLookup[]>(`${this.endpoint}/company/${companyId}/lookup`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Error obteniendo secciones lookup por compañía');
    }
    
    return response.data || [];
  }

  async getSeccionesByCompany(companyId: number): Promise<Seccion[]> {
    console.log('🔍 SeccionService: Obteniendo secciones por compañía:', companyId);
    
    const response = await apiClient.get<Seccion[]>(`${this.endpoint}/company/${companyId}`);
    
    if (!response.success) {
      throw new Error(response.error || 'Error obteniendo secciones por compañía');
    }
    
    return response.data || [];
  }

  async searchSecciones(searchTerm: string): Promise<Seccion[]> {
    console.log('🔍 SeccionService: Buscando secciones:', searchTerm);
    
    const response = await apiClient.get<Seccion[]>(`${this.endpoint}/search`, {
      searchTerm
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Error buscando secciones');
    }
    
    return response.data || [];
  }

  async getSeccionById(id: number): Promise<Seccion | null> {
    console.log('🔍 SeccionService: Obteniendo sección por ID:', id);
    
    const response = await apiClient.get<Seccion>(`${this.endpoint}/${id}`);
    
    if (!response.success) {
      console.error('❌ SeccionService: Error obteniendo sección:', response.error);
      return null;
    }
    
    return response.data || null;
  }
}

export const seccionService = new SeccionService();