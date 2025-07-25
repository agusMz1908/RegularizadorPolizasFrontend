import { apiClient } from './ApiClient';
import { ENDPOINTS } from '../utils/constants';

// Tipos para Azure Document Service
export interface DocumentProcessResult {
  documentId: string;
  nombreArchivo: string;
  estadoProcesamiento: string;
  timestamp?: string;
  
  // Datos principales extraídos
  numeroPoliza?: string;
  asegurado?: string;
  vigenciaDesde?: string;
  vigenciaHasta?: string;
  prima?: number;
  
  // Metadatos
  nivelConfianza?: number;
  requiereVerificacion?: boolean;
  readyForVelneo?: boolean;
  
  // Datos completos desde el backend
  datosVelneo?: any;
  tiempoProcesamiento?: number;
  porcentajeCompletitud?: number;
}

export interface AzureProcessResponse {
  archivo: string;
  timestamp: string;
  tiempoProcesamiento: number;
  estado: string;
  datosVelneo: any;
  procesamientoExitoso: boolean;
  listoParaVelneo: boolean;
  porcentajeCompletitud: number;
}

class AzureService {
  private readonly endpoint = ENDPOINTS.AZURE_PROCESS; // '/azuredocument/process'

  async processDocument(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<DocumentProcessResult> {
    
    console.log('📄 AzureService: Procesando documento:', file.name);
    
    // Validaciones
    if (!file || file.size === 0) {
      throw new Error('Archivo inválido o vacío');
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('El archivo es demasiado grande. Máximo 10MB.');
    }

    if (file.type !== 'application/pdf') {
      throw new Error('Solo se permiten archivos PDF.');
    }

    try {
      onProgress?.(10);

      // ✅ USAR EL NUEVO apiClient.uploadFile
      const response = await apiClient.uploadFile<AzureProcessResponse>(
        this.endpoint,
        file
      );

      onProgress?.(80);

      if (!response.success) {
        throw new Error(response.error || 'Error procesando documento');
      }

      const azureResponse = response.data!;

      // Verificar estructura
      if (!azureResponse.datosVelneo) {
        console.error('❌ No se encontró datosVelneo en la respuesta:', azureResponse);
        throw new Error('El backend no devolvió la estructura esperada (datosVelneo)');
      }

      const processedResult = this.mapToWizardFormat(azureResponse, file.name);
      
      onProgress?.(100);

      console.log('✅ AzureService: Documento procesado exitosamente');
      return processedResult;

    } catch (error: any) {
      console.error('❌ AzureService: Error procesando documento:', error);
      
      if (error.name === 'AbortError') {
        throw new Error('El procesamiento tardó demasiado. Intenta con un archivo más pequeño.');
      }
      
      throw error;
    }
  }

  private mapToWizardFormat(azureResponse: AzureProcessResponse, fileName: string): DocumentProcessResult {
    const datosVelneo = azureResponse.datosVelneo;
    
    return {
      documentId: `doc_${Date.now()}`,
      nombreArchivo: fileName,
      estadoProcesamiento: azureResponse.estado || 'PROCESADO',
      timestamp: azureResponse.timestamp,
      
      // Datos principales
      numeroPoliza: datosVelneo?.datosPoliza?.numeroPoliza,
      asegurado: datosVelneo?.datosBasicos?.asegurado,
      vigenciaDesde: datosVelneo?.datosPoliza?.desde,
      vigenciaHasta: datosVelneo?.datosPoliza?.hasta,
      prima: datosVelneo?.condicionesPago?.prima,
      
      // Metadatos
      nivelConfianza: azureResponse.porcentajeCompletitud ? 
        (azureResponse.porcentajeCompletitud / 100) : 0.5,
      requiereVerificacion: !datosVelneo?.tieneDatosMinimos,
      readyForVelneo: azureResponse.listoParaVelneo || false,
      
      // Datos completos
      datosVelneo: datosVelneo,
      tiempoProcesamiento: azureResponse.tiempoProcesamiento,
      porcentajeCompletitud: azureResponse.porcentajeCompletitud
    };
  }

  async getModelInfo(): Promise<any> {
    const response = await apiClient.get(ENDPOINTS.AZURE_MODEL_INFO);
    
    if (!response.success) {
      throw new Error(response.error || 'Error obteniendo información del modelo');
    }
    
    return response.data;
  }

  validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!import.meta.env.VITE_API_URL) {
      errors.push('VITE_API_URL no está configurado');
    }
    
    if (!apiClient.getStoredToken()) {
      errors.push('Token de autenticación no encontrado');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const azureService = new AzureService();