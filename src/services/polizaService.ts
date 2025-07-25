import { apiClient } from './ApiClient';
import { ENDPOINTS } from '../utils/constants';

import { PolizaCreateRequest } from '../types/poliza';

class PolizaService {
  private readonly endpoint = ENDPOINTS.POLIZAS; 

  async createPoliza(request: PolizaCreateRequest): Promise<any> {
    console.log('📋 PolizaService: Creando póliza en Velneo...');
    console.log('📤 Datos a enviar:', request);
    
    const response = await apiClient.post<any>(this.endpoint, request);
    
    if (!response.success) {
      console.error('❌ Error en PolizaService:', response.error);
      throw new Error(response.error || 'Error creando póliza en Velneo');
    }
    
    console.log('✅ PolizaService: Póliza creada exitosamente:', response.data);
    return response.data!;
  }

  async getPolizas(params?: any): Promise<any> {
    console.log('📋 PolizaService: Obteniendo pólizas...');
    
    const response = await apiClient.get<any>(this.endpoint, params);
    
    if (!response.success) {
      throw new Error(response.error || 'Error obteniendo pólizas');
    }
    
    return response.data!;
  }

  async getPolizaById(id: number): Promise<any> {
    console.log('📋 PolizaService: Obteniendo póliza por ID:', id);
    
    const response = await apiClient.get<any>(`${this.endpoint}/${id}`);
    
    if (!response.success) {
      throw new Error(response.error || 'Error obteniendo póliza');
    }
    
    return response.data!;
  }

  async updatePoliza(id: number, request: Partial<PolizaCreateRequest>): Promise<any> {
    console.log('📋 PolizaService: Actualizando póliza:', id);
    
    const response = await apiClient.put<any>(`${this.endpoint}/${id}`, request);
    
    if (!response.success) {
      throw new Error(response.error || 'Error actualizando póliza');
    }
    
    return response.data!;
  }

  async deletePoliza(id: number): Promise<void> {
    console.log('📋 PolizaService: Eliminando póliza:', id);
    
    const response = await apiClient.delete(`${this.endpoint}/${id}`);
    
    if (!response.success) {
      throw new Error(response.error || 'Error eliminando póliza');
    }
  }
}

export const polizaService = new PolizaService();