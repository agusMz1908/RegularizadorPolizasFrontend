// src/services/azureService.ts
// ✅ VERSIÓN COMPLETA - Procesamiento Asíncrono con Polling

import { apiClient } from './ApiClient';
import { ENDPOINTS } from '../utils/constants';
import type { DocumentProcessResult } from '../types/ui/wizard';

// ============================================================================
// 🔄 INTERFACES PARA PROCESAMIENTO ASÍNCRONO
// ============================================================================

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

export interface AsyncInitResponse {
  documentId: string;
  status: 'PENDING' | 'QUEUED' | 'PROCESSING';
  estimatedTime: number; // en segundos
  queuePosition?: number;
  message: string;
}

export interface ProcessingStatusResponse {
  documentId: string;
  status: 'PENDING' | 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'ERROR';
  progress: number; // 0-100
  stage: string;
  substage?: string;
  result?: AzureProcessResponse;
  error?: string;
  estimatedTimeRemaining?: number;
  queuePosition?: number;
  startedAt?: string;
  completedAt?: string;
}

export interface ProcessingMode {
  mode: 'sync' | 'async';
  reason: string;
  estimatedTime: number;
  maxTimeout: number;
}

// ============================================================================
// 🎯 AZURE SERVICE CON PROCESAMIENTO HÍBRIDO
// ============================================================================

class AzureService {
  private readonly endpoint = ENDPOINTS.AZURE_PROCESS;
  private readonly asyncEndpoint = `${ENDPOINTS.AZURE_PROCESS}/async`;
  private readonly statusEndpoint = `${ENDPOINTS.AZURE_PROCESS}/status`;
  
  // Configuración de timeouts y umbrales
  private readonly SYNC_FILE_LIMIT_MB = 5;
  private readonly SYNC_TIMEOUT_BASE = 120000; // 2 minutos base
  private readonly SYNC_TIMEOUT_PER_MB = 30000; // 30s por MB
  private readonly SYNC_TIMEOUT_MAX = 300000; // 5 minutos máximo
  
  private readonly ASYNC_INIT_TIMEOUT = 120000; // 2 minutos para iniciar async
  private readonly POLL_INTERVAL = 5000; // 5 segundos entre polls
  private readonly MAX_POLL_ATTEMPTS = 120; // 10 minutos de polling máximo

  /**
   * ✅ MÉTODO PRINCIPAL - Decide automáticamente el modo de procesamiento
   */
  async processDocument(
file: File, token: string, onProgress?: (progress: number, status: string, mode?: 'sync' | 'async') => void  ): Promise<DocumentProcessResult> {
    
    console.log('📄 AzureService: Iniciando procesamiento inteligente:', {
      fileName: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      fileType: file.type
    });

    // ✅ Validaciones iniciales
    this.validateFile(file);

    // ✅ Determinar modo de procesamiento
    const mode = this.determineProcessingMode(file);
    
    console.log(`🎯 Modo seleccionado: ${mode.mode.toUpperCase()}`, {
      reason: mode.reason,
      estimatedTime: `${mode.estimatedTime}s`,
      maxTimeout: `${mode.maxTimeout / 1000}s`
    });

    onProgress?.(5, `Iniciando procesamiento ${mode.mode}...`, mode.mode);

    try {
      if (mode.mode === 'sync') {
        return await this.processDocumentSync(file, onProgress);
      } else {
        return await this.processDocumentAsync(file, onProgress);
      }
    } catch (error: any) {
      console.error(`❌ Error en procesamiento ${mode.mode}:`, error);
      
      // ✅ Si el modo sincrónico falla por timeout, intentar asíncrono
      if (mode.mode === 'sync' && this.isTimeoutError(error)) {
        console.log('🔄 Timeout en modo sincrónico, reintentando con modo asíncrono...');
        onProgress?.(10, 'Cambiando a modo asíncrono...', 'async');
        
        try {
          return await this.processDocumentAsync(file, onProgress);
        } catch (asyncError: any) {
          throw new Error(`Falló tanto sincrónico como asíncrono: ${asyncError.message}`);
        }
      }
      
      throw this.handleProcessingError(error);
    }
  }

