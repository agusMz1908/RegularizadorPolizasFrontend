import { useState, useCallback } from 'react';
import { azureDocumentService } from '../services/azureDocumentService';
import type {
  AzureProcessResponse,
  AzureBatchResponse,
  DatosClienteExtraidos
} from '../types/azure-document';

export interface DocumentProcessingState {
  isProcessing: boolean;
  progress: number;
  result: AzureProcessResponse | null;
  batchResult: AzureBatchResponse | null;
  error: string | null;
  stage: 'idle' | 'uploading' | 'extracting' | 'searching' | 'completed' | 'error';
}

export const useAzureDocumentProcessing = () => {
  const [state, setState] = useState<DocumentProcessingState>({
    isProcessing: false,
    progress: 0,
    result: null,
    batchResult: null,
    error: null,
    stage: 'idle'
  });

  const processDocument = useCallback(async (file: File) => {
    setState({
      isProcessing: true,
      progress: 0,
      result: null,
      batchResult: null,
      error: null,
      stage: 'uploading'
    });

    try {
      const result = await azureDocumentService.processDocument(
        file,
        (progress) => {
          setState(prev => ({
            ...prev,
            progress,
            stage: progress < 30 ? 'uploading' : 
                   progress < 70 ? 'extracting' : 
                   progress < 95 ? 'searching' : 'completed'
          }));
        }
      );

      setState({
        isProcessing: false,
        progress: 100,
        result,
        batchResult: null,
        error: null,
        stage: 'completed'
      });

      return result;
    } catch (error: any) {
      setState({
        isProcessing: false,
        progress: 0,
        result: null,
        batchResult: null,
        error: error.message,
        stage: 'error'
      });
      throw error;
    }
  }, []);

  const processBatch = useCallback(async (files: File[]) => {
    setState({
      isProcessing: true,
      progress: 0,
      result: null,
      batchResult: null,
      error: null,
      stage: 'uploading'
    });

    try {
      const result = await azureDocumentService.processBatchDocuments(
        files,
        (progress) => {
          setState(prev => ({
            ...prev,
            progress,
            stage: progress < 30 ? 'uploading' : 
                   progress < 70 ? 'extracting' : 
                   progress < 95 ? 'searching' : 'completed'
          }));
        }
      );

      setState({
        isProcessing: false,
        progress: 100,
        result: null,
        batchResult: result,
        error: null,
        stage: 'completed'
      });

      return result;
    } catch (error: any) {
      setState({
        isProcessing: false,
        progress: 0,
        result: null,
        batchResult: null,
        error: error.message,
        stage: 'error'
      });
      throw error;
    }
  }, []);

  const searchClient = useCallback(async (datosCliente: DatosClienteExtraidos) => {
    try {
      const result = await azureDocumentService.searchClient(datosCliente);
      return result;
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      isProcessing: false,
      progress: 0,
      result: null,
      batchResult: null,
      error: null,
      stage: 'idle'
    });
  }, []);

  const getStageMessage = useCallback((stage: DocumentProcessingState['stage']): string => {
    const messages = {
      idle: 'Listo para procesar',
      uploading: 'Subiendo archivo...',
      extracting: 'Extrayendo datos con Azure...',
      searching: 'Buscando cliente automáticamente...',
      completed: 'Procesamiento completado',
      error: 'Error en el procesamiento'
    };
    return messages[stage];
  }, []);

  return {
    ...state,
    
    processDocument,
    processBatch,
    searchClient,
    reset,

    getStageMessage,

    canProcess: !state.isProcessing,
    hasResult: !!state.result || !!state.batchResult,
    hasError: !!state.error,
    isIdle: state.stage === 'idle',
    isCompleted: state.stage === 'completed'
  };
};