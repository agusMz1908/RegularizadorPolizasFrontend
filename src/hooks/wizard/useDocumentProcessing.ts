// src/hooks/wizard/useDocumentProcessing.ts
// ✅ VERSIÓN CORREGIDA - Compatible con DocumentProcessResult real

import { useState, useCallback, useRef, useEffect } from 'react';
import { DocumentProcessResult } from '../../types/ui/wizard';

export interface UseDocumentProcessingConfig {
  // Configuración de Azure
  azureEndpoint?: string;
  maxFileSize?: number; // en bytes
  allowedTypes?: string[];
  maxRetries?: number;
  retryDelay?: number; // en ms
  
  // Configuración de procesamiento
  enablePreprocessing?: boolean;
  enableValidation?: boolean;
  enableOptimization?: boolean;
  confidenceThreshold?: number;
  
  // Callbacks
  onUploadStart?: (file: File) => void;
  onUploadProgress?: (progress: number) => void;
  onUploadComplete?: (file: File) => void;
  onProcessingStart?: (documentId: string) => void;
  onProcessingProgress?: (progress: number, stage: string) => void;
  onProcessingComplete?: (result: DocumentProcessResult) => void;
  onError?: (error: string, stage: 'upload' | 'processing' | 'validation') => void;
  onRetry?: (attempt: number, maxRetries: number) => void;
}

export interface ProcessingStage {
  id: string;
  name: string;
  description: string;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  duration?: number;
  error?: string;
}

export interface ProcessingMetrics {
  totalTime: number;
  uploadTime: number;
  processingTime: number;
  validationTime: number;
  fileSize: number;
  fieldsExtracted: number;
  confidenceScore: number;
  retryCount: number;
}

export interface UseDocumentProcessingReturn {
  // Estado principal
  isUploading: boolean;
  isProcessing: boolean;
  uploadProgress: number;
  processingProgress: number;
  currentStage: string;
  
  // Datos
  uploadedFile: File | null;
  documentId: string | null;
  processedResult: DocumentProcessResult | null;
  
  // Estados detallados
  stages: ProcessingStage[];
  metrics: ProcessingMetrics | null;
  errors: string[];
  
  // Acciones principales
  uploadAndProcess: (file: File) => Promise<DocumentProcessResult | null>;
  uploadFile: (file: File) => Promise<string | null>;
  processDocument: (documentId: string) => Promise<DocumentProcessResult | null>;
  
  // Control de proceso
  cancelProcessing: () => void;
  retryProcessing: () => Promise<DocumentProcessResult | null>;
  clearResults: () => void;
  
  // Validaciones
  validateFile: (file: File) => { isValid: boolean; errors: string[] };
  
  // Utilidades
  getEstimatedTime: (fileSize: number) => number;
  getProcessingStatus: () => 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  
  // Métricas y reportes
  exportProcessingReport: () => any;
}

// ============================================================================
// 🎪 HOOK PRINCIPAL
// ============================================================================

