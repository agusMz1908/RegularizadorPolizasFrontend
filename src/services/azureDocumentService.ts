// src/services/azureDocumentService.ts
// ⚡ SERVICIO UNIFICADO PARA AZURE DOCUMENT INTELLIGENCE
// 🎯 ALINEADO EXACTAMENTE CON TU BACKEND .NET

import { useState } from 'react';
import { DatosVelneo } from '../types/azure-document';

// 🎯 TIPOS EXACTOS DE TU BACKEND - AzureProcessResponseDto
export interface AzureProcessResponse {
  archivo: string;                    // file.FileName
  timestamp: string;                  // DateTime.UtcNow
  tiempoProcesamiento: number;        // stopwatch.ElapsedMilliseconds  
  estado: string;                     // "PROCESADO_CON_SMART_EXTRACTION"
  datosFormateados: AzureDatosFormateados;
  siguientePaso: string;              // "completar_formulario"
  resumen: AzureResumen;
}

// 🎯 TIPOS EXACTOS - AzureDatosFormateadosDto
export interface AzureDatosFormateados {
  numeroPoliza?: string;
  asegurado?: string;
  documento?: string;
  vehiculo?: string;
  marca?: string;
  modelo?: string;
  matricula?: string;
  motor?: string;
  chasis?: string;
  primaComercial?: number;
  premioTotal?: number;
  vigenciaDesde?: string;
  vigenciaHasta?: string;
  corredor?: string;
  plan?: string;
  ramo?: string;
  anio?: string;
  email?: string;
  direccion?: string;
  departamento?: string;
  localidad?: string;
  color?: string;
  tipoVehiculo?: string;
  uso?: string;
  impuestoMSP?: number;
  formaPago?: string;
  cantidadCuotas?: number;
  codigoPostal?: string;
  descuentos?: number;
  recargos?: number;
}

// 🎯 TIPOS EXACTOS - AzureResumenDto
export interface AzureResumen {
  procesamientoExitoso: boolean;
  numeroPolizaExtraido?: string;
  clienteExtraido?: string;
  documentoExtraido?: string;
  vehiculoExtraido?: string;
  clienteEncontrado: boolean;
  listoParaVelneo: boolean;
}

// 🔧 RESULTADO PROCESADO PARA EL WIZARD
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
  
  // Datos completos para el formulario
  datosFormateados?: AzureDatosFormateados;
  tiempoProcesamiento?: number;
  resumen?: AzureResumen;
  datosVelneo?: DatosVelneo
}

class AzureDocumentService {
  private readonly baseURL: string;
  private readonly endpoint: string;
  private readonly timeout: number;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'https://localhost:7191/api';
    this.endpoint = import.meta.env.VITE_AZURE_DOC_ENDPOINT || 'azuredocument';
    this.timeout = parseInt(import.meta.env.VITE_AZURE_DOC_TIMEOUT || '120000');
    