  /**
   * ✅ DETERMINAR MODO DE PROCESAMIENTO
   */
  private determineProcessingMode(file: File): ProcessingMode {
    const fileSizeMB = file.size / (1024 * 1024);
    
    // Factores para determinar el modo
    const isLargeFile = fileSizeMB > this.SYNC_FILE_LIMIT_MB;
    const isPDF = file.type === 'application/pdf';
    const estimatedComplexity = this.estimateDocumentComplexity(file);
    
    // Cálculos de tiempo
    const syncEstimatedTime = Math.min(
      60 + (fileSizeMB * 30), // 60s base + 30s por MB
      300 // máximo 5 minutos
    );
    
    const asyncEstimatedTime = 120 + (fileSizeMB * 45); // 2 min base + 45s por MB
    
    if (isLargeFile || estimatedComplexity === 'high') {
      return {
        mode: 'async',
        reason: isLargeFile 
          ? `Archivo grande (${fileSizeMB.toFixed(2)}MB > ${this.SYNC_FILE_LIMIT_MB}MB)`
          : 'Documento complejo detectado',
        estimatedTime: asyncEstimatedTime,
        maxTimeout: this.ASYNC_INIT_TIMEOUT + (this.MAX_POLL_ATTEMPTS * this.POLL_INTERVAL)
      };
    }
    
    return {
      mode: 'sync',
      reason: `Archivo pequeño (${fileSizeMB.toFixed(2)}MB) - procesamiento directo`,
      estimatedTime: syncEstimatedTime,
      maxTimeout: this.calculateSyncTimeout(fileSizeMB)
    };
  }

  /**
   * ✅ PROCESAMIENTO SINCRÓNICO MEJORADO
   */
  private async processDocumentSync(
    file: File,
    onProgress?: (progress: number, status: string, mode?: 'sync' | 'async') => void
  ): Promise<DocumentProcessResult> {
    
    const fileSizeMB = file.size / (1024 * 1024);
    const timeout = this.calculateSyncTimeout(fileSizeMB);
    
    console.log(`🔄 Procesamiento sincrónico - Timeout: ${timeout/1000}s`);
    
    try {
      onProgress?.(15, 'Enviando documento al servidor...', 'sync');

      const response = await apiClient.uploadFileWithExtendedTimeout<AzureProcessResponse>(
        this.endpoint,
        file,
        timeout
      );

      onProgress?.(70, 'Procesando con Azure AI...', 'sync');

      if (!response.success) {
        if (response.status === 408) {
          throw new Error('TIMEOUT_SYNC');
        }
        throw new Error(response.error || 'Error procesando documento');
      }

      const azureResponse = response.data!;
      
      onProgress?.(90, 'Validando resultados...', 'sync');
      
      const processedResult = this.mapToWizardFormat(azureResponse, file.name);
      
      onProgress?.(100, 'Procesamiento completado', 'sync');

      console.log('✅ Procesamiento sincrónico exitoso');
      return processedResult;

    } catch (error: any) {
      console.error('❌ Error en procesamiento sincrónico:', error);
      onProgress?.(0, 'Error en procesamiento sincrónico', 'sync');
      throw error;
    }
  }

  /**
   * ✅ PROCESAMIENTO ASÍNCRONO CON POLLING
   */
  private async processDocumentAsync(
    file: File,
    onProgress?: (progress: number, status: string, mode?: 'sync' | 'async') => void
  ): Promise<DocumentProcessResult> {
    
    console.log('🚀 Iniciando procesamiento asíncrono');
    
    try {
      // ✅ PASO 1: Iniciar procesamiento asíncrono
      onProgress?.(10, 'Enviando documento para procesamiento asíncrono...', 'async');
      
      const initResponse = await apiClient.uploadFileWithExtendedTimeout<AsyncInitResponse>(
        this.asyncEndpoint,
        file,
        this.ASYNC_INIT_TIMEOUT
      );

      if (!initResponse.success) {
        throw new Error(initResponse.error || 'Error iniciando procesamiento asíncrono');
      }

      const { documentId, estimatedTime, queuePosition, message } = initResponse.data!;
      
      console.log(`📋 Procesamiento asíncrono iniciado:`, {
        documentId,
        estimatedTime: `${estimatedTime}s`,
        queuePosition,
        message
      });
      
      let statusMessage = message;
      if (queuePosition && queuePosition > 0) {
        statusMessage += ` (Posición en cola: ${queuePosition})`;
      }
      
      onProgress?.(15, statusMessage, 'async');
      
      // ✅ PASO 2: Polling del estado
      return await this.pollProcessingStatus(
        documentId, 
        estimatedTime,
        onProgress
      );

    } catch (error: any) {
      console.error('❌ Error en procesamiento asíncrono:', error);
      throw this.handleProcessingError(error);
    }
  }

