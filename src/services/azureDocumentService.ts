import { apiService } from './api';
import { 
  DocumentProcessRequest, 
  DocumentProcessResponse, 
  DocumentResult 
} from '../types/api';

export class AzureDocumentService {
  private baseUrl = import.meta.env.VITE_AZURE_DOC_ENDPOINT || '/azuredocument';
  private timeout = parseInt(import.meta.env.VITE_AZURE_DOC_TIMEOUT) || 60000;

  public async processDocument(
    file: File,
    clienteId?: number,
    companiaId?: number,
    ramoId?: number,
    onUploadProgress?: (progress: number) => void
  ): Promise<DocumentProcessResponse> {
    try {
      console.log('🔄 Procesando documento via backend API...');
      console.log('📁 Archivo:', file.name, `(${file.size} bytes)`);
      console.log('🎯 Endpoint:', `${import.meta.env.VITE_API_URL}${this.baseUrl}/process`);

      const formData = new FormData();
      formData.append('file', file);
      
      // Agregar parámetros opcionales si están disponibles
      if (clienteId) formData.append('clienteId', clienteId.toString());
      if (companiaId) formData.append('companiaId', companiaId.toString());
      if (ramoId) formData.append('ramoId', ramoId.toString());

      const response = await apiService.post<DocumentProcessResponse>(
        `${this.baseUrl}/process`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            // Agregar API Key si está disponible en localStorage
            ...(localStorage.getItem('api_key') && {
              'X-Api-Key': localStorage.getItem('api_key')
            })
          },
          timeout: this.timeout,
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total && onUploadProgress) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              onUploadProgress(progress);
              console.log(`📊 Progreso de upload: ${progress}%`);
            }
          },
        }
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Error procesando documento en el backend');
      }

      console.log('✅ Documento procesado exitosamente');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error processing document via backend:', error);
      
      // Mejorar el manejo de errores
      if (error.response?.status === 401) {
        throw new Error('No autorizado. Verifica tu API Key.');
      } else if (error.response?.status === 400) {
        throw new Error('Archivo inválido o faltan parámetros requeridos.');
      } else if (error.response?.status === 413) {
        throw new Error('El archivo es demasiado grande.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Timeout al procesar el documento. Intenta con un archivo más pequeño.');
      }
      
      throw new Error(error.message || 'Error procesando documento con Azure Document Intelligence');
    }
  }

  public async getDocumentResult(documentId: string): Promise<DocumentResult> {
    try {
      console.log('🔍 Obteniendo resultado del documento:', documentId);
      
      const response = await apiService.get<DocumentResult>(`${this.baseUrl}/result/${documentId}`);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Error obteniendo resultado del documento');
      }
      
      console.log('✅ Resultado obtenido exitosamente');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error getting document result:', error);
      throw new Error(error.message || 'Error obteniendo resultado del documento');
    }
  }

  public async testConnection(): Promise<boolean> {
    try {
      console.log('🔌 Probando conexión con Azure Document Intelligence via backend...');
      
      const headers: Record<string, string> = {};
      if (localStorage.getItem('api_key')) {
        headers['X-Api-Key'] = localStorage.getItem('api_key')!;
      }
      
      const response = await apiService.get<{ status: string; message?: string }>(
        `${this.baseUrl}/test-connection`,
        { headers }
      );
      
      const isConnected = response.success && response.data?.status === 'success';
      
      if (isConnected) {
        console.log('✅ Conexión con Azure exitosa');
      } else {
        console.log('❌ Conexión con Azure fallida:', response.data?.message);
      }
      
      return isConnected;
    } catch (error) {
      console.error('❌ Error testing Azure connection:', error);
      return false;
    }
  }

  public async getModelInfo(): Promise<any> {
    try {
      console.log('📋 Obteniendo información del modelo Azure...');
      
      const response = await apiService.get(`${this.baseUrl}/model-info`);
      
      if (!response.success) {
        throw new Error(response.error || 'Error obteniendo información del modelo');
      }
      
      console.log('✅ Información del modelo obtenida');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error getting model info:', error);
      throw new Error(error.message || 'Error obteniendo información del modelo Azure');
    }
  }

  public async debugAllModels(): Promise<string> {
    try {
      console.log('🐛 Iniciando debug completo de modelos Azure...');
      
      const response = await apiService.get<{ debugInfo: string }>(`${this.baseUrl}/debug-all-models`);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Error en debug de modelos');
      }
      
      console.log('✅ Debug completado');
      return response.data.debugInfo;
    } catch (error: any) {
      console.error('❌ Error in debug all models:', error);
      throw new Error(error.message || 'Error en debug de modelos Azure');
    }
  }

  // Método para validar configuración
  public validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!this.baseUrl) {
      errors.push('VITE_AZURE_DOC_ENDPOINT no configurado');
    }
    
    if (!import.meta.env.VITE_API_URL) {
      errors.push('VITE_API_URL no configurado');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const azureDocumentService = new AzureDocumentService();