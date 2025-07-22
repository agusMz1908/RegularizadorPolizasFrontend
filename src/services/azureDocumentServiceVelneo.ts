// src/services/azureDocumentServiceVelneo.ts
// 🎯 PASO 2: SERVICIO ACTUALIZADO PARA LA NUEVA ESTRUCTURA VELNEO

import { useState } from 'react';
import { 
  AzureProcessResponseVelneo, 
  DocumentProcessResultVelneo,
  AzureErrorResponseVelneo
} from '../types/azure-document-velneo';

/**
 * Servicio principal para Azure Document Intelligence con estructura Velneo
 */
class AzureDocumentServiceVelneo {
  private baseURL = import.meta.env.VITE_API_URL;
  private endpoint = import.meta.env.VITE_AZURE_DOC_ENDPOINT;
  private timeout = parseInt(import.meta.env.VITE_AZURE_DOC_TIMEOUT || '120000', 10);

  /**
   * Obtiene el token de autenticación desde las variables de entorno
   */
  private getAuthToken(): string | null {
    const storageKey = import.meta.env.VITE_JWT_STORAGE_KEY;
    return localStorage.getItem(storageKey);
  }

  /**
   * 📄 Procesa un documento con la nueva estructura Velneo
   */
  async processDocument(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<DocumentProcessResultVelneo> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No hay token de autenticación disponible');
      }

      // Validaciones iniciales
      this.validateFile(file);
      
      onProgress?.(5);
      
      console.log('📤 Iniciando procesamiento Azure Document Intelligence:', {
        archivo: file.name,
        tamaño: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        tipo: file.type
      });

      // Preparar FormData
      const formData = new FormData();
      formData.append('file', file);

      onProgress?.(10);

