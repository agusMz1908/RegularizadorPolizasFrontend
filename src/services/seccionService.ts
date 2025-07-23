// src/services/seccionService.ts
import { apiService } from './api';
import { Seccion, SeccionLookup } from '../types/seccion';

class SeccionService {
  // Obtener todas las secciones activas
  async getActiveSecciones(): Promise<Seccion[]> {
    try {
      console.log('🔍 SeccionService: Getting active secciones...');
      
      const response = await apiService.get<Seccion[]>('/secciones/active');
      
      if (response.success && response.data) {
        console.log('✅ SeccionService: Active secciones loaded:', response.data.length);
        return response.data;
      }
      
      console.warn('⚠️ SeccionService: No active secciones found');
      return [];
    } catch (error) {
      console.error('❌ SeccionService: Error loading active secciones:', error);
      throw new Error('Error al cargar las secciones activas');
    }
  }

  // Obtener secciones para lookup/dropdown
  async getSeccionesForLookup(): Promise<SeccionLookup[]> {
    try {
      console.log('🔍 SeccionService: Getting secciones for lookup...');
      
      const response = await apiService.get<SeccionLookup[]>('/secciones/lookup');
      
      if (response.success && response.data) {
        console.log('✅ SeccionService: Lookup secciones loaded:', response.data.length);
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error('❌ SeccionService: Error loading lookup secciones:', error);
      throw new Error('Error al cargar las secciones para selección');
    }
  }

  // Obtener sección por ID
  async getSeccionById(id: number): Promise<Seccion | null> {
    try {
      console.log('🔍 SeccionService: Getting seccion by ID:', id);
      
      const response = await apiService.get<Seccion>(`/secciones/${id}`);
      
      if (response.success && response.data) {
        console.log('✅ SeccionService: Seccion found:', response.data.name);
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('❌ SeccionService: Error getting seccion by ID:', error);
      return null;
    }
  }

  // Buscar secciones por término
  async searchSecciones(searchTerm: string): Promise<Seccion[]> {
    try {
      console.log('🔍 SeccionService: Searching secciones:', searchTerm);
      
      const response = await apiService.get<Seccion[]>(`/secciones/search?searchTerm=${encodeURIComponent(searchTerm)}`);
      
      if (response.success && response.data) {
        console.log('✅ SeccionService: Found secciones:', response.data.length);
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error('❌ SeccionService: Error searching secciones:', error);
      return [];
    }
  }

  // Obtener secciones por compañía
  async getSeccionesByCompany(companyId: number): Promise<Seccion[]> {
    try {
      console.log('🔍 SeccionService: Getting secciones for company:', companyId);
      
      const response = await apiService.get<Seccion[]>(`/secciones/company/${companyId}`);
      
      if (response.success && response.data) {
        console.log('✅ SeccionService: Company secciones loaded:', response.data.length);
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error('❌ SeccionService: Error loading company secciones:', error);
      return [];
    }
  }
}

export const seccionService = new SeccionService();