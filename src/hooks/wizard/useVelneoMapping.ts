// src/hooks/wizard/useVelneoMapping.ts

import { useState, useCallback, useEffect, useRef } from 'react';
import { PolizaFormData, PolizaCreateRequest } from '../../types/core/poliza';
import { DocumentProcessResult } from '../../types/ui/wizard';
import { ValidationError, ValidationResult } from '../../types/wizard/validation';
import {
  mapAzureToFormData,
  mapFormDataToVelneo,
  validateFormData,
  transformFormData,
  defaultPolizaValidationRules,
  FormDataMappingResult,
  MappingContext,
  FormDataValidationRule
} from '../../utils/formDataMapper';
import {
  getMapperForPolicyType,
  validateForCompany,
  applyCompanyDefaults,
  mapVehiculoToVelneo,
  mapHogarToVelneo,
  mapVidaToVelneo
} from '../../utils/velneoDataMapper';

// ============================================================================
// 🎯 TIPOS DEL HOOK
// ============================================================================

export interface UseVelneoMappingConfig {
  // Configuración básica
  companyId: number;
  policyType: 'vehiculo' | 'hogar' | 'vida' | 'general';
  operationType: 'Nuevo' | 'Renovacion' | 'Endoso' | 'Cancelacion';
  
  // Configuración de mapeo
  enableAutoMapping?: boolean;
  enableValidation?: boolean;
  enableTransformation?: boolean;
  customValidationRules?: FormDataValidationRule[];
  
  // Callbacks
  onMappingComplete?: (result: FormDataMappingResult<PolizaFormData>) => void;
  onValidationChange?: (validation: ValidationResult) => void;
  onVelneoDataGenerated?: (velneoData: PolizaCreateRequest) => void;
  onError?: (error: string) => void;
}

export interface FieldMapping {
  azureField: string;
  azureValue: string | number;
  confidence: number;
  velneoField: string;
  velneoValue: any;
  isValid: boolean;
  validationMessage?: string;
  source: 'azure' | 'manual' | 'default' | 'calculated';
  isEditable: boolean;
  suggestions: string[];
}

export interface MappingStats {
  totalFields: number;
  mappedFields: number;
  validFields: number;
  highConfidenceFields: number;
  lowConfidenceFields: number;
  errorsCount: number;
  warningsCount: number;
  averageConfidence: number;
  processingTime: number;
}

export interface UseVelneoMappingReturn {
  // Estado del mapeo
  isMapping: boolean;
  isValidating: boolean;
  mappingResult: FormDataMappingResult<PolizaFormData> | null;
  velneoData: PolizaCreateRequest | null;
  
  // Datos del formulario
  formData: PolizaFormData | null;
  originalFormData: PolizaFormData | null;
  
  // Validación
  validation: ValidationResult | null;
  fieldMappings: FieldMapping[];
  
  // Estadísticas
  stats: MappingStats | null;
  
  // Acciones principales
  mapFromAzure: (azureResult: DocumentProcessResult, context: MappingContext) => Promise<void>;
  mapToVelneo: (formData: PolizaFormData, context: MappingContext) => Promise<PolizaCreateRequest | null>;
  validateMapping: (formData: PolizaFormData) => ValidationResult;
  
  // Gestión de campos
  updateFieldValue: (field: keyof PolizaFormData, value: any) => void;
  applyFieldSuggestion: (field: keyof PolizaFormData, suggestionIndex: number) => void;
  resetFieldToOriginal: (field: keyof PolizaFormData) => void;
  
  // Transformaciones
  applyTransformations: (formData: PolizaFormData) => PolizaFormData;
  applyCompanySpecificDefaults: (formData: PolizaFormData) => PolizaFormData;
  
  // Re-mapeo
  remapFields: () => Promise<void>;
  clearMapping: () => void;
  
  // Utilidades
  getFieldMapping: (field: keyof PolizaFormData) => FieldMapping | null;
  getFieldSuggestions: (field: keyof PolizaFormData) => string[];
  getConfidenceLevel: (field: keyof PolizaFormData) => 'high' | 'medium' | 'low';
  