  /**
   * ✅ POLLING INTELIGENTE DEL ESTADO
   */
  private async pollProcessingStatus(
    documentId: string,
    estimatedTime: number,
    onProgress?: (progress: number, status: string, mode?: 'sync' | 'async') => void
  ): Promise<DocumentProcessResult> {
    
    // Calcular parámetros de polling dinámicos
    const baseAttempts = Math.ceil(estimatedTime / (this.POLL_INTERVAL / 1000));
    const maxAttempts = Math.min(Math.max(baseAttempts, 24), this.MAX_POLL_ATTEMPTS); // Entre 2 min y 10 min
    
    let attempts = 0;
    let consecutiveErrors = 0;
    let lastProgress = 15; // Empezamos desde donde quedó el upload
    
    console.log(`🔄 Iniciando polling:`, {
      documentId,
      maxAttempts,
      pollInterval: `${this.POLL_INTERVAL/1000}s`,
      estimatedTime: `${estimatedTime}s`
    });

    while (attempts < maxAttempts) {
      attempts++;
      
      try {
        // ✅ Consultar estado
        const statusResponse = await apiClient.get<ProcessingStatusResponse>(
          `${this.statusEndpoint}/${documentId}`,
          10000 // Timeout corto para el polling
        );

        if (!statusResponse.success) {
          consecutiveErrors++;
          console.warn(`⚠️ Error consultando estado (${attempts}/${maxAttempts}):`, statusResponse.error);
          
          // Si hay muchos errores consecutivos, fallar
          if (consecutiveErrors >= 5) {
            throw new Error(`Demasiados errores consultando estado: ${statusResponse.error}`);
          }
          
          await this.delay(this.POLL_INTERVAL * 2); // Esperar más tiempo
          continue;
        }

        // Reset contador de errores
        consecutiveErrors = 0;
        
        const { 
          status, 
          progress, 
          stage, 
          substage, 
          result, 
          error, 
          estimatedTimeRemaining,
          queuePosition 
        } = statusResponse.data!;
        
        // ✅ Calcular progreso suavizado
        const smoothProgress = Math.max(
          lastProgress, 
          Math.min(15 + (progress * 0.8), 95) // Entre 15% y 95%
        );
        lastProgress = smoothProgress;
        
        // ✅ Crear mensaje de estado detallado
        let statusMessage = stage;
        if (substage) statusMessage += ` - ${substage}`;
        if (queuePosition && queuePosition > 0) statusMessage += ` (Cola: ${queuePosition})`;
        if (estimatedTimeRemaining) statusMessage += ` (~${Math.ceil(estimatedTimeRemaining/60)}min restantes)`;
        
        console.log(`📊 Estado (${attempts}/${maxAttempts}):`, {
          status,
          progress: `${progress}%`,
          smoothProgress: `${smoothProgress.toFixed(1)}%`,
          stage,
          substage,
          queuePosition,
          estimatedTimeRemaining: estimatedTimeRemaining ? `${estimatedTimeRemaining}s` : undefined
        });

        // ✅ Reportar progreso
        onProgress?.(smoothProgress, statusMessage, 'async');

        // ✅ Verificar estados finales
        switch (status) {
          case 'COMPLETED':
            if (result) {
              onProgress?.(100, 'Procesamiento completado exitosamente', 'async');
              console.log('✅ Procesamiento asíncrono completado');
              return this.mapToWizardFormat(result, documentId);
            }
            throw new Error('Procesamiento completado pero sin resultado');

          case 'ERROR':
            throw new Error(error || 'Error en el procesamiento del documento');

          case 'PROCESSING':
          case 'PENDING':
          case 'QUEUED':
            // Continuar polling
            break;

          default:
            console.warn(`⚠️ Estado desconocido: ${status}`);
        }

        // ✅ Delay adaptativo basado en el progreso
        const delay = progress < 10 ? this.POLL_INTERVAL * 2 : // Más lento al inicio
                     progress > 80 ? this.POLL_INTERVAL / 2 : // Más rápido cerca del final
                     this.POLL_INTERVAL;
        
        await this.delay(delay);

      } catch (error: any) {
        consecutiveErrors++;
        console.error(`❌ Error en polling (${attempts}/${maxAttempts}):`, error);
        
        // Si es el último intento o muchos errores, fallar
        if (attempts >= maxAttempts || consecutiveErrors >= 5) {
          const timeElapsed = (attempts * this.POLL_INTERVAL) / 1000;
          throw new Error(
            `Timeout o errores después de ${attempts} intentos (${timeElapsed}s). ` +
            `El documento puede seguir procesándose en segundo plano.`
          );
        }
        
        // Delay progresivo en caso de errores
        await this.delay(this.POLL_INTERVAL * Math.min(consecutiveErrors, 4));
      }
    }

    // Timeout final
    const totalTime = (maxAttempts * this.POLL_INTERVAL) / 1000;
    throw new Error(
      `Timeout después de ${maxAttempts} intentos (${totalTime}s). ` +
      `El procesamiento puede continuar en segundo plano.`
    );
  }

