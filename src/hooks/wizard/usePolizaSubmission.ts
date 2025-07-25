// src/hooks/wizard/usePolizaSubmission.ts

import { useState, useCallback, useRef, useEffect } from 'react';
import { PolizaFormData, PolizaCreateRequest } from '../../types/core/poliza';
import { ValidationError, ValidationResult } from '../../types/wizard/validation';
import { DocumentProcessResult } from '../../types/ui/wizard';
import {
  validateForCompany,
  getMapperForPolicyType,
} from '../../utils/velneoDataMapper';
import {
  validatePolizaForm,
  cleanAndFormatFormData
} from '../../utils/formValidation';

// ============================================================================
// 🎯 TIPOS DEL HOOK
// ============================================================================

export interface UsePolizaSubmissionConfig {
  // Configuración del endpoint
  apiEndpoint?: string;
  timeout?: number; // en ms
  maxRetries?: number;
  retryDelay?: number; // en ms
  
  // Configuración de validación
  enableValidation?: boolean;
  enablePreValidation?: boolean;
  requireConfirmation?: boolean;
  strictMode?: boolean;
  
  // Configuración de datos
  companyId: number;
  policyType: 'vehiculo' | 'hogar' | 'vida' | 'general';
  operationType: 'Nuevo' | 'Renovacion' | 'Endoso' | 'Cancelacion';
  
  // Callbacks
  onSubmissionStart?: (data: PolizaCreateRequest) => void;
  onValidationStart?: () => void;
  onValidationComplete?: (result: ValidationResult) => void;
  onSubmissionProgress?: (stage: string, progress: number) => void;
  onSubmissionSuccess?: (response: any, submittedData: PolizaCreateRequest) => void;
  onSubmissionError?: (error: string, stage: SubmissionStage) => void;
  onRetryAttempt?: (attempt: number, maxRetries: number, error: string) => void;
  onConfirmationRequired?: (data: PolizaCreateRequest, warnings: ValidationError[]) => Promise<boolean>;
}

export type SubmissionStage = 
  | 'preparing' 
  | 'validating' 
  | 'mapping' 
  | 'submitting' 
  | 'confirming' 
  | 'processing';

export interface SubmissionStep {
  id: SubmissionStage;
  name: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error' | 'skipped';
  progress: number;
  startTime?: number;
  endTime?: number;
  error?: string;
  warnings?: string[];
}

export interface SubmissionValidation {
  isValid: boolean;
  canSubmit: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  blockers: ValidationError[]; // Errores que impiden el envío
  recommendations: string[];
}

export interface SubmissionResult {
  success: boolean;
  polizaId?: string;
  velneoResponse?: any;
  submittedData?: PolizaCreateRequest;
  validationResult?: SubmissionValidation;
  submissionTime: number;
  totalAttempts: number;
  processingTime: number;
  warnings?: ValidationError[];
  errors?: string[];
}

export interface SubmissionMetrics {
  totalTime: number;
  validationTime: number;
  mappingTime: number;
  submissionTime: number;
  retryCount: number;
  dataSize: number;
  fieldsSubmitted: number;
  warningsCount: number;
  errorsFixed: number;
}

export interface UsePolizaSubmissionReturn {
  // Estado principal
  isSubmitting: boolean;
  isValidating: boolean;
  isPreparing: boolean;
  currentStage: SubmissionStage | null;
  progress: number;
  
  // Datos de envío
  submissionData: PolizaCreateRequest | null;
  originalFormData: PolizaFormData | null;
  lastResult: SubmissionResult | null;
  
  // Validación
  validation: SubmissionValidation | null;
  
  // Progreso detallado
  steps: SubmissionStep[];
  metrics: SubmissionMetrics | null;
  
  // Acciones principales
  submitPoliza: (formData: PolizaFormData, context?: any) => Promise<SubmissionResult>;
  validateForSubmission: (formData: PolizaFormData) => Promise<SubmissionValidation>;
  prepareSubmissionData: (formData: PolizaFormData) => Promise<PolizaCreateRequest | null>;
  
