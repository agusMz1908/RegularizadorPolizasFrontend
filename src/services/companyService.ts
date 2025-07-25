import { apiClient } from './ApiClient';
import { ENDPOINTS } from '../utils/constants';

export interface Company {
  id: number;
  nombre: string;
  codigo: string;
  activo: boolean;
}

export interface CompanyLookup {
  id: number;
  nombre: string;
  codigo: string;
}

class CompanyService {
  private readonly endpoint = ENDPOINTS.COMPANIES; 

  async getCompanies(): Promise<Company[]> {
    console.log('🏢 CompanyService: Obteniendo compañías...');
    
    const response = await apiClient.get<Company[]>(this.endpoint);
    
    if (!response.success) {
      throw new Error(response.error || 'Error obteniendo compañías');
    }
    
    return response.data || [];
  }

  async getCompaniesForLookup(): Promise<CompanyLookup[]> {
    console.log('🏢 CompanyService: Obteniendo compañías para lookup...');
    
    const response = await apiClient.get<CompanyLookup[]>('/Companies');
    
    if (!response.success) {
      throw new Error(response.error || 'Error obteniendo compañías para lookup');
    }
    
    return response.data || [];
  }

  async getActiveCompanies(): Promise<Company[]> {
    console.log('🏢 CompanyService: Obteniendo compañías activas...');
    
    const response = await apiClient.get<Company[]>(`${this.endpoint}/active`);
    
    if (!response.success) {
      throw new Error(response.error || 'Error obteniendo compañías activas');
    }
    
    return response.data || [];
  }

  async getCompanyById(id: number): Promise<Company> {
    console.log('🏢 CompanyService: Obteniendo compañía por ID:', id);
    
    const response = await apiClient.get<Company>(`${this.endpoint}/${id}`);
    
    if (!response.success) {
      throw new Error(response.error || 'Error obteniendo compañía');
    }
    
    return response.data!;
  }
}

export const companyService = new CompanyService();