  // Exportación
  exportMappingReport: () => any;
  exportVelneoPayload: () => PolizaCreateRequest | null;
}

// ============================================================================
// 🎪 HOOK PRINCIPAL
// ============================================================================

export const useVelneoMapping = (
  config: UseVelneoMappingConfig
): UseVelneoMappingReturn => {

  const {
    companyId,
    policyType,
    operationType,
    enableAutoMapping = true,
    enableValidation = true,
    enableTransformation = true,
    customValidationRules = [],
    onMappingComplete,
    onValidationChange,
    onVelneoDataGenerated,
    onError
  } = config;

  // Estados del hook
  const [isMapping, setIsMapping] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [mappingResult, setMappingResult] = useState<FormDataMappingResult<PolizaFormData> | null>(null);
  const [velneoData, setVelneoData] = useState<PolizaCreateRequest | null>(null);
  const [formData, setFormData] = useState<PolizaFormData | null>(null);
  const [originalFormData, setOriginalFormData] = useState<PolizaFormData | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [stats, setStats] = useState<MappingStats | null>(null);

  // Referencias para evitar stale closures
  const configRef = useRef(config);
  configRef.current = config;

  // ============================================================================
  // 🗺️ MAPEO DESDE AZURE AI
  // ============================================================================

  /**
   * Mapea datos desde Azure Document Intelligence
   */
  const mapFromAzure = useCallback(async (
    azureResult: DocumentProcessResult,
    context: MappingContext
  ): Promise<void> => {
    if (isMapping) return;

    setIsMapping(true);
    const startTime = performance.now();

    try {
      // 1. Mapeo básico Azure → FormData
      const baseMapping = mapAzureToFormData(azureResult, context);
      
      // 2. Aplicar valores por defecto de la compañía
      let enhancedData = baseMapping.data;
      if (enableAutoMapping) {
        enhancedData = applyCompanyDefaults(enhancedData, companyId);
      }

      // 3. Aplicar transformaciones si están habilitadas
      if (enableTransformation) {
        const validationRules = [...defaultPolizaValidationRules, ...customValidationRules];
        enhancedData = transformFormData(enhancedData, validationRules);
      }

      // 4. Generar mapeos de campos individuales
      const fieldMappings = generateFieldMappings(azureResult, enhancedData);

      // 5. Validar datos mapeados
      let validationResult: ValidationResult | null = null;
      if (enableValidation) {
        validationResult = validateMapping(enhancedData);
      }

      // 6. Calcular estadísticas
      const processingTime = performance.now() - startTime;
      const mappingStats = calculateMappingStats(fieldMappings, baseMapping, processingTime);

      // 7. Actualizar estados
      const finalMapping: FormDataMappingResult<PolizaFormData> = {
        ...baseMapping,
        data: enhancedData
      };

      setMappingResult(finalMapping);
      setFormData(enhancedData);
      setOriginalFormData({ ...enhancedData }); // Copia para reset
      setFieldMappings(fieldMappings);
      setValidation(validationResult);
      setStats(mappingStats);

      // 8. Callbacks
      onMappingComplete?.(finalMapping);
      if (validationResult) {
        onValidationChange?.(validationResult);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido en el mapeo';
      console.error('Error en mapeo desde Azure:', error);
      onError?.(errorMessage);
    } finally {
      setIsMapping(false);
    }
  }, [companyId, enableAutoMapping, enableTransformation, enableValidation, customValidationRules, isMapping, onMappingComplete, onValidationChange, onError]);

  // ============================================================================
  // 🏢 MAPEO A VELNEO
  // ============================================================================

  /**
   * Mapea datos del formulario a formato Velneo
   */
  const mapToVelneo = useCallback(async (
    inputFormData: PolizaFormData,
    context: MappingContext
  ): Promise<PolizaCreateRequest | null> => {
    if (!inputFormData) return null;

    try {
      // 1. Validar datos de entrada
      if (enableValidation) {
        const validation = validateMapping(inputFormData);
        if (!validation.isValid) {
          onError?.(`Datos inválidos: ${validation.errors.map(e => e.message).join(', ')}`);
          return null;
        }
      }

      // 2. Obtener mapper apropiado según tipo de póliza
      const velneoPayload = getMapperForPolicyType(policyType, inputFormData, companyId);

      // 3. Validar específicamente para la compañía
      const companyValidation = validateForCompany(inputFormData, companyId);
      if (!companyValidation.isValid) {
        onError?.(`Validación de compañía falló: ${companyValidation.errors.map(e => e.message).join(', ')}`);
        return null;
      }

      // 4. Actualizar estado
      setVelneoData(velneoPayload);
      onVelneoDataGenerated?.(velneoPayload);

      return velneoPayload;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error en mapeo a Velneo';
      console.error('Error en mapeo a Velneo:', error);
      onError?.(errorMessage);
      return null;
    }
  }, [policyType, companyId, enableValidation, onError, onVelneoDataGenerated]);

  // ============================================================================
  // ✅ VALIDACIÓN
  // ============================================================================

  /**
   * Valida datos del formulario
   */
  const validateMapping = useCallback((inputFormData: PolizaFormData): ValidationResult => {
    setIsValidating(true);

    try {
      // 1. Validación básica del formulario
      const validationRules = [...defaultPolizaValidationRules, ...customValidationRules];
      const basicValidation = validateFormData(inputFormData, validationRules);

      // 2. Validación específica de la compañía
      const companyValidation = validateForCompany(inputFormData, companyId);

      // 3. Combinar resultados
      const combinedValidation: ValidationResult = {
        isValid: basicValidation.isValid && companyValidation.isValid,
        errors: [...basicValidation.errors, ...companyValidation.errors],
        warnings: [...basicValidation.warnings, ...companyValidation.warnings],
        fieldErrors: {
          ...basicValidation.fieldErrors,
          ...companyValidation.errors.reduce((acc, error) => {
            acc[error.field] = error.message;
            return acc;
          }, {} as Record<string, string>)
        }
      };

      setValidation(combinedValidation);
      onValidationChange?.(combinedValidation);

      return combinedValidation;

    } catch (error) {
      console.error('Error en validación:', error);
      const errorValidation: ValidationResult = {
        isValid: false,
        errors: [{ field: 'general', message: 'Error en validación', severity: 'error' }],
        warnings: [],
        fieldErrors: { general: 'Error en validación' }
      };
      return errorValidation;
    } finally {
      setIsValidating(false);
    }
  }, [companyId, customValidationRules, onValidationChange]);

  // ============================================================================
  // 🔧 GESTIÓN DE CAMPOS
  // ============================================================================

  /**
   * Actualiza el valor de un campo específico
   */
  const updateFieldValue = useCallback((field: keyof PolizaFormData, value: any): void => {
    if (!formData) return;

    const updatedFormData = { ...formData, [field]: value };
    setFormData(updatedFormData);

    // Re-validar si está habilitado
    if (enableValidation) {
      const newValidation = validateMapping(updatedFormData);
      setValidation(newValidation);
    }

    // Actualizar mapeo del campo específico
    setFieldMappings(prev => prev.map(mapping => {
      if (mapping.velneoField === field) {
        return {
          ...mapping,
          velneoValue: value,
          source: 'manual' as const,
          isValid: true // Asumimos que es válido hasta la próxima validación
        };
      }
      return mapping;
    }));
  }, [formData, enableValidation, validateMapping]);

  /**
   * Aplica una sugerencia a un campo
   */
  const applyFieldSuggestion = useCallback((field: keyof PolizaFormData, suggestionIndex: number): void => {
    const fieldMapping = fieldMappings.find(m => m.velneoField === field);
    if (!fieldMapping || !fieldMapping.suggestions[suggestionIndex]) return;

    const suggestion = fieldMapping.suggestions[suggestionIndex];
    updateFieldValue(field, suggestion);
  }, [fieldMappings, updateFieldValue]);

  /**
   * Resetea un campo a su valor original
   */
  const resetFieldToOriginal = useCallback((field: keyof PolizaFormData): void => {
    if (!originalFormData) return;
    updateFieldValue(field, originalFormData[field]);
  }, [originalFormData, updateFieldValue]);

  // ============================================================================
  // 🔄 TRANSFORMACIONES
  // ============================================================================

  /**
   * Aplica transformaciones automáticas
   */
  const applyTransformations = useCallback((inputFormData: PolizaFormData): PolizaFormData => {
    const validationRules = [...defaultPolizaValidationRules, ...customValidationRules];
    return transformFormData(inputFormData, validationRules);
  }, [customValidationRules]);

  /**
   * Aplica valores por defecto específicos de la compañía
   */
  const applyCompanySpecificDefaults = useCallback((inputFormData: PolizaFormData): PolizaFormData => {
    return applyCompanyDefaults(inputFormData, companyId);
  }, [companyId]);

  // ============================================================================
  // 🔄 RE-MAPEO Y LIMPIEZA
  // ============================================================================

  /**
   * Re-mapea todos los campos
   */
  const remapFields = useCallback(async (): Promise<void> => {
    if (!mappingResult || !formData) return;

    // Simular re-mapeo usando los datos actuales del formulario
    const emptyAzureResult: DocumentProcessResult = {
    documentId: 'remapping-session',
    estadoProcesamiento: 'completado',
    extractedFields: [],
    nivelConfianza: 1,
    tiempoProcesamiento: 0,
    readyForVelneo: true
    };

    const newFieldMappings = generateFieldMappings(emptyAzureResult, formData);

    setFieldMappings(newFieldMappings);

    // Re-validar
    if (enableValidation) {
      const newValidation = validateMapping(formData);
      setValidation(newValidation);
    }
  }, [mappingResult, formData, enableValidation, validateMapping]);

  /**
   * Limpia todo el mapeo
   */
  const clearMapping = useCallback((): void => {
    setMappingResult(null);
    setVelneoData(null);
    setFormData(null);
    setOriginalFormData(null);
    setValidation(null);
    setFieldMappings([]);
    setStats(null);
  }, []);

  // ============================================================================
  // 🔍 UTILIDADES
  // ============================================================================

  /**
   * Obtiene el mapeo de un campo específico
   */
  const getFieldMapping = useCallback((field: keyof PolizaFormData): FieldMapping | null => {
    return fieldMappings.find(mapping => mapping.velneoField === field) || null;
  }, [fieldMappings]);

  /**
   * Obtiene sugerencias para un campo
   */
  const getFieldSuggestions = useCallback((field: keyof PolizaFormData): string[] => {
    const mapping = getFieldMapping(field);
    return mapping?.suggestions || [];
  }, [getFieldMapping]);

  /**
   * Obtiene el nivel de confianza de un campo
   */
  const getConfidenceLevel = useCallback((field: keyof PolizaFormData): 'high' | 'medium' | 'low' => {
    const mapping = getFieldMapping(field);
    if (!mapping) return 'low';

    if (mapping.confidence >= 0.8) return 'high';
    if (mapping.confidence >= 0.6) return 'medium';
    return 'low';
  }, [getFieldMapping]);

  // ============================================================================
  // 📊 EXPORTACIÓN
  // ============================================================================

  /**
   * Exporta reporte de mapeo
   */
  const exportMappingReport = useCallback(() => {
    return {
      timestamp: new Date().toISOString(),
      config: {
        companyId,
        policyType,
        operationType
      },
      stats,
      validation,
      fieldMappings,
      formData,
      velneoData
    };
  }, [companyId, policyType, operationType, stats, validation, fieldMappings, formData, velneoData]);

  /**
   * Exporta payload para Velneo
   */
  const exportVelneoPayload = useCallback((): PolizaCreateRequest | null => {
    return velneoData;
  }, [velneoData]);

  // ============================================================================
  // 🔧 FUNCIONES AUXILIARES
  // ============================================================================

  /**
   * Genera mapeos de campos individuales
   */
  function generateFieldMappings(
    azureResult: DocumentProcessResult,
    mappedFormData: PolizaFormData
  ): FieldMapping[] {
    const mappings: FieldMapping[] = [];

    // Solo procesar si hay campos extraídos de Azure
    if (azureResult.extractedFields) {
      azureResult.extractedFields.forEach((field: any) => {
        const mapping = createFieldMapping(field, mappedFormData);
        if (mapping) {
          mappings.push(mapping);
        }
      });
    }

    return mappings;
  }

  /**
   * Crea un mapeo individual de campo
   */
  function createFieldMapping(azureField: any, velneoData: PolizaFormData): FieldMapping | null {
    const fieldName = azureField.name.toLowerCase();
    let velneoField: keyof PolizaFormData;
    let velneoValue: any;

    // Mapear según el nombre del campo de Azure
    switch (fieldName) {
      case 'nombre':
      case 'asegurado':
        velneoField = 'asegurado';
        velneoValue = velneoData.asegurado;
        break;
      case 'documento':
      case 'ci':
        velneoField = 'documento';
        velneoValue = velneoData.documento;
        break;
      case 'numero_poliza':
        velneoField = 'numeroPoliza';
        velneoValue = velneoData.numeroPoliza;
        break;
      case 'prima':
      case 'premio':
        velneoField = 'prima';
        velneoValue = velneoData.prima;
        break;
      case 'marca':
        velneoField = 'marca';
        velneoValue = velneoData.marca;
        break;
      case 'modelo':
        velneoField = 'modelo';
        velneoValue = velneoData.modelo;
        break;
      case 'matricula':
        velneoField = 'matricula';
        velneoValue = velneoData.matricula;
        break;
      default:
        return null;
    }

    return {
      azureField: azureField.name,
      azureValue: azureField.value,
      confidence: azureField.confidence || 0.8,
      velneoField,
      velneoValue,
      isValid: true, // Se validará después
      source: 'azure',
      isEditable: true,
      suggestions: generateFieldSuggestions(fieldName, azureField.value)
    };
  }

  /**
   * Genera sugerencias para un campo
   */
  function generateFieldSuggestions(fieldName: string, value: string): string[] {
    const suggestions: string[] = [];

    switch (fieldName) {
      case 'documento':
      case 'ci':
        if (value.length < 8) {
          suggestions.push(value.padStart(8, '0'));
        }
        break;
      case 'matricula':
        suggestions.push(value.toUpperCase());
        break;
      case 'nombre':
      case 'asegurado':
        suggestions.push(value.toUpperCase());
        break;
    }

    return suggestions;
  }

  /**
   * Calcula estadísticas del mapeo
   */
  function calculateMappingStats(
    fieldMappings: FieldMapping[],
    mappingResult: FormDataMappingResult<PolizaFormData>,
    processingTime: number
  ): MappingStats {
    const totalFields = fieldMappings.length;
    const validFields = fieldMappings.filter(m => m.isValid).length;
    const highConfidenceFields = fieldMappings.filter(m => m.confidence >= 0.8).length;
    const lowConfidenceFields = fieldMappings.filter(m => m.confidence < 0.6).length;
    const averageConfidence = totalFields > 0 
      ? fieldMappings.reduce((sum, m) => sum + m.confidence, 0) / totalFields 
      : 0;

    return {
      totalFields,
      mappedFields: totalFields,
      validFields,
      highConfidenceFields,
      lowConfidenceFields,
      errorsCount: mappingResult.errors.length,
      warningsCount: mappingResult.warnings.length,
      averageConfidence,
      processingTime
    };
  }

  // ============================================================================
  // 📤 RETURN DEL HOOK
  // ============================================================================

  return {
    // Estado del mapeo
    isMapping,
    isValidating,
    mappingResult,
    velneoData,
    
    // Datos del formulario
    formData,
    originalFormData,
    
    // Validación
    validation,
    fieldMappings,
    
    // Estadísticas
    stats,
    
    // Acciones principales
    mapFromAzure,
    mapToVelneo,
    validateMapping,
    
    // Gestión de campos
    updateFieldValue,
    applyFieldSuggestion,
    resetFieldToOriginal,
    
    // Transformaciones
    applyTransformations,
    applyCompanySpecificDefaults,
    
    // Re-mapeo
    remapFields,
    clearMapping,
    
    // Utilidades
    getFieldMapping,
    getFieldSuggestions,
    getConfidenceLevel,
    
    // Exportación
    exportMappingReport,
    exportVelneoPayload
  };
};

export default useVelneoMapping;