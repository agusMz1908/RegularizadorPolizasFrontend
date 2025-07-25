import { apiClient } from './ApiClient';
import { ENDPOINTS } from '../utils/constants';
import type { 
  AzureProcessResponse, 
  DatosVelneo, 
  DatosClienteExtraidos,
  AzureDocumentUtils,
  ValidationResult,
  AzureDocumentValidator
} from '../utils/azure-document';

// ✅ TIPOS ADICIONALES PARA EL SERVICIO
export interface AzureBatchResponse {
  archivos: AzureProcessResponse[];
  totalProcesados: number;
  exitosos: number;
  fallidos: number;
  tiempoTotal: number;
  resumen: string;
}

export interface ClientSearchResult {
  encontrado: boolean;
  cliente?: {
    id: number;
    nombre: string;
    documento: string;
    email?: string;
    telefono?: string;
    direccion?: string;
  };
  confianza: number;
  mensaje: string;
}

class AzureDocumentService {
  private readonly endpoint = ENDPOINTS.AZURE_PROCESS; // '/azuredocument/process'

  /**
   * Procesa un documento PDF con Azure Document Intelligence
   */
  async processDocument(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<AzureProcessResponse> {
    
    console.log('📄 AzureDocumentService: Procesando documento:', file.name);
    
    // ✅ Validaciones del archivo
    this.validateFile(file);

    try {
      onProgress?.(10);
      console.log('🔄 Enviando archivo al backend...');

      // ✅ Enviar archivo al backend
      const response = await apiClient.uploadFile<AzureProcessResponse>(
        this.endpoint,
        file
      );

      onProgress?.(70);

      if (!response.success) {
        throw new Error(response.error || 'Error procesando documento en el servidor');
      }

      const azureResponse = response.data!;
      
      console.log('📊 Respuesta del backend:', azureResponse);

      // ✅ Validar estructura de la respuesta
      this.validateResponse(azureResponse);

      onProgress?.(90);

      // ✅ Validar y enriquecer datos
      const datosValidados = this.enrichResponseData(azureResponse);

      onProgress?.(100);

      console.log('✅ Documento procesado exitosamente');
      console.log('📋 Resumen:', this.generateProcessingSummary(datosValidados));
      
      return datosValidados;

    } catch (error: any) {
      console.error('❌ Error procesando documento:', error);
      onProgress?.(0);
      
      // ✅ Manejar diferentes tipos de errores
      throw this.handleProcessingError(error);
    }
  }

  /**
   * Procesa múltiples documentos en lote
   */
  async processBatchDocuments(
    files: File[],
    onProgress?: (progress: number) => void
  ): Promise<AzureBatchResponse> {
    
    console.log('📄 Procesando lote de', files.length, 'documentos');
    
    const results: AzureProcessResponse[] = [];
    const errors: { file: string; error: string }[] = [];
    let exitosos = 0;
    let fallidos = 0;
    const startTime = Date.now();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileProgress = (i / files.length) * 100;
      
      try {
        console.log(`📄 Procesando archivo ${i + 1}/${files.length}: ${file.name}`);
        onProgress?.(fileProgress);
        
        const result = await this.processDocument(file, (progress) => {
          const totalProgress = fileProgress + (progress / files.length);
          onProgress?.(Math.min(totalProgress, 95));
        });
        
        results.push(result);
        exitosos++;
        
        console.log(`✅ Archivo ${file.name} procesado exitosamente`);
        
      } catch (error: any) {
        console.error(`❌ Error procesando ${file.name}:`, error);
        errors.push({
          file: file.name,
          error: error.message || 'Error desconocido'
        });
        fallidos++;
      }
    }

    onProgress?.(100);
    
    const tiempoTotal = Date.now() - startTime;
    const resumen = this.generateBatchSummary(exitosos, fallidos, tiempoTotal, errors);

    const batchResponse: AzureBatchResponse = {
      archivos: results,
      totalProcesados: files.length,
      exitosos,
      fallidos,
      tiempoTotal,
      resumen
    };

    console.log('📊 Lote procesado:', resumen);
    return batchResponse;
  }

  /**
   * Busca cliente basado en datos extraídos
   */
  async searchClient(datosCliente: DatosClienteExtraidos): Promise<ClientSearchResult> {
    console.log('🔍 Buscando cliente con datos:', datosCliente);
    
    try {
      // ✅ Preparar datos de búsqueda
      const searchData = this.prepareClientSearchData(datosCliente);
      
      if (!searchData.hasValidData) {
        return {
          encontrado: false,
          confianza: 0,
          mensaje: 'Datos insuficientes para la búsqueda'
        };
      }

      // ✅ Realizar búsqueda en el backend
      const response = await apiClient.post<any>('/clientes/search-auto', searchData.data);
      
      if (!response.success) {
        throw new Error(response.error || 'Error buscando cliente');
      }
      
      const searchResult = response.data;
      
      console.log('🎯 Resultado de búsqueda:', searchResult);
      
      return {
        encontrado: searchResult.encontrado || false,
        cliente: searchResult.cliente,
        confianza: searchResult.confianza || 0,
        mensaje: searchResult.mensaje || 'Búsqueda completada'
      };
      
    } catch (error: any) {
      console.error('❌ Error buscando cliente:', error);
      return {
        encontrado: false,
        confianza: 0,
        mensaje: `Error en búsqueda: ${error.message}`
      };
    }
  }

  // ================================
  // 🔧 MÉTODOS PRIVADOS DE UTILIDAD
  // ================================

  private validateFile(file: File): void {
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
  }

