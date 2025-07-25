// src/hooks/wizard/useWizardNavigation.ts

import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  WizardStepId, 
  WizardStep, 
  WizardState, 
  WizardProgress,
  DEFAULT_WIZARD_STEPS 
} from '../../types/wizard/steps';
import { PolizaFormData } from '../../types/core/poliza';
import {
  getNextStep,
  getPreviousStep,
  canNavigateToStep,
  validateStepCompletion,
  calculateWizardProgress,
  updateWizardStateForStep,
  markStepAsCompleted,
  resetWizardState,
  isWizardComplete,
  logWizardState,
  getStepsForOperationType
} from '../../utils/stepHelpers';

export interface UseWizardNavigationConfig {
  initialStep?: WizardStepId;
  steps?: WizardStep[];
  operationType?: string;
  enablePersistence?: boolean;
  enableValidation?: boolean;
  enableLogging?: boolean;
  storageKey?: string;
  onStepChange?: (step: WizardStepId, previousStep: WizardStepId | null) => void;
  onStepComplete?: (step: WizardStepId, data: any) => void;
  onWizardComplete?: (data: WizardState) => void;
  onValidationError?: (step: WizardStepId, errors: string[]) => void;
}

export interface UseWizardNavigationReturn {
  // Estado actual
  currentStep: WizardStepId;
  previousStep: WizardStepId | null;
  steps: WizardStep[];
  completedSteps: Set<WizardStepId>;
  progress: WizardProgress;
  
  // Estado de navegación
  canGoNext: boolean;
  canGoBack: boolean;
  canNavigateTo: (step: WizardStepId) => boolean;
  isComplete: boolean;
  isProcessing: boolean;
  
  // Acciones de navegación
  goNext: () => Promise<boolean>;
  goBack: () => void;
  goToStep: (step: WizardStepId) => Promise<boolean>;
  skipStep: () => Promise<boolean>;
  
  // Gestión de estado
  completeStep: (stepId: WizardStepId, data?: any) => Promise<boolean>;
  resetWizard: () => void;
  setStepData: (stepId: WizardStepId, data: any) => void;
  getStepData: (stepId: WizardStepId) => any;
  
  // Validación
  validateCurrentStep: (formData?: PolizaFormData) => boolean;
  getValidationErrors: () => string[];
  
  // Persistencia
  saveState: () => void;
  loadState: () => boolean;
  clearSavedState: () => void;
  
  // Utilidades
  getCurrentStepIndex: () => number;
  getTotalSteps: () => number;
  getStepByIndex: (index: number) => WizardStep | null;
  getReachableSteps: () => WizardStepId[];
  
  // Estado interno para debugging
  wizardState: WizardState;
}

// ============================================================================
// 🎪 HOOK PRINCIPAL
// ============================================================================

