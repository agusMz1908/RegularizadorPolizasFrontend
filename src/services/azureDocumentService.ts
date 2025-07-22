import { DatosVelneo } from '../types/azure-document';

// 🎯 TIPOS EXACTOS DE TU BACKEND - AzureProcessResponseDto
export interface AzureProcessResponse {
  archivo: string;                    // file.FileName
  timestamp: string;                  // DateTime.UtcNow
  tiempoProcesamiento: number;        // stopwatch.ElapsedMilliseconds  
  estado: string;                     // "PROCESADO_CON_SMART_EXTRACTION"
  datosVelneo: DatosVelneo;          // ✅ ESTE ES EL CAMPO CORRECTO
  procesamientoExitoso: boolean;
  listoParaVelneo: boolean;
  porcentajeCompletitud: number;
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
  
  // ✅ DATOS COMPLETOS DESDE EL BACKEND
  datosVelneo?: DatosVelneo;  // La estructura completa del backend
  tiempoProcesamiento?: number;
  porcentajeCompletitud?: number;
  listoParaVelneo?: string;
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

      // Realizar petición
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // No establecer Content-Type manualmente para FormData
        },
        body: formData,
        signal: AbortSignal.timeout(this.timeout)
      });

      onProgress?.(80);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error HTTP:', response.status, errorText);

        if (response.status === 401) {
          throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
        } else if (response.status === 413) {
          throw new Error('El archivo es demasiado grande para el servidor.');
        } else if (response.status === 415) {
          throw new Error('Tipo de archivo no soportado. Solo se permiten PDFs.');
        } else {
          throw new Error(`Error del servidor: ${response.status}. ${errorText}`);
        }
      }

      const azureResponse: AzureProcessResponse = await response.json();
      console.log('📥 Respuesta completa del backend:', azureResponse);

      // ✅ VERIFICAR ESTRUCTURA CORRECTA
      if (!azureResponse.datosVelneo) {
        console.error('❌ No se encontró datosVelneo en la respuesta:', azureResponse);
        throw new Error('El backend no devolvió la estructura esperada (datosVelneo)');
      }

      // ✅ MAPEAR CORRECTAMENTE A DocumentProcessResult
      const processedResult = this.mapToWizardFormat(azureResponse, file.name);
      
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
   * 🔄 Mapea respuesta de Azure a formato del wizard - VERSIÓN CORREGIDA
   */
  private mapToWizardFormat(
    azureResponse: AzureProcessResponse, 
    fileName: string
  ): DocumentProcessResult {
    
    const datosVelneo = azureResponse.datosVelneo;
    
    console.log('🗂️ Mapeando datosVelneo:', datosVelneo);
    
    return {
      documentId: datosVelneo.datosPoliza?.numeroPoliza || `doc_${Date.now()}`,
      nombreArchivo: fileName,
      estadoProcesamiento: azureResponse.estado || 'PROCESADO',
      timestamp: azureResponse.timestamp,
      
      // ✅ DATOS PRINCIPALES DESDE datosVelneo
      numeroPoliza: datosVelneo.datosPoliza?.numeroPoliza || '',
      asegurado: datosVelneo.datosBasicos?.asegurado || '',
      vigenciaDesde: datosVelneo.datosPoliza?.desde || '',
      vigenciaHasta: datosVelneo.datosPoliza?.hasta || '',
      prima: datosVelneo.condicionesPago?.premio || 0,
      
      // Metadatos
      nivelConfianza: datosVelneo.porcentajeCompletitud ? (datosVelneo.porcentajeCompletitud / 100) : 0.5,
      requiereVerificacion: !datosVelneo.tieneDatosMinimos,
      readyForVelneo: azureResponse.listoParaVelneo || false,
      
      // ✅ DATOS COMPLETOS PARA EL FORMULARIO
      datosVelneo: datosVelneo, // Incluir estructura completa
      tiempoProcesamiento: azureResponse.tiempoProcesamiento,
      porcentajeCompletitud: azureResponse.porcentajeCompletitud
    };
  }

  /**
   * 🔧 Valida configuración del servicio
   */
  validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!this.baseURL) {
      errors.push('VITE_API_URL no está configurado');
    }
    
    if (!this.getAuthToken()) {
      errors.push('Token de autenticación no encontrado');
    }
    
    return {
      isValid: errors.length === 0,
      errors
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
}

// ✅ EXPORTAR SERVICIO SINGLETON
export const azureDocumentService = new AzureDocumentService();
export { AzureDocumentService };