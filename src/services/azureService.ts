// Para src/services/azureService.ts - Imports y tipos corregidos

import { apiClient } from './ApiClient';
import { ENDPOINTS } from '../utils/constants';

// ✅ IMPORTAR EL TIPO CORRECTO DESDE WIZARD
import type { DocumentProcessResult } from '../types/wizard';

// ✅ TIPOS LOCALES PARA LA RESPUESTA DEL BACKEND
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
    
    console.log('📄 AzureService: Procesando documento:', {
      fileName: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      fileType: file.type,
      endpoint: this.endpoint
    });
    
    // ✅ VALIDACIONES
    if (!file || file.size === 0) {
      throw new Error('Archivo inválido o vacío');
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error(`El archivo es demasiado grande (${(file.size / 1024 / 1024).toFixed(2)}MB). Máximo 10MB.`);
    }

    if (file.type !== 'application/pdf') {
      throw new Error(`Tipo de archivo no válido: ${file.type}. Solo se permiten archivos PDF.`);
    }

    try {
      onProgress?.(10);

      const response = await apiClient.uploadFile<AzureProcessResponse>(
        this.endpoint,
        file
      );

      onProgress?.(70);

      if (!response.success) {
        throw new Error(response.error || 'Error procesando documento');
      }

      const azureResponse = response.data!;
      const processedResult = this.mapToWizardFormat(azureResponse, file.name);
      
      onProgress?.(100);

      console.log('✅ AzureService: Documento procesado exitosamente');
      return processedResult;

    } catch (error: any) {
      console.error('❌ AzureService: Error procesando documento:', error);
      onProgress?.(0);
      
      if (error.name === 'AbortError') {
        throw new Error('El procesamiento tardó demasiado. Intenta con un archivo más pequeño.');
      }
      
      throw error;
    }
  }

  // ✅ FUNCIÓN CORREGIDA (usa el código del artifact anterior)
  private mapToWizardFormat(azureResponse: AzureProcessResponse, fileName: string): DocumentProcessResult {
    console.log('🔄 Mapeando respuesta del backend al formato del wizard...', azureResponse);
    
    const datosVelneo = azureResponse.datosVelneo || {};
    
    const result: DocumentProcessResult = {
      documentId: `doc_${Date.now()}`,
      estadoProcesamiento: azureResponse.estado || 'PROCESADO',
      nombreArchivo: fileName,
      timestamp: azureResponse.timestamp || new Date().toISOString(),
      
      numeroPoliza: datosVelneo?.datosPoliza?.numeroPoliza || datosVelneo?.numeroPoliza,
      asegurado: datosVelneo?.datosBasicos?.asegurado || datosVelneo?.asegurado,
      vigenciaDesde: datosVelneo?.datosPoliza?.desde || datosVelneo?.vigenciaDesde || datosVelneo?.desde,
      vigenciaHasta: datosVelneo?.datosPoliza?.hasta || datosVelneo?.vigenciaHasta || datosVelneo?.hasta,
      prima: datosVelneo?.condicionesPago?.prima || datosVelneo?.prima,
      
      nivelConfianza: azureResponse.porcentajeCompletitud ? (azureResponse.porcentajeCompletitud / 100) : undefined,
      requiereVerificacion: !azureResponse.procesamientoExitoso || !datosVelneo?.tieneDatosMinimos,
      readyForVelneo: azureResponse.listoParaVelneo || azureResponse.procesamientoExitoso || false,
      tiempoProcesamiento: azureResponse.tiempoProcesamiento,
      porcentajeCompletitud: azureResponse.porcentajeCompletitud,
      
      vehiculo: datosVelneo?.datosVehiculo?.marcaModelo || datosVelneo?.datosVehiculo?.marca,
      marca: datosVelneo?.datosVehiculo?.marca,
      modelo: datosVelneo?.datosVehiculo?.modelo,
      motor: datosVelneo?.datosVehiculo?.motor,
      chasis: datosVelneo?.datosVehiculo?.chasis,
      matricula: datosVelneo?.datosVehiculo?.matricula,
      combustible: datosVelneo?.datosVehiculo?.combustible,
      anio: datosVelneo?.datosVehiculo?.anio?.toString(),
      
      primaComercial: datosVelneo?.condicionesPago?.prima,
      premioTotal: datosVelneo?.condicionesPago?.premio || datosVelneo?.condicionesPago?.total,
      corredor: datosVelneo?.datosBasicos?.corredor,
      ramo: datosVelneo?.datosPoliza?.ramo,
      moneda: datosVelneo?.condicionesPago?.moneda,
      
      documento: datosVelneo?.datosBasicos?.documento,
      email: datosVelneo?.datosBasicos?.email,
      telefono: datosVelneo?.datosBasicos?.telefono,
      direccion: datosVelneo?.datosBasicos?.domicilio,
      localidad: datosVelneo?.datosBasicos?.localidad,
      departamento: datosVelneo?.datosBasicos?.departamento,
      
      datosVelneo: datosVelneo
    };

    console.log('✅ Mapeo completado:', result);
    return result;
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