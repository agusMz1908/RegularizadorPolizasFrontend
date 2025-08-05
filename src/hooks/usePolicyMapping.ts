// src/hooks/usePolicyMapping.ts - SOLUCIÓN RÁPIDA
import { useState, useCallback } from 'react';
import type { 
  PolicyMappingResult, 
  PolicyMappingResponse, 
  MasterDataOptions,
  ApplyMappingRequest,
  ApplyMappingResponse 
} from '../types/mappings';

// ✅ CONFIGURACIÓN DIRECTA (temporal)
const API_BASE_URL = 'https://localhost:7191/api';
const TOKEN_KEY = 'authToken'; // Usar la misma key que en apiService

interface UsePolicyMappingReturn {
  mappingResult: PolicyMappingResult | null;
  masterOptions: MasterDataOptions | null;
  isLoading: boolean;
  error: string | null;
  recommendations: string[];
  validateMapping: (azureData: any) => Promise<void>;
  getMasterOptions: () => Promise<void>;
  applyManualMapping: (request: ApplyMappingRequest) => Promise<ApplyMappingResponse>;
  clearError: () => void;
}

export const usePolicyMapping = (): UsePolicyMappingReturn => {
  const [mappingResult, setMappingResult] = useState<PolicyMappingResult | null>(null);
  const [masterOptions, setMasterOptions] = useState<MasterDataOptions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY) || ''}`
  });

  const handleApiError = (error: any) => {
    console.error('🚨 Policy Mapping API Error:', error);
    setError(error.message || 'Error de conexión con el servidor');
  };

  const validateMapping = useCallback(async (azureData: any) => {
    setIsLoading(true);
    setError(null);

    console.log('🔍 Validando mapeo con datos:', azureData);
    console.log('🔗 URL completa:', `${API_BASE_URL}/Velneo/validate-mapping`);
    console.log('🔑 Token disponible:', !!localStorage.getItem(TOKEN_KEY));

    try {
      // ✅ URL COMPLETA + HEADERS CORRECTOS
      const response = await fetch(`${API_BASE_URL}/Velneo/validate-mapping`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(azureData)
      });

      console.log('📡 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.detail || errorData.message || `Error ${response.status}: ${response.statusText}`);
        } catch {
          throw new Error(`Error ${response.status}: ${response.statusText} - ${errorText}`);
        }
      }

      const data: PolicyMappingResponse = await response.json();
      console.log('✅ Mapping data received:', data);
      
      setMappingResult(data.mappingResult);
      setRecommendations(data.recommendations || []);
      
      // If master options are included in the response
      if (data.mappingResult.opcionesDisponibles) {
        setMasterOptions(data.mappingResult.opcionesDisponibles);
      }
      
    } catch (err: any) {
      console.error('❌ Validate mapping error:', err);
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getMasterOptions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    console.log('📊 Obteniendo maestros...');
    console.log('🔗 URL completa:', `${API_BASE_URL}/Velneo/mapping-options`);

    try {
      const response = await fetch(`${API_BASE_URL}/Velneo/mapping-options`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      console.log('📡 Masters response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Masters error response:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.detail || errorData.message || `Error ${response.status}: ${response.statusText}`);
        } catch {
          throw new Error(`Error ${response.status}: ${response.statusText} - ${errorText}`);
        }
      }

      const data: MasterDataOptions = await response.json();
      console.log('✅ Masters received:', data);
      setMasterOptions(data);
      
    } catch (err: any) {
      console.error('❌ Get masters error:', err);
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const applyManualMapping = useCallback(async (request: ApplyMappingRequest): Promise<ApplyMappingResponse> => {
    setIsLoading(true);
    setError(null);

    console.log('🔧 Aplicando mapeo manual:', request);

    try {
      const response = await fetch(`${API_BASE_URL}/Velneo/apply-manual-mapping`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Apply mapping error response:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.detail || errorData.message || `Error ${response.status}: ${response.statusText}`);
        } catch {
          throw new Error(`Error ${response.status}: ${response.statusText} - ${errorText}`);
        }
      }

      const data: ApplyMappingResponse = await response.json();
      console.log('✅ Manual mapping applied:', data);
      return data;
      
    } catch (err: any) {
      console.error('❌ Apply manual mapping error:', err);
      handleApiError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    mappingResult,
    masterOptions,
    isLoading,
    error,
    recommendations,
    validateMapping,
    getMasterOptions,
    applyManualMapping,
    clearError
  };
};