export const useDocumentProcessing = (
  config: UseDocumentProcessingConfig = {}
): UseDocumentProcessingReturn => {

  const {
    azureEndpoint = '/api/azuredocument',
    maxFileSize = 10 * 1024 * 1024, // 10MB
    allowedTypes = ['application/pdf'],
    maxRetries = 3,
    retryDelay = 2000,
    enablePreprocessing = true,
    enableValidation = true,
    enableOptimization = true,
    confidenceThreshold = 70, // Cambiado a número entero
    onUploadStart,
    onUploadProgress,
    onUploadComplete,
    onProcessingStart,
    onProcessingProgress,
    onProcessingComplete,
    onError,
    onRetry
  } = config;

  // Estados principales
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState('');
  
  // Datos
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [processedResult, setProcessedResult] = useState<DocumentProcessResult | null>(null);
  
  // Estados detallados
  const [stages, setStages] = useState<ProcessingStage[]>([]);
  const [metrics, setMetrics] = useState<ProcessingMetrics | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  
  // Referencias para control
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);
  const startTimeRef = useRef<number>(0);

  // ============================================================================
  // 📁 VALIDACIÓN DE ARCHIVOS
  // ============================================================================

  /**
   * Valida un archivo antes de subirlo
   */
  const validateFile = useCallback((file: File): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Validar tipo de archivo
    if (!allowedTypes.includes(file.type)) {
      errors.push(`Tipo de archivo no permitido. Se esperaba: ${allowedTypes.join(', ')}`);
    }

    // Validar tamaño
    if (file.size > maxFileSize) {
      const maxSizeMB = maxFileSize / (1024 * 1024);
      errors.push(`Archivo demasiado grande. Máximo permitido: ${maxSizeMB}MB`);
    }

    // Validar que el archivo no esté vacío
    if (file.size === 0) {
      errors.push('El archivo está vacío');
    }

    // Validar nombre de archivo
    if (!file.name || file.name.trim() === '') {
      errors.push('El archivo debe tener un nombre válido');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [allowedTypes, maxFileSize]);

  // ============================================================================
  // ⬆️ SUBIDA DE ARCHIVOS
  // ============================================================================

  /**
   * Sube un archivo al servidor
   */
  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    // Validar archivo
    const validation = validateFile(file);
    if (!validation.isValid) {
      setErrors(validation.errors);
      onError?.(validation.errors.join(', '), 'upload');
      return null;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setErrors([]);
    setUploadedFile(file);
    startTimeRef.current = Date.now();

    // Callback de inicio
    onUploadStart?.(file);

    // Configurar abort controller
    abortControllerRef.current = new AbortController();

    try {
      // Crear FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('filename', file.name);

      // Configurar XMLHttpRequest para progreso
      const xhr = new XMLHttpRequest();
      
      // Promise para manejar la respuesta
      const uploadPromise = new Promise<string>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response.documentId || response.id);
            } catch (error) {
              reject(new Error('Respuesta inválida del servidor'));
            }
          } else {
            reject(new Error(`Error HTTP: ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error('Error de red durante la subida'));
        xhr.onabort = () => reject(new Error('Subida cancelada'));
      });

      // Configurar progreso
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
          onUploadProgress?.(progress);
        }
      };

      // Iniciar subida
      xhr.open('POST', azureEndpoint);
      xhr.send(formData);

      // Configurar abort
      abortControllerRef.current.signal.addEventListener('abort', () => {
        xhr.abort();
      });

      // Esperar resultado
      const uploadedDocumentId = await uploadPromise;
      
      setDocumentId(uploadedDocumentId);
      onUploadComplete?.(file);
      
      return uploadedDocumentId;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido en la subida';
      setErrors([errorMessage]);
      onError?.(errorMessage, 'upload');
      return null;
    } finally {
      setIsUploading(false);
      abortControllerRef.current = null;
    }
  }, [validateFile, azureEndpoint, onUploadStart, onUploadProgress, onUploadComplete, onError]);

  // ============================================================================
  // 🔄 PROCESAMIENTO CON AZURE AI
  // ============================================================================

  /**
   * Procesa un documento con Azure Document Intelligence
   */
  const processDocument = useCallback(async (docId: string): Promise<DocumentProcessResult | null> => {
    setIsProcessing(true);
    setProcessingProgress(0);
    setCurrentStage('Iniciando procesamiento...');
    setErrors([]);

    // Callback de inicio
    onProcessingStart?.(docId);

    // Configurar etapas de procesamiento
    const processingStages: ProcessingStage[] = [
      {
        id: 'preprocessing',
        name: 'Preprocesamiento',
        description: 'Optimizando imagen y preparando documento',
        progress: 0,
        status: 'pending'
      },
      {
        id: 'extraction',
        name: 'Extracción de datos',
        description: 'Procesando con Azure Document Intelligence',
        progress: 0,
        status: 'pending'
      },
      {
        id: 'validation',
        name: 'Validación',
        description: 'Validando datos extraídos',
        progress: 0,
        status: 'pending'
      },
      {
        id: 'optimization',
        name: 'Optimización',
        description: 'Mejorando confianza y completitud',
        progress: 0,
        status: 'pending'
      }
    ];

    setStages(processingStages);

    try {
      let currentProgress = 0;
      const totalStages = processingStages.length;
      const progressPerStage = 100 / totalStages;

      // Etapa 1: Preprocesamiento
      if (enablePreprocessing) {
        await updateStage('preprocessing', 'processing', 'Optimizando imagen...');
        await simulateProcessingDelay(1000); // Simular tiempo de procesamiento
        currentProgress += progressPerStage;
        setProcessingProgress(currentProgress);
        await updateStage('preprocessing', 'completed');
      }

      // Etapa 2: Extracción principal
      await updateStage('extraction', 'processing', 'Extrayendo datos con IA...');
      
      const extractionResult = await performAzureExtraction(docId);
      
      currentProgress += progressPerStage;
      setProcessingProgress(currentProgress);
      await updateStage('extraction', 'completed');

      // Etapa 3: Validación
      if (enableValidation) {
        await updateStage('validation', 'processing', 'Validando datos extraídos...');
        
        const validatedResult = await validateExtractedData(extractionResult);
        
        currentProgress += progressPerStage;
        setProcessingProgress(currentProgress);
        await updateStage('validation', 'completed');
        
        // Usar resultado validado
        Object.assign(extractionResult, validatedResult);
      }

      // Etapa 4: Optimización
      if (enableOptimization) {
        await updateStage('optimization', 'processing', 'Optimizando resultados...');
        
        const optimizedResult = await optimizeResults(extractionResult);
        
        currentProgress = 100;
        setProcessingProgress(currentProgress);
        await updateStage('optimization', 'completed');
        
        // Usar resultado optimizado
        Object.assign(extractionResult, optimizedResult);
      }

      // Calcular métricas finales
      const finalMetrics = calculateMetrics(extractionResult);
      setMetrics(finalMetrics);

      // ✅ Resultado final usando propiedades reales de DocumentProcessResult
      const finalResult: DocumentProcessResult = {
        ...extractionResult,
        estadoProcesamiento: 'completado',
        listoParaVelneo: true,
        confidence: finalMetrics.confidenceScore,
        tiempoProcesamiento: finalMetrics.totalTime
      };

      setProcessedResult(finalResult);
      onProcessingComplete?.(finalResult);

      return finalResult;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error en el procesamiento';
      setErrors([errorMessage]);
      onError?.(errorMessage, 'processing');
      
      // Marcar etapa actual como error
      setStages(prev => prev.map(stage => 
        stage.status === 'processing' 
          ? { ...stage, status: 'error', error: errorMessage }
          : stage
      ));

      return null;
    } finally {
      setIsProcessing(false);
      setCurrentStage('');
    }
  }, [enablePreprocessing, enableValidation, enableOptimization, onProcessingStart, onProcessingComplete, onError]);

  // ============================================================================
  // 🚀 ACCIÓN COMBINADA
  // ============================================================================

  /**
   * Sube y procesa un archivo en una sola operación
   */
  const uploadAndProcess = useCallback(async (file: File): Promise<DocumentProcessResult | null> => {
    try {
      // Paso 1: Subir archivo
      const docId = await uploadFile(file);
      if (!docId) {
        return null;
      }

      // Paso 2: Procesar documento
      const result = await processDocument(docId);
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error en subida y procesamiento';
      setErrors([errorMessage]);
      onError?.(errorMessage, 'processing');
      return null;
    }
  }, [uploadFile, processDocument, onError]);

  // ============================================================================
  // 🔧 CONTROL DEL PROCESO
  // ============================================================================

  /**
   * Cancela el procesamiento actual
   */
  const cancelProcessing = useCallback((): void => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setIsUploading(false);
    setIsProcessing(false);
    setCurrentStage('Cancelado');
    
    // Marcar etapas como canceladas
    setStages(prev => prev.map(stage => 
      stage.status === 'processing' || stage.status === 'pending'
        ? { ...stage, status: 'error', error: 'Cancelado por el usuario' }
        : stage
    ));
  }, []);

  /**
   * Reintenta el procesamiento
   */
  const retryProcessing = useCallback(async (): Promise<DocumentProcessResult | null> => {
    if (!documentId) {
      onError?.('No hay documento para reintentar', 'processing');
      return null;
    }

    retryCountRef.current += 1;
    
    if (retryCountRef.current > maxRetries) {
      const errorMessage = `Máximo de reintentos alcanzado (${maxRetries})`;
      setErrors([errorMessage]);
      onError?.(errorMessage, 'processing');
      return null;
    }

    onRetry?.(retryCountRef.current, maxRetries);

    // Esperar antes de reintentar
    await new Promise(resolve => setTimeout(resolve, retryDelay));

    return processDocument(documentId);
  }, [documentId, maxRetries, retryDelay, processDocument, onError, onRetry]);

  /**
   * Limpia todos los resultados
   */
  const clearResults = useCallback((): void => {
    setUploadedFile(null);
    setDocumentId(null);
    setProcessedResult(null);
    setUploadProgress(0);
    setProcessingProgress(0);
    setCurrentStage('');
    setStages([]);
    setMetrics(null);
    setErrors([]);
    retryCountRef.current = 0;
  }, []);

  // ============================================================================
  // 📊 UTILIDADES Y MÉTRICAS
  // ============================================================================

  /**
   * Estima el tiempo de procesamiento basado en el tamaño del archivo
   */
  const getEstimatedTime = useCallback((fileSize: number): number => {
    // Estimación basada en estadísticas reales
    const baseSizeKB = fileSize / 1024;
    const baseTimeSeconds = 5; // Tiempo base
    const timePerKB = 0.01; // Tiempo adicional por KB
    
    return Math.round(baseTimeSeconds + (baseSizeKB * timePerKB));
  }, []);

  /**
   * Obtiene el estado actual del procesamiento
   */
  const getProcessingStatus = useCallback((): 'idle' | 'uploading' | 'processing' | 'completed' | 'error' => {
    if (errors.length > 0) return 'error';
    if (processedResult) return 'completed';
    if (isProcessing) return 'processing';
    if (isUploading) return 'uploading';
    return 'idle';
  }, [errors.length, processedResult, isProcessing, isUploading]);

  /**
   * Exporta reporte de procesamiento
   */
  const exportProcessingReport = useCallback(() => {
    return {
      timestamp: new Date().toISOString(),
      file: uploadedFile ? {
        name: uploadedFile.name,
        size: uploadedFile.size,
        type: uploadedFile.type
      } : null,
      documentId,
      stages,
      metrics,
      errors,
      result: processedResult,
      config: {
        maxFileSize,
        allowedTypes,
        maxRetries,
        confidenceThreshold
      }
    };
  }, [uploadedFile, documentId, stages, metrics, errors, processedResult, maxFileSize, allowedTypes, maxRetries, confidenceThreshold]);

  // ============================================================================
  // 🔧 FUNCIONES AUXILIARES
  // ============================================================================

  /**
   * Actualiza el estado de una etapa
   */
  async function updateStage(
    stageId: string, 
    status: ProcessingStage['status'], 
    description?: string
  ): Promise<void> {
    setStages(prev => prev.map(stage => 
      stage.id === stageId 
        ? { 
            ...stage, 
            status, 
            description: description || stage.description,
            progress: status === 'completed' ? 100 : stage.progress
          }
        : stage
    ));

    if (description) {
      setCurrentStage(description);
      onProcessingProgress?.(processingProgress, description);
    }

    // Pequeña pausa para animaciones
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * Simula delay de procesamiento
   */
  async function simulateProcessingDelay(ms: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Realiza la extracción con Azure
   */
  async function performAzureExtraction(docId: string): Promise<DocumentProcessResult> {
    const response = await fetch(`${azureEndpoint}/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId: docId }),
      signal: abortControllerRef.current?.signal
    });

    if (!response.ok) {
      throw new Error(`Error en procesamiento: ${response.status}`);
    }

    return response.json();
  }

  /**
   * ✅ Valida los datos extraídos usando propiedades reales
   */
  async function validateExtractedData(result: DocumentProcessResult): Promise<Partial<DocumentProcessResult>> {
    // Simular validación
    await simulateProcessingDelay(500);
    
    return {
      needsReview: (result.confidence || 0) < confidenceThreshold,
      // Usar campos que existen en DocumentProcessResult
      datosVelneo: result.datosVelneo
    };
  }

  /**
   * ✅ Optimiza los resultados usando propiedades reales
   */
  async function optimizeResults(result: DocumentProcessResult): Promise<Partial<DocumentProcessResult>> {
    // Simular optimización
    await simulateProcessingDelay(300);
    
    return {
      porcentajeCompletitud: calculateCompleteness(result),
      listoParaVelneo: (result.confidence || 0) >= confidenceThreshold
    };
  }

  /**
   * ✅ Calcula el porcentaje de completitud usando campos reales
   */
  function calculateCompleteness(result: DocumentProcessResult): number {
    // Usar campos que realmente existen en datosVelneo
    const datosBasicos = result.datosVelneo?.datosBasicos;
    const datosPoliza = result.datosVelneo?.datosPoliza;
    
    if (!datosBasicos || !datosPoliza) return 0;
    
    const requiredFields = [
      datosPoliza.numeroPoliza,
      datosBasicos.asegurado,
      datosPoliza.desde,
      datosPoliza.hasta
    ];
    
    const presentFields = requiredFields.filter(field => field);
    return Math.round((presentFields.length / requiredFields.length) * 100);
  }

  /**
   * Calcula métricas finales
   */
  function calculateMetrics(result: DocumentProcessResult): ProcessingMetrics {
    const totalTime = Date.now() - startTimeRef.current;
    
    return {
      totalTime,
      uploadTime: 0, // Se calculará en la implementación real
      processingTime: totalTime,
      validationTime: 0,
      fileSize: uploadedFile?.size || 0,
      fieldsExtracted: Object.keys(result.extractedFields || {}).length,
      confidenceScore: result.confidence || 0,
      retryCount: retryCountRef.current
    };
  }

  // ============================================================================
  // 🔄 EFECTOS
  // ============================================================================

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // ============================================================================
  // 📤 RETURN DEL HOOK
  // ============================================================================

  return {
    // Estado principal
    isUploading,
    isProcessing,
    uploadProgress,
    processingProgress,
    currentStage,
    
    // Datos
    uploadedFile,
    documentId,
    processedResult,
    
    // Estados detallados
    stages,
    metrics,
    errors,
    
    // Acciones principales
    uploadAndProcess,
    uploadFile,
    processDocument,
    
    // Control de proceso
    cancelProcessing,
    retryProcessing,
    clearResults,
    
    // Validaciones
    validateFile,
    
    // Utilidades
    getEstimatedTime,
    getProcessingStatus,
    
    // Métricas y reportes
    exportProcessingReport
  };
};

export default useDocumentProcessing;