  private validateResponse(response: AzureProcessResponse): void {
    if (!response.datosVelneo) {
      throw new Error('El backend no devolvió la estructura esperada (datosVelneo)');
    }

    if (!response.datosVelneo.datosPoliza?.numeroPoliza) {
      console.warn('⚠️ Respuesta sin número de póliza, puede requerir verificación manual');
    }

    if (response.porcentajeCompletitud < 30) {
      console.warn('⚠️ Baja completitud de datos:', response.porcentajeCompletitud + '%');
    }
  }

  private enrichResponseData(response: AzureProcessResponse): AzureProcessResponse {
    // ✅ Enriquecer datos calculados
    const datosVelneo = response.datosVelneo;
    
    // Calcular completitud si no está presente
    if (!datosVelneo.porcentajeCompletitud) {
      datosVelneo.porcentajeCompletitud = this.calculateCompleteness(datosVelneo);
    }

    // Validar datos mínimos
    datosVelneo.tieneDatosMinimos = this.hasMinimumData(datosVelneo);

    // Normalizar fechas
    if (datosVelneo.datosPoliza) {
      if (datosVelneo.datosPoliza.desde) {
        datosVelneo.datosPoliza.desde = this.normalizeDate(datosVelneo.datosPoliza.desde);
      }
      if (datosVelneo.datosPoliza.hasta) {
        datosVelneo.datosPoliza.hasta = this.normalizeDate(datosVelneo.datosPoliza.hasta);
      }
    }

    return response;
  }

  private calculateCompleteness(datos: DatosVelneo): number {
    const camposEsenciales = [
      datos.datosPoliza?.numeroPoliza,
      datos.datosBasicos?.asegurado,
      datos.datosBasicos?.documento,
      datos.datosVehiculo?.marca,
      datos.condicionesPago?.premio
    ];
    
    const camposCompletos = camposEsenciales.filter(campo => 
      campo && campo.toString().trim() !== ''
    ).length;
    
    return Math.round((camposCompletos / camposEsenciales.length) * 100);
  }

  private hasMinimumData(datos: DatosVelneo): boolean {
    return !!(
      datos.datosPoliza?.numeroPoliza &&
      datos.datosBasicos?.asegurado &&
      datos.datosBasicos?.documento
    );
  }

  private normalizeDate(fecha: string): string {
    if (!fecha) return '';
    
    try {
      if (fecha.includes('T') || /^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        return fecha.split('T')[0];
      }

      const fechaLimpia = fecha.trim().replace(/[^\d\/\-\.]/g, '');
      const match = fechaLimpia.match(/^(\d{1,2})(\d{1,2})(\d{4})$/);
      
      if (match) {
        const dia = parseInt(match[1]);
        const mes = parseInt(match[2]);
        const anio = parseInt(match[3]);
        
        if (dia >= 1 && dia <= 31 && mes >= 1 && mes <= 12) {
          const fechaObj = new Date(anio, mes - 1, dia);
          return fechaObj.toISOString().split('T')[0];
        }
      }
      
      return fecha; // Retornar original si no se puede convertir
    } catch (error) {
      console.error('Error normalizando fecha:', fecha, error);
      return fecha;
    }
  }

  private prepareClientSearchData(datos: DatosClienteExtraidos): {
    hasValidData: boolean;
    data: any;
  } {
    const searchFields = {
      nombre: datos.nombre?.trim(),
      documento: datos.documento?.trim(),
      email: datos.email?.trim(),
      telefono: datos.telefono?.trim()
    };

    const hasValidData = !!(
      searchFields.nombre || 
      searchFields.documento || 
      searchFields.email
    );

    return {
      hasValidData,
      data: searchFields
    };
  }

  private generateProcessingSummary(response: AzureProcessResponse): string {
    const elementos = [];
    
    if (response.porcentajeCompletitud) {
      elementos.push(`${response.porcentajeCompletitud}% completitud`);
    }
    
    if (response.datosVelneo?.datosPoliza?.numeroPoliza) {
      elementos.push(`Póliza: ${response.datosVelneo.datosPoliza.numeroPoliza}`);
    }
    
    if (response.datosVelneo?.datosBasicos?.asegurado) {
      elementos.push(`Asegurado: ${response.datosVelneo.datosBasicos.asegurado}`);
    }
    
    if (!response.datosVelneo?.tieneDatosMinimos) {
      elementos.push('REQUIERE VERIFICACIÓN');
    }
    
    return elementos.join(' • ');
  }

  private generateBatchSummary(
    exitosos: number, 
    fallidos: number, 
    tiempoTotal: number, 
    errors: { file: string; error: string }[]
  ): string {
    const total = exitosos + fallidos;
    const tiempoMinutos = Math.round(tiempoTotal / 1000 / 60 * 100) / 100;
    
    let resumen = `Procesados ${total} archivos en ${tiempoMinutos}min: `;
    resumen += `${exitosos} exitosos, ${fallidos} fallidos`;
    
    if (errors.length > 0) {
      resumen += `. Errores: ${errors.map(e => e.file).join(', ')}`;
    }
    
    return resumen;
  }

  private handleProcessingError(error: any): Error {
    if (error.name === 'AbortError') {
      return new Error('El procesamiento tardó demasiado. Intenta con un archivo más pequeño.');
    }
    
    if (error.response?.status === 413) {
      return new Error('El archivo es demasiado grande para procesar');
    }
    
    if (error.response?.status === 400) {
      return new Error('El archivo no es válido o está corrupto');
    }
    
    if (error.response?.status === 500) {
      return new Error('Error interno del servidor. Intenta nuevamente.');
    }
    
    if (error.message?.includes('Network')) {
      return new Error('Error de conexión. Verifica tu internet.');
    }
    
    return new Error(error.message || 'Error desconocido al procesar el documento');
  }
}

// ✅ EXPORTAR INSTANCIA SINGLETON
export const azureDocumentService = new AzureDocumentService();
