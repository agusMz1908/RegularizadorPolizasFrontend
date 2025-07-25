import { useState, useCallback } from 'react';
import { 
  ProcessingState, 
  DocumentResult, 
  ProcessingError 
} from '../utils/processing';
import { azureDocumentService } from '../services/azureDocumentService';

interface UseDocumentProcessingOptions {
  onStateChange?: (state: ProcessingState) => void;
  onSuccess?: (result: DocumentResult) => void;
  onError?: (error: ProcessingError) => void;
}

export const useDocumentProcessing = (options: UseDocumentProcessingOptions = {}) => {
  const { onStateChange, onSuccess, onError } = options;

  const [state, setState] = useState<ProcessingState>('idle');
  const [result, setResult] = useState<DocumentResult | null>(null);
  const [error, setError] = useState<ProcessingError | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);

  const updateState = useCallback((newState: ProcessingState) => {
    setState(newState);
    onStateChange?.(newState);
  }, [onStateChange]);

  const processDocument = useCallback(async (
    file: File,
    clienteId: number,
    companiaId: number,
    ramoId: number
  ) => {
    try {
      setError(null);
      updateState('uploading');

      const response = await azureDocumentService.processDocument(
        file,
        clienteId,
        companiaId,
        ramoId,
        (progress) => setProcessingProgress(progress)
      );

      updateState('processing');
      
      // Simular tiempo de procesamiento de Azure AI
      await new Promise(resolve => setTimeout(resolve, 2000));

      setResult(response.documentResult);
      updateState('form-ready');
      onSuccess?.(response.documentResult);

    } catch (err: any) {
      const processingError: ProcessingError = {
        type: 'processing',
        message: 'Error procesando documento',
        details: err.message,
      };
      setError(processingError);
      updateState('error');
      onError?.(processingError);
    }
  }, [updateState, onSuccess, onError]);

  const reset = useCallback(() => {
    setState('idle');
    setResult(null);
    setError(null);
    setProcessingProgress(0);
  }, []);

  return {
    state,
    result,
    error,
    processingProgress,
    processDocument,
    reset,
  };
};