  // Control del proceso
  cancelSubmission: () => void;
  retrySubmission: () => Promise<SubmissionResult | null>;
  clearResults: () => void;
  
  // Utilidades
  canSubmit: (formData: PolizaFormData) => boolean;
  getSubmissionPreview: () => any;
  estimateSubmissionTime: (formData: PolizaFormData) => number;
  
  // Debugging y reportes
  exportSubmissionReport: () => any;
  getSubmissionStatus: () => 'idle' | 'preparing' | 'validating' | 'submitting' | 'completed' | 'error';
}

// ============================================================================
// 🎪 HOOK PRINCIPAL
// ============================================================================

export const usePolizaSubmission = (
  config: UsePolizaSubmissionConfig
): UsePolizaSubmissionReturn => {

  const {
    apiEndpoint = '/api/polizas',
    timeout = 30000,
    maxRetries = 3,
    retryDelay = 2000,
    enableValidation = true,
    enablePreValidation = true,
    requireConfirmation = false,
    strictMode = false,
    companyId,
    policyType,
    operationType,
    onSubmissionStart,
    onValidationStart,
    onValidationComplete,
    onSubmissionProgress,
    onSubmissionSuccess,
    onSubmissionError,
    onRetryAttempt,
    onConfirmationRequired
  } = config;

  // Estados principales
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [currentStage, setCurrentStage] = useState<SubmissionStage | null>(null);
  const [progress, setProgress] = useState(0);
  
  // Datos
  const [submissionData, setSubmissionData] = useState<PolizaCreateRequest | null>(null);
  const [originalFormData, setOriginalFormData] = useState<PolizaFormData | null>(null);
  const [lastResult, setLastResult] = useState<SubmissionResult | null>(null);
  const [validation, setValidation] = useState<SubmissionValidation | null>(null);
  
  // Progreso detallado
  const [steps, setSteps] = useState<SubmissionStep[]>([]);
  const [metrics, setMetrics] = useState<SubmissionMetrics | null>(null);
  
  // Referencias para control
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);
  const startTimeRef = useRef<number>(0);
  const lastFormDataRef = useRef<PolizaFormData | null>(null);

  // ============================================================================
  // ✅ VALIDACIÓN PARA ENVÍO
  // ============================================================================

  /**
   * Valida los datos antes del envío
   */
  const validateForSubmission = useCallback(async (formData: PolizaFormData): Promise<SubmissionValidation> => {
    setIsValidating(true);
    onValidationStart?.();

    try {
      const errors: ValidationError[] = [];
      const warnings: ValidationError[] = [];
      const blockers: ValidationError[] = [];
      const recommendations: string[] = [];

      // 1. Validación básica del formulario
      const basicValidation = validatePolizaForm(formData);
      errors.push(...basicValidation.errors);
      warnings.push(...basicValidation.warnings);

      // 2. Validación específica de la compañía
      const companyValidation = validateForCompany(formData, companyId);
      errors.push(...companyValidation.errors);
      warnings.push(...companyValidation.warnings);

      // 3. Validaciones específicas por tipo de póliza
      const policyValidation = validateByPolicyType(formData, policyType);
      errors.push(...policyValidation.errors);
      warnings.push(...policyValidation.warnings);

      // 4. Validaciones de envío (campos críticos)
      const submissionValidation = validateCriticalFields(formData);
      blockers.push(...submissionValidation.errors);

      // 5. Generar recomendaciones
      recommendations.push(...generateRecommendations(formData, warnings));

      // 6. Determinar si se puede enviar
      const hasBlockers = blockers.length > 0;
      const hasErrors = errors.length > 0;
      const canSubmit = !hasBlockers && (!strictMode || !hasErrors);

      const result: SubmissionValidation = {
        isValid: errors.length === 0 && blockers.length === 0,
        canSubmit,
        errors: [...errors, ...blockers],
        warnings,
        blockers,
        recommendations
      };

      setValidation(result);
      onValidationComplete?.(result);

      return result;

    } catch (error) {
      const errorValidation: SubmissionValidation = {
        isValid: false,
        canSubmit: false,
        errors: [{ field: 'general', message: 'Error en validación', severity: 'error' }],
        warnings: [],
        blockers: [{ field: 'general', message: 'Error en validación', severity: 'error' }],
        recommendations: []
      };

      setValidation(errorValidation);
      return errorValidation;
    } finally {
      setIsValidating(false);
    }
  }, [companyId, policyType, strictMode, onValidationStart, onValidationComplete]);

  // ============================================================================
  // 🗺️ PREPARACIÓN DE DATOS
  // ============================================================================

  /**
   * Prepara los datos para el envío
   */
  const prepareSubmissionData = useCallback(async (formData: PolizaFormData): Promise<PolizaCreateRequest | null> => {
    setIsPreparing(true);
    setCurrentStage('preparing');

    try {
      // 1. Limpiar y formatear datos
      const cleanedData = cleanAndFormatFormData(formData);

      // 2. Mapear según tipo de póliza y compañía
      const velneoData = getMapperForPolicyType(policyType, cleanedData, companyId);

      // 3. Agregar metadatos de envío
      const enrichedData: PolizaCreateRequest = {
        ...velneoData,
        
        // Metadatos de envío
        fechaCreacion: new Date().toISOString(),
        fechaModificacion: new Date().toISOString(),
        procesadoConIA: true,
        
        // Auditoría
        observaciones: `${velneoData.observaciones || ''}\n[Enviado via PolizaWizard - ${operationType}]`.trim()
      };

      setSubmissionData(enrichedData);
      setOriginalFormData(formData);

      return enrichedData;

    } catch (error) {
      console.error('Error preparando datos para envío:', error);
      onSubmissionError?.('Error preparando datos', 'preparing');
      return null;
    } finally {
      setIsPreparing(false);
    }
  }, [policyType, companyId, operationType, onSubmissionError]);

  // ============================================================================
  // 🚀 ENVÍO PRINCIPAL
  // ============================================================================

  /**
   * Envía la póliza a Velneo
   */
  const submitPoliza = useCallback(async (
    formData: PolizaFormData, 
    context?: any
  ): Promise<SubmissionResult> => {
    if (isSubmitting) {
      throw new Error('Ya hay un envío en progreso');
    }

    setIsSubmitting(true);
    setProgress(0);
    startTimeRef.current = Date.now();
    retryCountRef.current = 0;
    lastFormDataRef.current = formData;

    // Configurar abort controller
    abortControllerRef.current = new AbortController();

    // Configurar pasos del envío
    const submissionSteps: SubmissionStep[] = [
      {
        id: 'preparing',
        name: 'Preparación',
        description: 'Preparando datos para envío',
        status: 'pending',
        progress: 0
      },
      {
        id: 'validating',
        name: 'Validación',
        description: 'Validando datos antes del envío',
        status: 'pending',
        progress: 0
      },
      {
        id: 'mapping',
        name: 'Mapeo',
        description: 'Convirtiendo datos al formato Velneo',
        status: 'pending',
        progress: 0
      },
      {
        id: 'confirming',
        name: 'Confirmación',
        description: 'Confirmando envío',
        status: 'pending',
        progress: 0
      },
      {
        id: 'submitting',
        name: 'Enviando',
        description: 'Enviando datos a Velneo',
        status: 'pending',
        progress: 0
      },
      {
        id: 'processing',
        name: 'Procesando',
        description: 'Procesando respuesta del servidor',
        status: 'pending',
        progress: 0
      }
    ];

    setSteps(submissionSteps);

    try {
      let currentProgress = 0;
      const progressPerStep = 100 / submissionSteps.length;

      // Paso 1: Preparación
      await updateStep('preparing', 'processing');
      const preparedData = await prepareSubmissionData(formData);
      if (!preparedData) {
        throw new Error('Error preparando datos para envío');
      }
      currentProgress += progressPerStep;
      setProgress(currentProgress);
      await updateStep('preparing', 'completed');

      // Paso 2: Validación
      if (enableValidation) {
        await updateStep('validating', 'processing');
        const validationResult = await validateForSubmission(formData);
        
        if (!validationResult.canSubmit) {
          throw new Error(`Validación falló: ${validationResult.blockers.map(e => e.message).join(', ')}`);
        }

        currentProgress += progressPerStep;
        setProgress(currentProgress);
        await updateStep('validating', 'completed');
      } else {
        await updateStep('validating', 'skipped');
        currentProgress += progressPerStep;
        setProgress(currentProgress);
      }

      // Paso 3: Mapeo (ya hecho en preparación, pero verificamos)
      await updateStep('mapping', 'processing');
      await new Promise(resolve => setTimeout(resolve, 200)); // Simular procesamiento
      currentProgress += progressPerStep;
      setProgress(currentProgress);
      await updateStep('mapping', 'completed');

      // Paso 4: Confirmación (si es requerida)
      if (requireConfirmation && validation?.warnings?.length) {
        await updateStep('confirming', 'processing');
        
        const confirmed = await onConfirmationRequired?.(preparedData, validation.warnings) ?? true;
        if (!confirmed) {
          throw new Error('Envío cancelado por el usuario');
        }

        currentProgress += progressPerStep;
        setProgress(currentProgress);
        await updateStep('confirming', 'completed');
      } else {
        await updateStep('confirming', 'skipped');
        currentProgress += progressPerStep;
        setProgress(currentProgress);
      }

      // Paso 5: Envío
      await updateStep('submitting', 'processing');
      onSubmissionStart?.(preparedData);

      const response = await performSubmission(preparedData);

      currentProgress += progressPerStep;
      setProgress(currentProgress);
      await updateStep('submitting', 'completed');

      // Paso 6: Procesamiento de respuesta
      await updateStep('processing', 'processing');
      
      const finalResult = await processSubmissionResponse(response, preparedData);
      
      currentProgress = 100;
      setProgress(currentProgress);
      await updateStep('processing', 'completed');

      // Calcular métricas finales
      const finalMetrics = calculateSubmissionMetrics(preparedData);
      setMetrics(finalMetrics);

      // Resultado exitoso
      const result: SubmissionResult = {
        success: true,
        polizaId: finalResult.id || finalResult.polizaId,
        velneoResponse: response,
        submittedData: preparedData,
        validationResult: validation,
        submissionTime: Date.now() - startTimeRef.current,
        totalAttempts: retryCountRef.current + 1,
        processingTime: finalMetrics.totalTime,
        warnings: validation?.warnings
      };

      setLastResult(result);
      onSubmissionSuccess?.(response, preparedData);

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido en envío';
      
      // Marcar paso actual como error
      setSteps(prev => prev.map(step => 
        step.status === 'processing' 
          ? { ...step, status: 'error', error: errorMessage }
          : step
      ));

      const errorResult: SubmissionResult = {
        success: false,
        submissionTime: Date.now() - startTimeRef.current,
        totalAttempts: retryCountRef.current + 1,
        processingTime: Date.now() - startTimeRef.current,
        errors: [errorMessage]
      };

      setLastResult(errorResult);
      onSubmissionError?.(errorMessage, currentStage || 'submitting');

      return errorResult;

    } finally {
      setIsSubmitting(false);
      setCurrentStage(null);
      abortControllerRef.current = null;
    }
  }, [
    isSubmitting, 
    enableValidation, 
    requireConfirmation, 
    validation, 
    onSubmissionStart, 
    onSubmissionSuccess, 
    onSubmissionError, 
    onConfirmationRequired,
    prepareSubmissionData,
    validateForSubmission
  ]);

  // ============================================================================
  // 🔄 CONTROL DEL PROCESO
  // ============================================================================

  /**
   * Cancela el envío actual
   */
  const cancelSubmission = useCallback((): void => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setIsSubmitting(false);
    setCurrentStage(null);
    
    // Marcar pasos como cancelados
    setSteps(prev => prev.map(step => 
      step.status === 'processing' || step.status === 'pending'
        ? { ...step, status: 'error', error: 'Cancelado por el usuario' }
        : step
    ));
  }, []);

  /**
   * Reintenta el envío
   */
  const retrySubmission = useCallback(async (): Promise<SubmissionResult | null> => {
    if (!lastFormDataRef.current) {
      onSubmissionError?.('No hay datos para reintentar', 'submitting');
      return null;
    }

    retryCountRef.current += 1;
    
    if (retryCountRef.current > maxRetries) {
      const errorMessage = `Máximo de reintentos alcanzado (${maxRetries})`;
      onSubmissionError?.(errorMessage, 'submitting');
      return null;
    }

    onRetryAttempt?.(retryCountRef.current, maxRetries, lastResult?.errors?.[0] || 'Error desconocido');

    // Esperar antes de reintentar
    await new Promise(resolve => setTimeout(resolve, retryDelay));

    return submitPoliza(lastFormDataRef.current);
  }, [maxRetries, retryDelay, lastResult, onSubmissionError, onRetryAttempt, submitPoliza]);

  /**
   * Limpia todos los resultados
   */
  const clearResults = useCallback((): void => {
    setSubmissionData(null);
    setOriginalFormData(null);
    setLastResult(null);
    setValidation(null);
    setProgress(0);
    setCurrentStage(null);
    setSteps([]);
    setMetrics(null);
    retryCountRef.current = 0;
    lastFormDataRef.current = null;
  }, []);

  // ============================================================================
  // 🔧 UTILIDADES
  // ============================================================================

  /**
   * Verifica si se puede enviar
   */
  const canSubmit = useCallback((formData: PolizaFormData): boolean => {
    if (!formData) return false;
    
    // Verificaciones básicas
    const hasRequiredFields = !!(
      formData.asegurado &&
      formData.numeroPoliza &&
      formData.vigenciaDesde &&
      formData.vigenciaHasta &&
      formData.prima > 0
    );

    return hasRequiredFields && !isSubmitting;
  }, [isSubmitting]);

  /**
   * Obtiene preview de los datos de envío
   */
  const getSubmissionPreview = useCallback(() => {
    return submissionData ? {
      numeroPoliza: submissionData.conpol,
      asegurado: submissionData.asegurado,
      compania: submissionData.comcod,
      prima: submissionData.conpremio,
      fechaCreacion: submissionData.fechaCreacion,
      procesadoConIA: submissionData.procesadoConIA
    } : null;
  }, [submissionData]);

  /**
   * Estima tiempo de envío
   */
  const estimateSubmissionTime = useCallback((formData: PolizaFormData): number => {
    const baseTime = 5; // segundos base
    const fieldsCount = Object.keys(formData).filter(key => formData[key as keyof PolizaFormData]).length;
    const complexityFactor = fieldsCount / 50; // Factor de complejidad
    
    return Math.round(baseTime * (1 + complexityFactor));
  }, []);

  /**
   * Obtiene estado del envío
   */
  const getSubmissionStatus = useCallback((): 'idle' | 'preparing' | 'validating' | 'submitting' | 'completed' | 'error' => {
    if (lastResult?.errors?.length) return 'error';
    if (lastResult?.success) return 'completed';
    if (isSubmitting) return 'submitting';
    if (isValidating) return 'validating';
    if (isPreparing) return 'preparing';
    return 'idle';
  }, [lastResult, isSubmitting, isValidating, isPreparing]);

  /**
   * Exporta reporte de envío
   */
  const exportSubmissionReport = useCallback(() => {
    return {
      timestamp: new Date().toISOString(),
      config: {
        companyId,
        policyType,
        operationType,
        strictMode,
        enableValidation
      },
      submission: {
        data: submissionData,
        originalFormData,
        result: lastResult,
        validation,
        steps,
        metrics
      }
    };
  }, [companyId, policyType, operationType, strictMode, enableValidation, submissionData, originalFormData, lastResult, validation, steps, metrics]);

  // ============================================================================
  // 🔧 FUNCIONES AUXILIARES
  // ============================================================================

  /**
   * Actualiza el estado de un paso
   */
  async function updateStep(
    stepId: SubmissionStage, 
    status: SubmissionStep['status']
  ): Promise<void> {
    const now = Date.now();
    
    setSteps(prev => prev.map(step => {
      if (step.id === stepId) {
        const updated = { ...step, status };
        
        if (status === 'processing') {
          updated.startTime = now;
          setCurrentStage(stepId);
          onSubmissionProgress?.(step.description, step.progress);
        } else if (status === 'completed') {
          updated.endTime = now;
          updated.progress = 100;
        }
        
        return updated;
      }
      return step;
    }));

    // Pequeña pausa para animaciones
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * Realiza el envío HTTP
   */
  async function performSubmission(data: PolizaCreateRequest): Promise<any> {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      signal: abortControllerRef.current?.signal
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Procesa la respuesta del envío
   */
  async function processSubmissionResponse(response: any, submittedData: PolizaCreateRequest): Promise<any> {
    // Simular procesamiento de respuesta
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      id: response.id || response.polizaId || `POL-${Date.now()}`,
      ...response
    };
  }

  /**
   * Calcula métricas del envío
   */
  function calculateSubmissionMetrics(data: PolizaCreateRequest): SubmissionMetrics {
    const totalTime = Date.now() - startTimeRef.current;
    const dataString = JSON.stringify(data);
    
    return {
      totalTime,
      validationTime: 0, // Se calculará en implementación real
      mappingTime: 0,
      submissionTime: totalTime,
      retryCount: retryCountRef.current,
      dataSize: new Blob([dataString]).size,
      fieldsSubmitted: Object.keys(data).length,
      warningsCount: validation?.warnings?.length || 0,
      errorsFixed: 0
    };
  }

  /**
   * Validaciones específicas por tipo de póliza
   */
  function validateByPolicyType(formData: PolizaFormData, type: string): { errors: ValidationError[]; warnings: ValidationError[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    switch (type) {
      case 'vehiculo':
        if (!formData.marca) {
          warnings.push({ field: 'marca', message: 'Se recomienda especificar la marca del vehículo', severity: 'warning' });
        }
        if (!formData.matricula) {
          warnings.push({ field: 'matricula', message: 'Se recomienda especificar la matrícula', severity: 'warning' });
        }
        break;
        
      case 'vida':
        if (formData.prima > 100000) {
          warnings.push({ field: 'prima', message: 'Prima muy alta para seguro de vida', severity: 'warning' });
        }
        break;
    }

    return { errors, warnings };
  }

  /**
   * Valida campos críticos
   */
  function validateCriticalFields(formData: PolizaFormData): { errors: ValidationError[] } {
    const errors: ValidationError[] = [];

    // Campos absolutamente críticos que impiden el envío
    if (!formData.asegurado) {
      errors.push({ field: 'asegurado', message: 'El asegurado es obligatorio para el envío', severity: 'error' });
    }
    
    if (!formData.numeroPoliza) {
      errors.push({ field: 'numeroPoliza', message: 'El número de póliza es obligatorio', severity: 'error' });
    }

    return { errors };
  }

  /**
   * Genera recomendaciones
   */
  function generateRecommendations(formData: PolizaFormData, warnings: ValidationError[]): string[] {
    const recommendations: string[] = [];

    if (warnings.length > 0) {
      recommendations.push('Revise las advertencias antes del envío');
    }

    if (!formData.email) {
      recommendations.push('Considere agregar un email de contacto');
    }

    if (!formData.telefono) {
      recommendations.push('Considere agregar un teléfono de contacto');
    }

    return recommendations;
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
    isSubmitting,
    isValidating,
    isPreparing,
    currentStage,
    progress,
    
    // Datos de envío
    submissionData,
    originalFormData,
    lastResult,
    
    // Validación
    validation,
    
    // Progreso detallado
    steps,
    metrics,
    
    // Acciones principales
    submitPoliza,
    validateForSubmission,
    prepareSubmissionData,
    
    // Control del proceso
    cancelSubmission,
    retrySubmission,
    clearResults,
    
    // Utilidades
    canSubmit,
    getSubmissionPreview,
    estimateSubmissionTime,
    
    // Debugging y reportes
    exportSubmissionReport,
    getSubmissionStatus
  };
};

export default usePolizaSubmission;