export const useWizardNavigation = (
  config: UseWizardNavigationConfig = {}
): UseWizardNavigationReturn => {
  
  // Configuración con valores por defecto
  const {
    initialStep = 'cliente',
    steps: configSteps,
    operationType,
    enablePersistence = true,
    enableValidation = true,
    enableLogging = false,
    storageKey = 'poliza-wizard-state',
    onStepChange,
    onStepComplete,
    onWizardComplete,
    onValidationError
  } = config;

  // Estado del wizard
  const [wizardState, setWizardState] = useState<WizardState>(() => {
    if (enablePersistence && typeof window !== 'undefined') {
      const saved = loadStateFromStorage(storageKey);
      if (saved) return saved;
    }
    return resetWizardState();
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // Referencias para callbacks
  const configRef = useRef(config);
  configRef.current = config;

  // Obtener pasos según tipo de operación
  const steps = configSteps || 
    (operationType ? getStepsForOperationType(operationType) : DEFAULT_WIZARD_STEPS);

  // Calcular progreso
  const progress = calculateWizardProgress(
    wizardState.currentStep,
    steps,
    wizardState.completedSteps
  );

  // ============================================================================
  // 🧭 FUNCIONES DE NAVEGACIÓN
  // ============================================================================

  /**
   * Navega al siguiente paso
   */
  const goNext = useCallback(async (): Promise<boolean> => {
    if (isProcessing) return false;

    setIsProcessing(true);
    
    try {
      // Validar paso actual si está habilitado
      if (enableValidation) {
        const validation = validateStepCompletion(wizardState.currentStep, wizardState);
        if (!validation.isValid) {
          setValidationErrors(validation.errors);
          onValidationError?.(wizardState.currentStep, validation.errors);
          return false;
        }
      }

      // Marcar paso actual como completado
      const updatedState = markStepAsCompleted(wizardState.currentStep, wizardState);
      if (updatedState.error) {
        setValidationErrors([updatedState.error]);
        return false;
      }

      // Obtener siguiente paso
      const nextStepId = getNextStep(wizardState.currentStep, steps);
      if (!nextStepId) {
        // Wizard completado
        onWizardComplete?.(updatedState);
        return false;
      }

      // Actualizar estado para el nuevo paso
      const newState = updateWizardStateForStep(nextStepId, updatedState, steps);
      setWizardState(newState);
      setValidationErrors([]);

      // Callbacks
      onStepChange?.(nextStepId, wizardState.currentStep);
      onStepComplete?.(wizardState.currentStep, wizardState.stepData[wizardState.currentStep]);

      // Logging
      if (enableLogging) {
        logWizardState(newState, steps);
      }

      // Persistencia
      if (enablePersistence) {
        saveStateToStorage(storageKey, newState);
      }

      return true;

    } catch (error) {
      console.error('Error navegando al siguiente paso:', error);
      setValidationErrors(['Error inesperado durante la navegación']);
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [wizardState, steps, enableValidation, enableLogging, enablePersistence, storageKey, onStepChange, onStepComplete, onWizardComplete, onValidationError, isProcessing]);

  /**
   * Navega al paso anterior
   */
  const goBack = useCallback((): void => {
    if (isProcessing) return;

    const previousStepId = getPreviousStep(wizardState.currentStep, steps);
    if (!previousStepId) return;

    const newState = updateWizardStateForStep(previousStepId, wizardState, steps);
    setWizardState(newState);
    setValidationErrors([]);

    onStepChange?.(previousStepId, wizardState.currentStep);

    if (enableLogging) {
      logWizardState(newState, steps);
    }

    if (enablePersistence) {
      saveStateToStorage(storageKey, newState);
    }
  }, [wizardState, steps, enableLogging, enablePersistence, storageKey, onStepChange, isProcessing]);

  /**
   * Navega a un paso específico
   */
  const goToStep = useCallback(async (targetStep: WizardStepId): Promise<boolean> => {
    if (isProcessing) return false;
    if (wizardState.currentStep === targetStep) return true;

    setIsProcessing(true);

    try {
      // Verificar si se puede navegar a ese paso
      if (!canNavigateToStep(targetStep, wizardState.currentStep, steps, wizardState.completedSteps)) {
        setValidationErrors([`No se puede navegar al paso: ${targetStep}`]);
        return false;
      }

      const newState = updateWizardStateForStep(targetStep, wizardState, steps);
      setWizardState(newState);
      setValidationErrors([]);

      onStepChange?.(targetStep, wizardState.currentStep);

      if (enableLogging) {
        logWizardState(newState, steps);
      }

      if (enablePersistence) {
        saveStateToStorage(storageKey, newState);
      }

      return true;

    } catch (error) {
      console.error('Error navegando al paso:', targetStep, error);
      setValidationErrors(['Error inesperado durante la navegación']);
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [wizardState, steps, enableLogging, enablePersistence, storageKey, onStepChange, isProcessing]);

  /**
   * Salta el paso actual (si es permitido)
   */
  const skipStep = useCallback(async (): Promise<boolean> => {
    const currentStepConfig = steps.find(step => step.id === wizardState.currentStep);
    if (!currentStepConfig?.skippable) {
      setValidationErrors(['Este paso no se puede saltar']);
      return false;
    }

    return goNext();
  }, [wizardState.currentStep, steps, goNext]);

  // ============================================================================
  // 🗂️ GESTIÓN DE ESTADO
  // ============================================================================

  /**
   * Completa un paso específico con datos
   */
  const completeStep = useCallback(async (stepId: WizardStepId, data?: any): Promise<boolean> => {
    const newStepData = { ...wizardState.stepData };
    if (data) {
      newStepData[stepId] = data;
    }

    const updatedState = markStepAsCompleted(stepId, {
      ...wizardState,
      stepData: newStepData
    });

    if (updatedState.error) {
      setValidationErrors([updatedState.error]);
      return false;
    }

    setWizardState(updatedState);
    onStepComplete?.(stepId, data);

    if (enablePersistence) {
      saveStateToStorage(storageKey, updatedState);
    }

    return true;
  }, [wizardState, enablePersistence, storageKey, onStepComplete]);

  /**
   * Reinicia el wizard
   */
  const resetWizard = useCallback((): void => {
    const newState = resetWizardState();
    setWizardState(newState);
    setValidationErrors([]);
    setIsProcessing(false);

    if (enablePersistence) {
      clearSavedStateFromStorage(storageKey);
    }
  }, [enablePersistence, storageKey]);

  /**
   * Establece datos para un paso específico
   */
  const setStepData = useCallback((stepId: WizardStepId, data: any): void => {
    setWizardState(prev => ({
      ...prev,
      stepData: {
        ...prev.stepData,
        [stepId]: data
      }
    }));

    if (enablePersistence) {
      const newState = {
        ...wizardState,
        stepData: {
          ...wizardState.stepData,
          [stepId]: data
        }
      };
      saveStateToStorage(storageKey, newState);
    }
  }, [wizardState, enablePersistence, storageKey]);

  /**
   * Obtiene datos de un paso específico
   */
  const getStepData = useCallback((stepId: WizardStepId): any => {
    return wizardState.stepData[stepId];
  }, [wizardState.stepData]);

  // ============================================================================
  // ✅ VALIDACIÓN
  // ============================================================================

  /**
   * Valida el paso actual
   */
  const validateCurrentStep = useCallback((formData?: PolizaFormData): boolean => {
    const validation = validateStepCompletion(wizardState.currentStep, wizardState, formData);
    setValidationErrors(validation.errors);
    
    if (!validation.isValid && onValidationError) {
      onValidationError(wizardState.currentStep, validation.errors);
    }
    
    return validation.isValid;
  }, [wizardState, onValidationError]);

  /**
   * Obtiene errores de validación actuales
   */
  const getValidationErrors = useCallback((): string[] => {
    return validationErrors;
  }, [validationErrors]);

  // ============================================================================
  // 💾 PERSISTENCIA
  // ============================================================================

  /**
   * Guarda el estado actual
   */
  const saveState = useCallback((): void => {
    if (enablePersistence) {
      saveStateToStorage(storageKey, wizardState);
    }
  }, [enablePersistence, storageKey, wizardState]);

  /**
   * Carga estado guardado
   */
  const loadState = useCallback((): boolean => {
    if (!enablePersistence) return false;

    const saved = loadStateFromStorage(storageKey);
    if (saved) {
      setWizardState(saved);
      setValidationErrors([]);
      return true;
    }
    return false;
  }, [enablePersistence, storageKey]);

  /**
   * Limpia estado guardado
   */
  const clearSavedState = useCallback((): void => {
    if (enablePersistence) {
      clearSavedStateFromStorage(storageKey);
    }
  }, [enablePersistence, storageKey]);

  // ============================================================================
  // 🔧 UTILIDADES
  // ============================================================================

  /**
   * Obtiene índice del paso actual
   */
  const getCurrentStepIndex = useCallback((): number => {
    return steps.findIndex(step => step.id === wizardState.currentStep);
  }, [steps, wizardState.currentStep]);

  /**
   * Obtiene total de pasos
   */
  const getTotalSteps = useCallback((): number => {
    return steps.length;
  }, [steps.length]);

  /**
   * Obtiene paso por índice
   */
  const getStepByIndex = useCallback((index: number): WizardStep | null => {
    return steps[index] || null;
  }, [steps]);

  /**
   * Obtiene pasos alcanzables
   */
  const getReachableSteps = useCallback((): WizardStepId[] => {
    return steps
      .filter(step => canNavigateToStep(step.id, wizardState.currentStep, steps, wizardState.completedSteps))
      .map(step => step.id);
  }, [steps, wizardState]);

  /**
   * Verifica si se puede navegar a un paso
   */
  const canNavigateTo = useCallback((step: WizardStepId): boolean => {
    return canNavigateToStep(step, wizardState.currentStep, steps, wizardState.completedSteps);
  }, [wizardState, steps]);

  // ============================================================================
  // 🔄 EFECTOS
  // ============================================================================

  // Actualizar paso inicial si cambia
  useEffect(() => {
    if (wizardState.currentStep !== initialStep && wizardState.completedSteps.size === 0) {
      goToStep(initialStep);
    }
  }, [initialStep]); // Solo cuando cambia initialStep, no incluir goToStep para evitar loops

  // Auto-guardado periódico si está habilitado
  useEffect(() => {
    if (!enablePersistence) return;

    const interval = setInterval(() => {
      saveStateToStorage(storageKey, wizardState);
    }, 30000); // Cada 30 segundos

    return () => clearInterval(interval);
  }, [enablePersistence, storageKey, wizardState]);

  // Logging automático en desarrollo
  useEffect(() => {
    if (enableLogging && typeof window !== 'undefined' && (window as any).__DEV__) {
      logWizardState(wizardState, steps);
    }
  }, [wizardState.currentStep, enableLogging]);

  // ============================================================================
  // 📤 RETURN DEL HOOK
  // ============================================================================

  return {
    // Estado actual
    currentStep: wizardState.currentStep,
    previousStep: wizardState.previousStep,
    steps,
    completedSteps: wizardState.completedSteps,
    progress,
    
    // Estado de navegación
    canGoNext: !!getNextStep(wizardState.currentStep, steps),
    canGoBack: !!getPreviousStep(wizardState.currentStep, steps),
    canNavigateTo,
    isComplete: isWizardComplete(steps, wizardState.completedSteps),
    isProcessing,
    
    // Acciones de navegación
    goNext,
    goBack,
    goToStep,
    skipStep,
    
    // Gestión de estado
    completeStep,
    resetWizard,
    setStepData,
    getStepData,
    
    // Validación
    validateCurrentStep,
    getValidationErrors,
    
    // Persistencia
    saveState,
    loadState,
    clearSavedState,
    
    // Utilidades
    getCurrentStepIndex,
    getTotalSteps,
    getStepByIndex,
    getReachableSteps,
    
    // Estado interno
    wizardState
  };
};

// ============================================================================
// 🗄️ FUNCIONES DE PERSISTENCIA
// ============================================================================

/**
 * Guarda estado en localStorage
 */
function saveStateToStorage(key: string, state: WizardState): void {
  try {
    if (typeof window === 'undefined') return;
    
    const serialized = JSON.stringify({
      ...state,
      completedSteps: Array.from(state.completedSteps), // Set no es serializable
      timestamp: Date.now()
    });
    
    localStorage.setItem(key, serialized);
  } catch (error) {
    console.warn('Error guardando estado del wizard:', error);
  }
}

/**
 * Carga estado desde localStorage
 */
function loadStateFromStorage(key: string): WizardState | null {
  try {
    if (typeof window === 'undefined') return null;
    
    const saved = localStorage.getItem(key);
    if (!saved) return null;
    
    const parsed = JSON.parse(saved);
    
    // Verificar que no sea muy antiguo (más de 24 horas)
    if (parsed.timestamp && Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(key);
      return null;
    }
    
    return {
      ...parsed,
      completedSteps: new Set(parsed.completedSteps || []) // Restaurar Set
    };
  } catch (error) {
    console.warn('Error cargando estado del wizard:', error);
    return null;
  }
}

/**
 * Limpia estado guardado
 */
function clearSavedStateFromStorage(key: string): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Error limpiando estado del wizard:', error);
  }
}

export default useWizardNavigation;