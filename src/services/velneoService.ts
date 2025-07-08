import { apiService } from './api';
import { VelneoPolicyRequest, VelneoPolicyResponse } from '../types/api';
import { PolizaFormData } from '../types/poliza';

export class VelneoService {
  private baseUrl = '/velneo';

  public async createPolicy(
    clienteId: number,
    companiaId: number,
    ramoId: number,
    polizaData: PolizaFormData,
    documentoId: string
  ): Promise<VelneoPolicyResponse> {
    try {
      const request: VelneoPolicyRequest = {
        clienteId,
        companiaId,
        ramoId,
        polizaData,
        documentoId,
      };

      const response = await apiService.post<VelneoPolicyResponse>(
        `${this.baseUrl}/create-policy`,
        request
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Error creando póliza en Velneo');
      }

      return response.data;
    } catch (error: any) {
      console.error('Error creating policy in Velneo:', error);
      throw new Error(error.message || 'Error enviando póliza a Velneo');
    }
  }

  public async updatePolicy(
    polizaId: string,
    polizaData: PolizaFormData
  ): Promise<VelneoPolicyResponse> {
    try {
      const response = await apiService.put<VelneoPolicyResponse>(
        `${this.baseUrl}/update-policy/${polizaId}`,
        { polizaData }
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Error actualizando póliza en Velneo');
      }

      return response.data;
    } catch (error: any) {
      console.error('Error updating policy in Velneo:', error);
      throw new Error(error.message || 'Error actualizando póliza en Velneo');
    }
  }

  public async testConnection(): Promise<boolean> {
    try {
      const response = await apiService.get<{ status: string }>(`${this.baseUrl}/test-connection`);
      return response.success && response.data?.status === 'success';
    } catch (error) {
      console.error('Error testing Velneo connection:', error);
      return false;
    }
  }

  public async getPolicyStatus(polizaId: string): Promise<any> {
    const response = await apiService.get(`${this.baseUrl}/policy-status/${polizaId}`);
    
    if (!response.success) {
      throw new Error(response.error || 'Error obteniendo estado de la póliza');
    }
    
    return response.data;
  }
}