    console.log('🔧 AzureDocumentService initialized:', {
      baseURL: this.baseURL,
      endpoint: this.endpoint,
      fullEndpoint: `${this.baseURL}/${this.endpoint}`,
      timeout: this.timeout
    });
  }

  /**
   * 🔑 Obtiene el token JWT del localStorage
   */
  private getAuthToken(): string | null {
    const tokenKey = import.meta.env.VITE_JWT_STORAGE_KEY || 'regularizador_token';
    return localStorage.getItem(tokenKey);
  }

  /**
   * 🚀 MÉTODO PRINCIPAL: Procesa documento con Azure AI
   */
  async processDocument(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<DocumentProcessResult> {
    
    console.log('📄 Iniciando procesamiento Azure AI:', file.name);
    
    try {
      // Validar archivo
      if (!file || file.size === 0) {
        throw new Error('Archivo inválido o vacío');
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('El archivo es demasiado grande. Máximo 10MB.');
      }

      // Validar que sea PDF
      if (file.type !== 'application/pdf') {
        throw new Error('Solo se permiten archivos PDF.');
      }

      // Verificar autenticación
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No hay token de autenticación. Por favor, inicia sesión.');
      }

      // Progreso inicial
      onProgress?.(10);

      // Crear FormData
      const formData = new FormData();
      formData.append('file', file);

      const fullUrl = `${this.baseURL}/${this.endpoint}/process`;
      console.log('📤 Enviando request a:', fullUrl);
      console.log('📤 Con token:', token ? 'Presente' : 'Ausente');
      
      // Progreso durante upload
      onProgress?.(30);

      // Realizar request al backend con autenticación
      const response = await fetch(fullUrl, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(this.timeout),
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          // No agregar Content-Type, lo maneja automáticamente con FormData
        }
      });

      onProgress?.(60);

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });

        if (response.status === 401) {
          throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
        }

        if (response.status === 400) {
          throw new Error(`Archivo inválido: ${errorText}`);
        }

        throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
      }

      // La respuesta viene directamente como AzureProcessResponseDto
      const result: AzureProcessResponse = await response.json();
      
      onProgress?.(80);

      console.log('📥 Backend response:', result);

      if (!result || result.estado !== 'PROCESADO_CON_SMART_EXTRACTION') {
        throw new Error('Error en el procesamiento del documento');
      }

      // Mapear respuesta a formato del wizard
      const processedResult = this.mapToWizardFormat(result, file.name);
      
      onProgress?.(100);

      console.log('✅ Documento procesado exitosamente:', processedResult);
      
      return processedResult;

    } catch (error: any) {
      console.error('❌ Error procesando documento:', error);
      
      // Determinar tipo de error
      if (error.name === 'AbortError') {
        throw new Error('El procesamiento tardó demasiado. Intenta con un archivo más pequeño.');
      }
      
      if (error.message.includes('fetch') || error.message.includes('NetworkError')) {
        throw new Error('Error de conexión. Verifica que el servidor esté funcionando.');
      }
      
      throw new Error(error.message || 'Error desconocido procesando documento');
    }
  }

  /**
   * 🔄 Mapea respuesta de Azure a formato del wizard
   */
  private mapToWizardFormat(
    azureResponse: AzureProcessResponse, 
    fileName: string
  ): DocumentProcessResult {
    
    const datos = azureResponse.datosFormateados || {};
    const resumen = azureResponse.resumen || {};
    
    return {
      documentId: `doc_${Date.now()}`, // Generar ID único
      nombreArchivo: fileName,
      estadoProcesamiento: azureResponse.estado || 'PROCESADO',
      timestamp: azureResponse.timestamp,
      
      // Datos principales
      numeroPoliza: datos.numeroPoliza || '',
      asegurado: datos.asegurado || '',
      vigenciaDesde: datos.vigenciaDesde || '',
      vigenciaHasta: datos.vigenciaHasta || '',
      prima: datos.primaComercial || datos.premioTotal || 0,
      
      // Metadatos
      nivelConfianza: resumen.procesamientoExitoso ? 0.9 : 0.5, // Estimación
      requiereVerificacion: !resumen.procesamientoExitoso,
      readyForVelneo: resumen.listoParaVelneo || false,
      
      // Datos completos para el formulario
      datosFormateados: datos,
      tiempoProcesamiento: azureResponse.tiempoProcesamiento,
      resumen: resumen
    };
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

      const response = await fetch(`${this.baseURL}/${this.endpoint}/model-info`, {
        method: 'GET',
        signal: AbortSignal.timeout(10000),
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('No autorizado para consultar información del modelo');
        }
        throw new Error(`Error: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('📊 Model info:', result);
      return result;
    } catch (error) {
      console.error('❌ Error obteniendo info del modelo:', error);
      throw error;
    }
  }

  /**
   * 📦 Procesa múltiples documentos (batch)
   */
  async processBatch(
    files: File[],
    onProgress?: (progress: number) => void
  ): Promise<any> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      onProgress?.(20);

      const response = await fetch(`${this.baseURL}/${this.endpoint}/process-batch`, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(this.timeout * 2), // Más tiempo para batch
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      onProgress?.(80);

      if (!response.ok) {
        throw new Error(`Error en procesamiento batch: ${response.status}`);
      }

      const result = await response.json();
      onProgress?.(100);
      
      return result;
    } catch (error) {
      console.error('❌ Error en procesamiento batch:', error);
      throw error;
    }
  }
}

// 🌟 INSTANCIA ÚNICA DEL SERVICIO
export const azureDocumentService = new AzureDocumentService();

// 🚀 HOOK PERSONALIZADO PARA USAR EL SERVICIO
export const useAzureProcessing = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const processDocument = async (file: File): Promise<DocumentProcessResult> => {
    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      const result = await azureDocumentService.processDocument(file, setProgress);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const getModelInfo = async () => {
    try {
      return await azureDocumentService.getModelInfo();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const reset = () => {
    setIsProcessing(false);
    setProgress(0);
    setError(null);
  };

  return {
    isProcessing,
    progress,
    error,
    processDocument,
    getModelInfo,
    reset
  };
};

export default azureDocumentService;