      // Llamada a la API
      const response = await fetch(`${this.baseURL}/${this.endpoint}/process`, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(this.timeout),
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      onProgress?.(50);

      // Validar respuesta HTTP
      if (!response.ok) {
        await this.handleHttpError(response);
      }

      onProgress?.(70);

      // Parsear respuesta
      const azureResponse: AzureProcessResponseVelneo = await response.json();
      
      console.log('✅ Respuesta Azure recibida:', {
        archivo: azureResponse.archivo,
        estado: azureResponse.estado,
        procesamientoExitoso: azureResponse.procesamientoExitoso,
        porcentajeCompletitud: azureResponse.porcentajeCompletitud,
        tiempoProcesamiento: `${azureResponse.tiempoProcesamiento}ms`,
        camposExtraidos: azureResponse.datosVelneo?.metricas?.camposExtraidos,
        listoParaVelneo: azureResponse.listoParaVelneo
      });

      onProgress?.(90);

      // Validar estructura de respuesta
      this.validateAzureResponse(azureResponse);

      // Mapear a formato del wizard
      const processedResult = this.mapToWizardFormat(azureResponse, file.name);

      onProgress?.(100);

      console.log('🎯 Documento procesado exitosamente:', {
        documentId: processedResult.documentId,
        porcentajeCompletitud: processedResult.porcentajeCompletitud,
        listoParaVelneo: processedResult.listoParaVelneo,
        numeroPoliza: processedResult.datosVelneo.datosPoliza.numeroPoliza,
        asegurado: processedResult.datosVelneo.datosBasicos.asegurado,
        tramite: processedResult.datosVelneo.datosBasicos.tramite
      });
      
      return processedResult;

    } catch (error: any) {
      console.error('❌ Error procesando documento:', error);
      
      // Mapear errores específicos
      if (error.name === 'AbortError') {
        throw new Error('⏱️ El procesamiento tardó demasiado tiempo. Intenta con un archivo más pequeño o verifica tu conexión.');
      }
      
      if (error.message.includes('fetch') || error.message.includes('NetworkError')) {
        throw new Error('🌐 Error de conexión. Verifica que el servidor esté funcionando y tu conexión a internet.');
      }

      if (error.message.includes('token') || error.message.includes('auth')) {
        throw new Error('🔐 Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
      
      throw new Error(error.message || 'Error desconocido procesando documento');
    }
  }

  /**
   * 🔄 Mapea respuesta de Azure a formato del wizard
   */
  private mapToWizardFormat(
    azureResponse: AzureProcessResponseVelneo, 
    fileName: string
  ): DocumentProcessResultVelneo {
    
    // Calcular nivel de confianza basado en métricas
    const metricas = azureResponse.datosVelneo.metricas;
    const nivelConfianza = this.calculateConfidenceLevel(metricas, azureResponse.procesamientoExitoso);
    
    return {
      documentId: `velneo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      nombreArchivo: fileName,
      estadoProcesamiento: azureResponse.estado,
      timestamp: azureResponse.timestamp,
      tiempoProcesamiento: azureResponse.tiempoProcesamiento,
      porcentajeCompletitud: azureResponse.porcentajeCompletitud,
      procesamientoExitoso: azureResponse.procesamientoExitoso,
      listoParaVelneo: azureResponse.listoParaVelneo,
      
      // Datos completos estructurados
      datosVelneo: azureResponse.datosVelneo,
      
      // Metadatos calculados
      nivelConfianza,
      requiereVerificacion: this.shouldRequireVerification(azureResponse),
    };
  }

  /**
   * 📊 Calcula el nivel de confianza del procesamiento
   */
  private calculateConfidenceLevel(metricas: any, procesamientoExitoso: boolean): number {
    if (!procesamientoExitoso) return 0.3;
    
    const baseConfidence = procesamientoExitoso ? 0.7 : 0.3;
    const completitudBonus = (metricas?.porcentajeCompletitud || 0) * 0.003; // 0.3 máximo
    const camposExtraidosBonus = Math.min((metricas?.camposExtraidos || 0) * 0.002, 0.2); // 0.2 máximo
    
    const totalConfidence = baseConfidence + completitudBonus + camposExtraidosBonus;
    return Math.min(Math.max(totalConfidence, 0), 1); // Entre 0 y 1
  }

  /**
   * ⚠️ Determina si requiere verificación manual
   */
  private shouldRequireVerification(azureResponse: AzureProcessResponseVelneo): boolean {
    const metricas = azureResponse.datosVelneo.metricas;
    
    return !azureResponse.procesamientoExitoso ||
           azureResponse.porcentajeCompletitud < 80 ||
           !azureResponse.datosVelneo.tieneDatosMinimos ||
           (metricas.camposFaltantes && metricas.camposFaltantes.length > 3) ||
           (metricas.camposConfianzaBaja && metricas.camposConfianzaBaja.length > 0);
  }

  /**
   * ✅ Valida el archivo antes de enviarlo
   */
  private validateFile(file: File): void {
    const maxSize = Number(import.meta.env.VITE_MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB por defecto
    const allowedTypes = import.meta.env.VITE_ALLOWED_FILE_TYPES?.split(',') || ['application/pdf'];

    if (!file) {
      throw new Error('No se ha seleccionado ningún archivo');
    }

    if (file.size > maxSize) {
      throw new Error(`El archivo es demasiado grande. Máximo permitido: ${(maxSize / 1024 / 1024).toFixed(1)}MB`);
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Tipo de archivo no válido. Solo se permiten: ${allowedTypes.join(', ')}`);
    }

    if (file.name.length > 100) {
      throw new Error('El nombre del archivo es demasiado largo (máximo 100 caracteres)');
    }
  }

  /**
   * 🔍 Valida la estructura de respuesta de Azure
   */
  private validateAzureResponse(response: AzureProcessResponseVelneo): void {
    if (!response) {
      throw new Error('Respuesta vacía del servidor');
    }

    if (!response.datosVelneo) {
      throw new Error('Estructura de datos incompleta en la respuesta');
    }

    const required = ['datosBasicos', 'datosPoliza', 'datosVehiculo', 'metricas'];
    for (const field of required) {
      if (!response.datosVelneo[field as keyof typeof response.datosVelneo]) {
        throw new Error(`Campo requerido faltante: ${field}`);
      }
    }
  }

