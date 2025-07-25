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
  calculateWizardProgress,
  updateWizardStateForStep,
  markStepAsCompleted,
  resetWizardState,
  isWizardComplete,
  logWizardState,
  getStepsForOperationType
} from '../../utils/stepHelpers';
import {
  validateStepCompletion,
  areRequiredStepsCompleted,
  getFirstStepWithErrors
} from '../../utils/stepValidation';
import {
  saveStateToStorage,
  loadStateFromStorage,
  clearSavedStateFromStorage
} from '../../utils/storageHelper';

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

  // Estados derivados
  const canGoNext = !!getNextStep(wizardState.currentStep, steps);
  const canGoBack = !!getPreviousStep(wizardState.currentStep, steps);
  const isComplete = isWizardComplete(steps, wizardState.completedSteps);

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

      // Obtener siguiente paso
      const nextStep = getNextStep(wizardState.currentStep, steps);
      if (!nextStep) return false;

      // Marcar paso actual como completado
      const newCompletedSteps = new Set(wizardState.completedSteps);
      newCompletedSteps.add(wizardState.currentStep);

      // Actualizar estado
      const newState: WizardState = {
        ...wizardState,
        currentStep: nextStep,
        previousStep: wizardState.currentStep,
        completedSteps: newCompletedSteps,
        error: null
      };

      setWizardState(newState);
      setValidationErrors([]);

      // Callbacks
      onStepChange?.(nextStep, wizardState.currentStep);
      
      if (enableLogging) {
        logWizardState(newState, steps);
      }

      return true;

    } catch (error) {
      console.error('Error en navegación:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [wizardState, steps, isProcessing, enableValidation, enableLogging, onStepChange, onValidationError]);

  /**
   * Navega al paso anterior
   */
  const goBack = useCallback((): void => {
    const prevStep = getPreviousStep(wizardState.currentStep, steps);
    if (!prevStep) return;

    const newState: WizardState = {
      ...wizardState,
      currentStep: prevStep,
      previousStep: wizardState.currentStep,
      error: null
    };

    setWizardState(newState);
    setValidationErrors([]);

    onStepChange?.(prevStep, wizardState.currentStep);
    
    if (enableLogging) {
      logWizardState(newState, steps);
    }
  }, [wizardState, steps, enableLogging, onStepChange]);

  /**
   * Navega a un paso específico
   */
  const goToStep = useCallback(async (targetStep: WizardStepId): Promise<boolean> => {
    if (isProcessing) return false;
    if (!canNavigateToStep(targetStep, wizardState.currentStep, steps, wizardState.completedSteps)) {
      return false;
    }

    setIsProcessing(true);

    try {
      const newState: WizardState = {
        ...wizardState,
        currentStep: targetStep,
        previousStep: wizardState.currentStep,
        error: null
      };

      setWizardState(newState);
      setValidationErrors([]);

      onStepChange?.(targetStep, wizardState.currentStep);
      
      if (enableLogging) {
        logWizardState(newState, steps);
      }

      return true;

    } catch (error) {
      console.error('Error navegando a paso:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [wizardState, steps, isProcessing, enableLogging, onStepChange]);

  /**
   * Salta el paso actual
   */
  const skipStep = useCallback(async (): Promise<boolean> => {
    const currentStepConfig = steps.find(s => s.id === wizardState.currentStep);
    if (!currentStepConfig?.skippable) return false;

    return goNext();
  }, [wizardState.currentStep, steps, goNext]);

  // ============================================================================
  // 📊 GESTIÓN DE ESTADO
  // ============================================================================

  /**
   * Completa un paso con datos
   */
  const completeStep = useCallback(async (stepId: WizardStepId, data?: any): Promise<boolean> => {
    try {
      // Actualizar datos del paso
      const newStepData = {
        ...wizardState.stepData,
        [stepId]: data
      };

      // Marcar como completado
      const newCompletedSteps = new Set(wizardState.completedSteps);
      newCompletedSteps.add(stepId);

      const newState: WizardState = {
        ...wizardState,
        stepData: newStepData,
        completedSteps: newCompletedSteps
      };

      setWizardState(newState);

      // Callback
      onStepComplete?.(stepId, data);

      // Verificar si el wizard está completo
      if (isWizardComplete(steps, newCompletedSteps)) {
        onWizardComplete?.(newState);
      }

      return true;

    } catch (error) {
      console.error('Error completando paso:', error);
      return false;
    }
  }, [wizardState, steps, onStepComplete, onWizardComplete]);

  /**
   * Reinicia el wizard
   */
  const resetWizard = useCallback((): void => {
    const newState = resetWizardState();
    setWizardState(newState);
    setValidationErrors([]);
    
    if (enablePersistence) {
      clearSavedStateFromStorage(storageKey);
    }
  }, [enablePersistence, storageKey]);

  /**
   * Establece datos de un paso
   */
  const setStepData = useCallback((stepId: WizardStepId, data: any): void => {
    const newStepData = {
      ...wizardState.stepData,
      [stepId]: data
    };

    setWizardState(prev => ({
      ...prev,
      stepData: newStepData
    }));
  }, [wizardState.stepData]);

  /**
   * Obtiene datos de un paso
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

  // Auto-guardar cuando cambie el estado (si está habilitado)
  useEffect(() => {
    if (enablePersistence && wizardState) {
      saveStateToStorage(storageKey, wizardState);
    }
  }, [wizardState, enablePersistence, storageKey]);

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
    canGoNext,
    canGoBack,
    canNavigateTo,
    isComplete,
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
    
    // Estado interno para debugging
    wizardState
  };
};

export default useWizardNavigation;