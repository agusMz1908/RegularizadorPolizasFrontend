import { apiService } from './api';
import type {
  AzureProcessResponse,
  AzureBatchResponse,
  AzureModelInfoResponse,
  DatosClienteExtraidos
} from '../types/azure-document';

export class AzureDocumentService {
  private baseUrl = '/api/AzureDocument';

  public async processDocument(
    file: File,
    onUploadProgress?: (progress: number) => void
  ): Promise<AzureProcessResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiService.post<AzureProcessResponse>(
        `${this.baseUrl}/process`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total && onUploadProgress) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              onUploadProgress(progress);
            }
          },
        }
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Error procesando documento');
      }

      return response.data;
    } catch (error: any) {
      console.error('Error in processDocument:', error);
      throw new Error(error.message || 'Error procesando documento con Azure Document Intelligence');
    }
  }

  public async processBatchDocuments(
    files: File[],
    onProgress?: (progress: number) => void
  ): Promise<AzureBatchResponse> {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await apiService.post<AzureBatchResponse>(
        `${this.baseUrl}/process-batch`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total && onProgress) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              onProgress(progress);
            }
          },
        }
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Error procesando documentos en lote');
      }

      return response.data;
    } catch (error: any) {
      console.error('Error in processBatchDocuments:', error);
      throw new Error(error.message || 'Error procesando documentos en lote');
    }
  }

  public async searchClient(datosCliente: DatosClienteExtraidos): Promise<any> {
    try {
      const response = await apiService.post(
        `${this.baseUrl}/search-client`,
        datosCliente,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Error en búsqueda de cliente');
      }

      return response.data;
    } catch (error: any) {
      console.error('Error in searchClient:', error);
      throw new Error(error.message || 'Error en búsqueda manual de cliente');
    }
  }

  public async getModelInfo(): Promise<AzureModelInfoResponse> {
    try {
      const response = await apiService.get<AzureModelInfoResponse>(`${this.baseUrl}/model-info`);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Error obteniendo información del modelo');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error getting model info:', error);
      throw new Error(error.message || 'Error obteniendo información del modelo');
    }
  }

  public async testConnection(): Promise<boolean> {
    try {
      const modelInfo = await this.getModelInfo();
      return modelInfo.estaActivo || false;
    } catch (error) {
      console.error('Error testing Azure connection:', error);
      return false;
    }
  }
}

export const azureDocumentService = new AzureDocumentService();