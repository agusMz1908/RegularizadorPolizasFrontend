import { useState, useCallback } from 'react';
import { ProcessingError } from '../utils/processing';

interface UseFileUploadOptions {
  accept?: string;
  maxSize?: number; 
  onUploadProgress?: (progress: number) => void;
  onSuccess?: (file: File) => void;
  onError?: (error: ProcessingError) => void;
}

export const useFileUpload = (options: UseFileUploadOptions = {}) => {
  const {
    accept = '.pdf',
    maxSize = 10 * 1024 * 1024,
    onUploadProgress,
    onSuccess,
    onError,
  } = options;

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<ProcessingError | null>(null);

  const validateFile = useCallback((file: File): ProcessingError | null => {
    if (accept === '.pdf' && file.type !== 'application/pdf') {
      return {
        type: 'validation',
        message: 'Solo se permiten archivos PDF',
        details: `Tipo de archivo recibido: ${file.type}`,
      };
    }

    if (file.size > maxSize) {
      return {
        type: 'validation',
        message: `El archivo es demasiado grande. Máximo permitido: ${Math.round(maxSize / 1024 / 1024)}MB`,
        details: `Tamaño del archivo: ${Math.round(file.size / 1024 / 1024)}MB`,
      };
    }

    return null;
  }, [accept, maxSize]);

  const handleFileSelect = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      onError?.(validationError);
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 10;
          onUploadProgress?.(newProgress);
          if (newProgress >= 100) {
            clearInterval(progressInterval);
            setIsUploading(false);
            onSuccess?.(file);
          }
          return Math.min(newProgress, 100);
        });
      }, 100);

    } catch (err: any) {
      const uploadError: ProcessingError = {
        type: 'upload',
        message: 'Error subiendo archivo',
        details: err.message,
      };
      setError(uploadError);
      setIsUploading(false);
      onError?.(uploadError);
    }
  }, [validateFile, onUploadProgress, onSuccess, onError]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const reset = useCallback(() => {
    setIsUploading(false);
    setUploadProgress(0);
    setIsDragOver(false);
    setError(null);
  }, []);

  return {
    isUploading,
    uploadProgress,
    isDragOver,
    error,
    handleFileSelect,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    reset,
  };
};
