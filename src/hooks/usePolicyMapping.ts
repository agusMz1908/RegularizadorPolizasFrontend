// src/hooks/usePolicyMapping.ts - VERSIÓN CORREGIDA CON TIPOS ACTUALES

import { useState, useCallback, useEffect } from 'react';
import type { MasterDataOptionsDto } from '../types/masterData';
import type { AzureProcessResponse } from '../types/azureDocumentResult';
import { apiService } from '../services/apiService';

// ✅ TIPOS CORREGIDOS BASADOS EN TU BACKEND REAL
interface PolicyMappingResult {
  camposMapeados: Record<string, MappedField>;
  camposQueFallaronMapeo: string[];
  porcentajeExito: number;
  camposConAltaConfianza: number;
  camposConMediaConfianza: number;
  camposConBajaConfianza: number;
  opcionesDisponibles: MasterDataOptionsDto;
}

interface MappedField {
  valorExtraido: string;
  valorMapeado: any;
  confianza: number;
  opcionesDisponibles: any;
  nivelConfianza: 'high' | 'medium' | 'low' | 'failed';
  requiereRevision: boolean;
  mapeoExitoso: boolean;
}

interface PolicyMappingResponse {
  success: boolean;
  mappingResult: PolicyMappingResult;
  recommendations: string[];
  message?: string;
}

interface ApplyMappingRequest {
  azureData: AzureProcessResponse;
  manualMappings: Record<string, any>;
  selectedClient: any;
  selectedCompany: any;
  selectedSection: any;
}

interface ApplyMappingResponse {
  success: boolean;
  formData: any;
  warnings: string[];
  message: string;
}

interface UsePolicyMappingReturn {
  mappingResult: PolicyMappingResult | null;
  masterOptions: MasterDataOptionsDto | null;
  isLoading: boolean;
  error: string | null;
  recommendations: string[];
  validateMapping: (azureData: AzureProcessResponse) => Promise<void>;
  getMasterOptions: () => Promise<void>;
  applyManualMapping: (request: ApplyMappingRequest) => Promise<ApplyMappingResponse>;
  clearError: () => void;
}

export const usePolicyMapping = (): UsePolicyMappingReturn => {
  const [mappingResult, setMappingResult] = useState<PolicyMappingResult | null>(null);
  const [masterOptions, setMasterOptions] = useState<MasterDataOptionsDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  const handleApiError = (error: any) => {
    console.error('🚨 [usePolicyMapping] API Error:', error);
    setError(error.message || 'Error de conexión con el servidor');
  };

  const validateMapping = useCallback(async (azureData: AzureProcessResponse) => {
    setIsLoading(true);
    setError(null);

    console.log('🔍 [usePolicyMapping] Validando mapeo con datos:', {
      archivo: azureData.archivo,
      completitud: azureData.porcentajeCompletitud,
      estado: azureData.estado
    });

    try {
      // ✅ USAR apiService CONSISTENTE - OPCIÓN 1: Usar método request directo
      const baseUrl = apiService['baseUrl'] || 'https://localhost:7191/api';
      const token = apiService['token'] || localStorage.getItem('authToken');
      
      const response = await fetch(`${baseUrl}/Velneo/validate-mapping`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(azureData)
      });

      console.log('📡 [usePolicyMapping] Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [usePolicyMapping] Error response:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.detail || errorData.message || `Error ${response.status}: ${response.statusText}`);
        } catch {
          throw new Error(`Error ${response.status}: ${response.statusText} - ${errorText}`);
        }
      }

      const data: PolicyMappingResponse = await response.json();
      console.log('✅ [usePolicyMapping] Mapping data received:', {
        success: data.success,
        porcentajeExito: data.mappingResult.porcentajeExito,
        camposMapeados: Object.keys(data.mappingResult.camposMapeados).length,
        camposFallaron: data.mappingResult.camposQueFallaronMapeo.length
      });
      
      setMappingResult(data.mappingResult);
      setRecommendations(data.recommendations || []);
      
      // Si las opciones de maestros están incluidas en la respuesta
      if (data.mappingResult.opcionesDisponibles) {
        setMasterOptions(data.mappingResult.opcionesDisponibles);
      }
      
    } catch (err: any) {
      console.error('❌ [usePolicyMapping] Validate mapping error:', err);
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getMasterOptions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    console.log('📊 [usePolicyMapping] Obteniendo maestros...');

    try {
      // ✅ USAR EL MÉTODO EXISTENTE DEL apiService
      const data = await apiService.getMasterDataOptions();
      
      console.log('✅ [usePolicyMapping] Masters received:', {
        categorias: data.categorias?.length || 0,
        destinos: data.destinos?.length || 0,
        calidades: data.calidades?.length || 0,
        combustibles: data.combustibles?.length || 0,
        monedas: data.monedas?.length || 0
      });
      
      setMasterOptions(data);
      
    } catch (err: any) {
      console.error('❌ [usePolicyMapping] Get masters error:', err);
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const applyManualMapping = useCallback(async (request: ApplyMappingRequest): Promise<ApplyMappingResponse> => {
    setIsLoading(true);
    setError(null);

    console.log('🔧 [usePolicyMapping] Aplicando mapeo manual:', {
      azureDataFile: request.azureData.archivo,
      manualMappingsCount: Object.keys(request.manualMappings).length,
      cliente: request.selectedClient?.clinom,
      compania: request.selectedCompany?.comalias
    });

    try {
      // ✅ USAR apiService PARA CONSISTENCIA
      const response = await fetch(`${apiService.getBaseUrl()}/Velneo/apply-manual-mapping`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiService.getAuthToken() || ''}`
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [usePolicyMapping] Apply mapping error response:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.detail || errorData.message || `Error ${response.status}: ${response.statusText}`);
        } catch {
          throw new Error(`Error ${response.status}: ${response.statusText} - ${errorText}`);
        }
      }

      const data: ApplyMappingResponse = await response.json();
      console.log('✅ [usePolicyMapping] Manual mapping applied:', {
        success: data.success,
        warnings: data.warnings?.length || 0,
        message: data.message
      });
      
      return data;
      
    } catch (err: any) {
      console.error('❌ [usePolicyMapping] Apply manual mapping error:', err);
      handleApiError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ✅ CARGAR MAESTROS AUTOMÁTICAMENTE AL INICIALIZAR
  const [initialized, setInitialized] = useState(false);
  
  useEffect(() => {
    if (!initialized) {
      getMasterOptions().finally(() => setInitialized(true));
    }
  }, [initialized, getMasterOptions]);

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

// ✅ EXPORTAR TIPOS PARA USO EN OTROS COMPONENTES
export type {
  PolicyMappingResult,
  MappedField,
  PolicyMappingResponse,
  ApplyMappingRequest,
  ApplyMappingResponse
};