  /**
   * ✅ HELPERS Y UTILIDADES
   */
  
  private calculateSyncTimeout(fileSizeMB: number): number {
    return Math.min(
      this.SYNC_TIMEOUT_BASE + (fileSizeMB * this.SYNC_TIMEOUT_PER_MB),
      this.SYNC_TIMEOUT_MAX
    );
  }

  private estimateDocumentComplexity(file: File): 'low' | 'medium' | 'high' {
    const fileSizeMB = file.size / (1024 * 1024);
    
    // Heurísticas simples para complejidad
    if (fileSizeMB > 10) return 'high';
    if (fileSizeMB > 3) return 'medium';
    return 'low';
  }

  private isTimeoutError(error: any): boolean {
    return error.name === 'TimeoutError' || 
           error.message.includes('timeout') || 
           error.message.includes('TIMEOUT_SYNC') ||
           error.message.includes('timed out');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private validateFile(file: File): void {
    if (!file || file.size === 0) {
      throw new Error('Archivo inválido o vacío');
    }

    const maxSize = 50 * 1024 * 1024; // 50MB máximo para async
    if (file.size > maxSize) {
      throw new Error(
        `Archivo demasiado grande (${(file.size / 1024 / 1024).toFixed(2)}MB). ` +
        `Máximo permitido: ${maxSize / 1024 / 1024}MB.`
      );
    }

    if (file.type !== 'application/pdf') {
      throw new Error(`Tipo de archivo no válido: ${file.type}. Solo se permiten archivos PDF.`);
    }
  }

  private mapToWizardFormat(
    azureResponse: AzureProcessResponse, 
    fileName: string
  ): DocumentProcessResult {
    return {
      documentId: `azure-${Date.now()}`,
      nombreArchivo: fileName,
      estadoProcesamiento: azureResponse.estado || 'completed',
      timestamp: azureResponse.timestamp || new Date().toISOString(),
      tiempoProcesamiento: azureResponse.tiempoProcesamiento || 0,
      readyForVelneo: azureResponse.listoParaVelneo || false,
      porcentajeCompletitud: azureResponse.porcentajeCompletitud || 100,
      
      // Mapear datos extraídos
      extractedFields: azureResponse.datosVelneo?.extractedFields || [],
      
      // Campos comunes de pólizas
      numeroPoliza: azureResponse.datosVelneo?.numeroPoliza,
      asegurado: azureResponse.datosVelneo?.asegurado,
      vigenciaDesde: azureResponse.datosVelneo?.vigenciaDesde,
      vigenciaHasta: azureResponse.datosVelneo?.vigenciaHasta,
      prima: azureResponse.datosVelneo?.prima,
      documento: azureResponse.datosVelneo?.documento,
      email: azureResponse.datosVelneo?.email,
      telefono: azureResponse.datosVelneo?.telefono,
      direccion: azureResponse.datosVelneo?.direccion,
      marca: azureResponse.datosVelneo?.marca,
      modelo: azureResponse.datosVelneo?.modelo,
      matricula: azureResponse.datosVelneo?.matricula,
      motor: azureResponse.datosVelneo?.motor,
      chasis: azureResponse.datosVelneo?.chasis,
      moneda: azureResponse.datosVelneo?.moneda,
      
      // Metadatos adicionales
      datosVelneo: azureResponse.datosVelneo,
      originalResponse: azureResponse
    };
  }

  private handleProcessingError(error: any): Error {
    if (error.name === 'AbortError') {
      return new Error('El procesamiento fue cancelado');
    }
    
    if (this.isTimeoutError(error)) {
      return new Error(
        'El procesamiento tardó más de lo esperado. ' +
        'Esto puede ocurrir con documentos complejos. ' +
        'El proceso puede continuar en segundo plano.'
      );
    }
    
    if (error.message?.includes('quota') || error.message?.includes('limit')) {
      return new Error('Límite de procesamiento alcanzado. Intenta nuevamente en unos minutos.');
    }
    
    return new Error(error.message || 'Error desconocido en el procesamiento');
  }
}

export const azureService = new AzureService();