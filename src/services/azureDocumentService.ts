import { apiService } from './api';
import { 
  DocumentProcessRequest, 
  DocumentProcessResponse, 
  DocumentResult 
} from '../types/api';

export class AzureDocumentService {
  private baseUrl = '/azure-document';

  public async processDocument(
    file: File,
    clienteId: number,
    companiaId: number,
    ramoId: number,
    onUploadProgress?: (progress: number) => void
  ): Promise<DocumentProcessResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('clienteId', clienteId.toString());
      formData.append('companiaId', companiaId.toString());
      formData.append('ramoId', ramoId.toString());

      const response = await apiService.post<DocumentProcessResponse>(
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
      console.error('Error processing document:', error);
      throw new Error(error.message || 'Error procesando documento con Azure Document Intelligence');
    }
  }

  public async getDocumentResult(documentId: string): Promise<DocumentResult> {
    const response = await apiService.get<DocumentResult>(`${this.baseUrl}/result/${documentId}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error obteniendo resultado del documento');
    }
    
    return response.data;
  }

  public async testConnection(): Promise<boolean> {
    try {
      const response = await apiService.get<{ status: string }>(`${this.baseUrl}/test-connection`);
      return response.success && response.data?.status === 'success';
    } catch (error) {
      console.error('Error testing Azure connection:', error);
      return false;
    }
  }

  public async getModelInfo(): Promise<any> {
    const response = await apiService.get(`${this.baseUrl}/model-info`);
    
    if (!response.success) {
      throw new Error(response.error || 'Error obteniendo información del modelo');
    }
    
    return response.data;
  }

  public async debugExtractedFields(file: File): Promise<Record<string, any>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiService.post<Record<string, any>>(
        `${this.baseUrl}/debug-fields`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Error en debug de campos extraídos');
      }

      return response.data;
    } catch (error: any) {
      console.error('Error debugging extracted fields:', error);
      throw new Error(error.message || 'Error en análisis de campos extraídos');
    }
  }
}

export const azureDocumentService = new AzureDocumentService();