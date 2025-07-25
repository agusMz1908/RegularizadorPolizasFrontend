import { useState, useCallback } from 'react';
import { apiClient, ApiResponse } from '../services/ApiClient';

export interface UseApiServiceOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  autoReset?: boolean;
}

export interface UseApiServiceState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export const useApiService = <T = any>(options: UseApiServiceOptions = {}) => {
  const [state, setState] = useState<UseApiServiceState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false
  });

  const execute = useCallback(async (
    request: () => Promise<ApiResponse<T>>
  ): Promise<T | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null, success: false }));

      const response = await request();

      if (response.success && response.data) {
        setState({
          data: response.data,
          loading: false,
          error: null,
          success: true
        });

        options.onSuccess?.(response.data);
        
        if (options.autoReset) {
          setTimeout(() => {
            setState(prev => ({ ...prev, success: false }));
          }, 3000);
        }

        return response.data;
      } else {
        const errorMessage = response.error || 'Error desconocido';
        setState({
          data: null,
          loading: false,
          error: errorMessage,
          success: false
        });

        options.onError?.(errorMessage);
        return null;
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Error desconocido';
      setState({
        data: null,
        loading: false,
        error: errorMessage,
        success: false
      });

      options.onError?.(errorMessage);
      return null;
    }
  }, [options]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false
    });
  }, []);

  return {
    ...state,
    execute,
    reset
  };
};

// Hook específico para manejo de errores globales
export const useGlobalErrorHandler = () => {
  const handleError = useCallback((error: string, context?: string) => {
    console.error(`❌ Error${context ? ` en ${context}` : ''}:`, error);
    
    if (error.includes('sesión expirada') || error.includes('401')) {
      // Redirigir al login
      window.location.href = '/login';
    }
  }, []);

  return { handleError };
};