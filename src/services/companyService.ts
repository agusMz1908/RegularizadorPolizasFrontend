// src/services/companyService.ts
// ✅ CORREGIDO - Con verificación de autenticación

import { apiClient } from './ApiClient';
import { ENDPOINTS } from '../utils/constants';
import { Company, CompanyLookup } from '../types/core/company';

class CompanyService {
  private readonly endpoint = ENDPOINTS.COMPANIES; 

  private getAuthToken(): string | null {
    const token = localStorage.getItem('authToken') || localStorage.getItem('regularizador_token');
    if (!token) {
      console.warn('🔐 CompanyService: No se encontró token de autenticación');
      return null;
    }
    return token;
  }

  private isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch {
      return false;
    }
  }

  async getCompanies(): Promise<Company[]> {
    const token = this.getAuthToken();
    if (!token || !this.isTokenValid(token)) {
      throw new Error('Token de autenticación inválido o expirado');
    }

    console.log('🏢 CompanyService: Obteniendo compañías...');
    
    const response = await apiClient.get<Company[]>(this.endpoint);
    
    if (!response.success) {
      if (response.status === 401) {
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
      throw new Error(response.error || 'Error obteniendo compañías');
    }
    
    return response.data || [];
  }

  async getCompaniesForLookup(): Promise<CompanyLookup[]> {
    const token = this.getAuthToken();
    if (!token || !this.isTokenValid(token)) {
      throw new Error('Token de autenticación inválido o expirado');
    }

    console.log('🏢 CompanyService: Obteniendo compañías para lookup...');
    
    const response = await apiClient.get<CompanyLookup[]>(`${this.endpoint}/lookup`);
    
    if (!response.success) {
      if (response.status === 401) {
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
      throw new Error(response.error || 'Error obteniendo compañías para lookup');
    }
    
    return response.data || [];
  }

  async getActiveCompanies(): Promise<Company[]> {
    const token = this.getAuthToken();
    if (!token || !this.isTokenValid(token)) {
      throw new Error('Token de autenticación inválido o expirado');
    }

    console.log('🏢 CompanyService: Obteniendo compañías activas...');
    
    const response = await apiClient.get<Company[]>(`${this.endpoint}/active`);
    
    if (!response.success) {
      if (response.status === 401) {
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
      throw new Error(response.error || 'Error obteniendo compañías activas');
    }
    
    console.log('🏢 Compañías recibidas del backend:', response.data);
    
    return response.data || [];
  }

  async getCompanyById(id: number): Promise<Company> {
    const token = this.getAuthToken();
    if (!token || !this.isTokenValid(token)) {
      throw new Error('Token de autenticación inválido o expirado');
    }

    console.log('🏢 CompanyService: Obteniendo compañía por ID:', id);
    
    const response = await apiClient.get<Company>(`${this.endpoint}/${id}`);
    
    if (!response.success) {
      if (response.status === 401) {
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
      throw new Error(response.error || 'Error obteniendo compañía');
    }
    
    return response.data!;
  }
}

export const companyService = new CompanyService();

// ✅ Export solo los tipos, no la clase
export type { Company, CompanyLookup };