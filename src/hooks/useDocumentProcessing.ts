// src/hooks/useDocumentProcessing.ts
// ✅ VERSIÓN CORREGIDA - Compatible con tu proyecto

import { useState, useCallback } from 'react';
import { DocumentProcessResult } from '../types/ui/wizard';
import { azureService } from '../services/azureService';

// ✅ Estados simples del procesamiento
type ProcessingState = 
  | 'idle' 
  | 'uploading' 
  | 'processing' 
  | 'form-ready' 
  | 'error'
  | 'success';

// ✅ Error simple del procesamiento
interface ProcessingError {
  type: 'upload' | 'processing' | 'network' | 'validation';
  message: string;
  details?: string;
  code?: string;
}

// ✅ Opciones del hook
interface UseDocumentProcessingOptions {
  onStateChange?: (state: ProcessingState) => void;
  onSuccess?: (result: DocumentProcessResult) => void;
  onError?: (error: ProcessingError) => void;
}

// ✅ Return del hook
interface UseDocumentProcessingReturn {
  state: ProcessingState;
  result: DocumentProcessResult | null;
  error: ProcessingError | null;
  processingProgress: number;
  processDocument: (file: File) => Promise<DocumentProcessResult | null>;
  reset: () => void;
  isProcessing: boolean;
  canProcess: boolean;
}

export const useDocumentProcessing = (
  options: UseDocumentProcessingOptions = {}
): UseDocumentProcessingReturn => {
  const { onStateChange, onSuccess, onError } = options;

  // ✅ Estados del hook
  const [state, setState] = useState<ProcessingState>('idle');
  const [result, setResult] = useState<DocumentProcessResult | null>(null);
  const [error, setError] = useState<ProcessingError | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);

  // ✅ Helper para actualizar estado
  const updateState = useCallback((newState: ProcessingState) => {
    setState(newState);
    onStateChange?.(newState);
  }, [onStateChange]);

  // ✅ Función para obtener token (igual que en usePolizaWizard)
  const getAuthToken = useCallback((): string | null => {
    const possibleKeys = [
      'regularizador_token',
      'authToken',
      import.meta.env.VITE_JWT_STORAGE_KEY || 'regularizador_token'
    ];

    for (const key of possibleKeys) {
      const token = localStorage.getItem(key);
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const now = Math.floor(Date.now() / 1000);
          if (payload.exp > now) {
            return token;
          } else {
            localStorage.removeItem(key);
          }
        } catch (error) {
          localStorage.removeItem(key);
        }
      }
    }
    return null;
  }, []);

  // ✅ Función principal de procesamiento
  const processDocument = useCallback(async (
    file: File
  ): Promise<DocumentProcessResult | null> => {
    try {
      // Limpiar estado anterior
      setError(null);
      setResult(null);
      setProcessingProgress(0);
      
      // Validaciones básicas
      if (!file) {
        throw new Error('No se ha seleccionado ningún archivo');
      }

      if (!file.type.includes('pdf')) {
        throw new Error('Solo se permiten archivos PDF');
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB
        throw new Error('El archivo es demasiado grande (máximo 10MB)');
      }

      // Obtener token de autenticación
      const token = getAuthToken();
      if (!token) {
        throw new Error('Token de autenticación no encontrado');
      }

      console.log('📄 Iniciando procesamiento de documento:', file.name);
      
      // Estado: subiendo
      updateState('uploading');
      setProcessingProgress(10);

      // Estado: procesando
      updateState('processing');
      setProcessingProgress(20);

      // Llamar al servicio de Azure
      const response = await azureService.processDocument(
        file, 
        token, 
        (progress: number) => {
          // Mapear progreso de 20-90
          const mappedProgress = 20 + (progress * 0.7);
          setProcessingProgress(Math.min(mappedProgress, 90));
        }
      );

      console.log('📊 Respuesta del procesamiento:', response);

      // Convertir respuesta a DocumentProcessResult
      const documentResult: DocumentProcessResult = {
        success: true,
        extractedFields: response.extractedFields || {},
        confidence: response.confidence || 0,
        needsReview: response.needsReview || false,
        documentId: response.documentId || '',
        estadoProcesamiento: response.estadoProcesamiento || 'PROCESADO',
        data: response,
        
        // Mapear propiedades adicionales si existen
        archivo: file.name,
        estado: response.estado || 'PROCESADO_CON_SMART_EXTRACTION',
        listoParaVelneo: response.listoParaVelneo || true,
        porcentajeCompletitud: response.porcentajeCompletitud || 100,
        procesamientoExitoso: response.procesamientoExitoso || true,
        tiempoProcesamiento: response.tiempoProcesamiento || 0,
        timestamp: response.timestamp || new Date().toISOString(),
        datosVelneo: response.datosVelneo || response
      };

      // Finalizar procesamiento
      setProcessingProgress(100);
      setResult(documentResult);
      updateState('form-ready');
      
      console.log('✅ Procesamiento completado exitosamente');
      
      // Callback de éxito
      onSuccess?.(documentResult);
      
      return documentResult;

    } catch (err: any) {
      console.error('❌ Error en procesamiento:', err);
      
      // Crear error estructurado
      const processingError: ProcessingError = {
        type: err.name === 'NetworkError' ? 'network' : 'processing',
        message: err.message || 'Error desconocido al procesar el documento',
        details: err.stack || undefined,
        code: err.code || undefined
      };

      setError(processingError);
      updateState('error');
      setProcessingProgress(0);
      
      // Callback de error
      onError?.(processingError);
      
      return null;
    }
  }, [updateState, onSuccess, onError, getAuthToken]);

  // ✅ Función para resetear el hook
  const reset = useCallback(() => {
    setState('idle');
    setResult(null);
    setError(null);
    setProcessingProgress(0);
    console.log('🔄 Hook de procesamiento reseteado');
  }, []);

  // ✅ Propiedades computadas
  const isProcessing = state === 'uploading' || state === 'processing';
  const canProcess = state === 'idle' || state === 'error';

  return {
    state,
    result,
    error,
    processingProgress,
    processDocument,
    reset,
    isProcessing,
    canProcess
  };
};

// ✅ Exportar tipos para uso externo
export type { ProcessingState, ProcessingError, UseDocumentProcessingOptions };