  /**
   * ⚠️ Maneja errores HTTP específicos
   */
  private async handleHttpError(response: Response): Promise<never> {
    let errorMessage = `Error HTTP ${response.status}: ${response.statusText}`;
    
    try {
      const errorData: AzureErrorResponseVelneo = await response.json();
      errorMessage = errorData.error || errorMessage;
      
      if (errorData.sugerencias && errorData.sugerencias.length > 0) {
        errorMessage += `\n\nSugerencias: ${errorData.sugerencias.join(', ')}`;
      }
    } catch (parseError) {
      // Si no puede parsear el error, usar el mensaje HTTP por defecto
    }

    // Mapear códigos de error específicos
    switch (response.status) {
      case 401:
        throw new Error('🔐 No autorizado. Tu sesión ha expirado, por favor inicia sesión nuevamente.');
      case 413:
        throw new Error('📄 El archivo es demasiado grande. El tamaño máximo permitido es 10MB.');
      case 415:
        throw new Error('📎 Tipo de archivo no soportado. Solo se permiten archivos PDF.');
      case 429:
        throw new Error('⏳ Demasiadas solicitudes. Espera un momento antes de intentar nuevamente.');
      case 500:
        throw new Error('🔧 Error interno del servidor. Intenta nuevamente en unos minutos.');
      case 503:
        throw new Error('🔄 Servicio temporalmente no disponible. Intenta más tarde.');
      default:
        throw new Error(errorMessage);
    }
  }

  /**
   * 📊 Obtiene información del modelo Azure
   */
  async getModelInfo(): Promise<any> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      console.log('📊 Consultando información del modelo Azure...');

      const response = await fetch(`${this.baseURL}/${this.endpoint}/model-info`, {
        method: 'GET',
        signal: AbortSignal.timeout(Number(import.meta.env.VITE_API_TIMEOUT) || 10000),
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('No autorizado para consultar información del modelo');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ Información del modelo obtenida:', result);
      return result;
    } catch (error) {
      console.error('❌ Error obteniendo info del modelo:', error);
      throw error;
    }
  }

  /**
   * 🔄 Resetea el estado interno si es necesario
   */
  reset(): void {
    // Limpiar cualquier estado interno si es necesario
    console.log('🔄 Servicio Azure reseteado');
  }

  /**
   * 🩺 Verifica el estado de salud del servicio
   */
  async healthCheck(): Promise<{ status: string; message: string; timestamp: string }> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        return {
          status: 'error',
          message: 'No hay token de autenticación',
          timestamp: new Date().toISOString()
        };
      }

      const response = await fetch(`${this.baseURL.replace('/api', '')}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(Number(import.meta.env.VITE_API_TIMEOUT) || 5000),
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      return {
        status: response.ok ? 'ok' : 'error',
        message: response.ok ? 'Servicio funcionando correctamente' : `Error ${response.status}`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'No se puede conectar con el servicio',
        timestamp: new Date().toISOString()
      };
    }
  }
}

// ================================
// INSTANCIA Y HOOK
// ================================

/**
 * 🌟 Instancia única del servicio
 */
export const azureDocumentServiceVelneo = new AzureDocumentServiceVelneo();

/**
 * 🚀 Hook personalizado para usar el servicio con React
 */
export const useAzureProcessingVelneo = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DocumentProcessResultVelneo | null>(null);

  /**
   * Procesa un documento
   */
  const processDocument = async (file: File): Promise<DocumentProcessResultVelneo> => {
    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setResult(null);

    try {
      const processedResult = await azureDocumentServiceVelneo.processDocument(file, setProgress);
      setResult(processedResult);
      return processedResult;
    } catch (err: any) {
      const errorMessage = err.message || 'Error desconocido procesando documento';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Obtiene información del modelo
   */
  const getModelInfo = async () => {
    try {
      return await azureDocumentServiceVelneo.getModelInfo();
    } catch (err: any) {
      const errorMessage = err.message || 'Error obteniendo información del modelo';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Verifica estado de salud
   */
  const checkHealth = async () => {
    try {
      return await azureDocumentServiceVelneo.healthCheck();
    } catch (err: any) {
      const errorMessage = err.message || 'Error verificando estado del servicio';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Resetea el estado
   */
  const reset = () => {
    setIsProcessing(false);
    setProgress(0);
    setError(null);
    setResult(null);
    azureDocumentServiceVelneo.reset();
  };

  /**
   * Limpia solo el error
   */
  const clearError = () => {
    setError(null);
  };

  return {
    // Estados
    isProcessing,
    progress,
    error,
    result,

    // Acciones
    processDocument,
    getModelInfo,
    checkHealth,
    reset,
    clearError,

    // Getters de conveniencia
    hasError: !!error,
    hasResult: !!result,
    isComplete: !isProcessing && !!result,
  };
};

export default azureDocumentServiceVelneo;