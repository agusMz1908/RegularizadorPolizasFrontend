import { 
  WizardStepId, 
  WizardStep, 
  WizardState, 
  WizardProgress,
  DEFAULT_WIZARD_STEPS 
} from '../types/wizard/steps';
import { PolizaFormData } from '../types/core/poliza';
declare const process: { env: { NODE_ENV?: string } };

export function getNextStep(currentStep: WizardStepId, steps: WizardStep[]): WizardStepId | null {
  const currentIndex = steps.findIndex(step => step.id === currentStep);
  if (currentIndex === -1 || currentIndex === steps.length - 1) {
    return null;
  }

  for (let i = currentIndex + 1; i < steps.length; i++) {
    const step = steps[i];
    if (!step.disabled) {
      return step.id;
    }
  }

  return null;
}

export function getPreviousStep(currentStep: WizardStepId, steps: WizardStep[]): WizardStepId | null {
  const currentIndex = steps.findIndex(step => step.id === currentStep);
  if (currentIndex <= 0) {
    return null;
  }

  for (let i = currentIndex - 1; i >= 0; i--) {
    const step = steps[i];
    if (!step.disabled) {
      return step.id;
    }
  }

  return null;
}

export function canNavigateToStep(
  targetStep: WizardStepId, 
  currentStep: WizardStepId,
  steps: WizardStep[],
  completedSteps: Set<WizardStepId>
): boolean {
  const targetStepConfig = steps.find(step => step.id === targetStep);
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const targetStepIndex = steps.findIndex(step => step.id === targetStep);

  if (!targetStepConfig || targetStepConfig.disabled) {
    return false;
  }

  if (targetStepIndex < currentStepIndex && completedSteps.has(targetStep)) {
    return true;
  }

  if (targetStepIndex > currentStepIndex) {
    for (let i = 0; i < targetStepIndex; i++) {
      const step = steps[i];
      if (step.required && !completedSteps.has(step.id)) {
        return false;
      }
    }
  }

  return true;
}

export function getReachableSteps(
  currentStep: WizardStepId,
  steps: WizardStep[],
  completedSteps: Set<WizardStepId>
): WizardStepId[] {
  return steps
    .filter(step => canNavigateToStep(step.id, currentStep, steps, completedSteps))
    .map(step => step.id);
}

export function validateStepCompletion(
  stepId: WizardStepId, 
  wizardState: WizardState,
  formData?: PolizaFormData
): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  switch (stepId) {
    case 'cliente':
      if (!wizardState.stepData.cliente?.selectedCliente) {
        errors.push('Debe seleccionar un cliente');
      }
      break;

    case 'company':
      if (!wizardState.stepData.company?.selectedCompany) {
        errors.push('Debe seleccionar una compañía');
      }
      break;

    case 'seccion':
      if (!wizardState.stepData.seccion?.selectedSeccion) {
        errors.push('Debe seleccionar una sección');
      }
      break;

    case 'operacion':
      if (!wizardState.stepData.operacion?.selectedOperacion) {
        errors.push('Debe seleccionar el tipo de operación');
      }
      break;

    case 'upload':
      if (!wizardState.stepData.upload?.uploadedFile) {
        errors.push('Debe subir un archivo PDF');
      }
      if (wizardState.stepData.upload?.uploadError) {
        errors.push('Error en la subida del archivo');
      }
      break;

    case 'extract':
      if (!wizardState.stepData.extract?.extractedData) {
        errors.push('Los datos no han sido procesados');
      }
      if (wizardState.stepData.extract?.processingError) {
        errors.push('Error en el procesamiento');
      }
      if (wizardState.stepData.extract?.confidence && wizardState.stepData.extract.confidence < 0.5) {
        warnings.push('Baja confianza en la extracción de datos');
      }
      break;

    case 'form':
      if (formData) {
        if (!formData.asegurado) errors.push('El nombre del asegurado es requerido');
        if (!formData.numeroPoliza) errors.push('El número de póliza es requerido');
        if (!formData.vigenciaDesde) errors.push('La fecha de inicio es requerida');
        if (!formData.vigenciaHasta) errors.push('La fecha de vencimiento es requerida');
        if (!formData.prima || formData.prima <= 0) errors.push('La prima debe ser mayor a 0');

        if (formData.vigenciaDesde && formData.vigenciaHasta) {
          const fechaInicio = new Date(formData.vigenciaDesde);
          const fechaFin = new Date(formData.vigenciaHasta);
          if (fechaFin <= fechaInicio) {
            errors.push('La fecha de vencimiento debe ser posterior a la fecha de inicio');
          }
        }

        if (formData.documento && !/^\d{7,8}$/.test(formData.documento)) {
          errors.push('El documento debe tener 7 u 8 dígitos');
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          errors.push('El formato del email es inválido');
        }

        if (formData.matricula && !/^[A-Z]{2,3}\d{4}$|^\d{4}[A-Z]{2}$/.test(formData.matricula)) {
          warnings.push('Formato de matrícula inusual para Uruguay');
        }
      } else {
        errors.push('No hay datos del formulario para validar');
      }
      break;

    case 'success':
      break;

    default:
      warnings.push(`Validación no implementada para el paso: ${stepId}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function areRequiredStepsCompleted(
  steps: WizardStep[],
  completedSteps: Set<WizardStepId>
): boolean {
  const requiredSteps = steps.filter(step => step.required);
  return requiredSteps.every(step => completedSteps.has(step.id));
}

export function getFirstStepWithErrors(
  steps: WizardStep[],
  wizardState: WizardState,
  formData?: PolizaFormData
): WizardStepId | null {
  for (const step of steps) {
    const validation = validateStepCompletion(step.id, wizardState, formData);
    if (!validation.isValid) {
      return step.id;
    }
  }
  return null;
}

export function calculateWizardProgress(
  currentStep: WizardStepId,
  steps: WizardStep[],
  completedSteps: Set<WizardStepId>
): WizardProgress {
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const totalSteps = steps.length;
  const completedCount = completedSteps.size;
  
  const effectiveProgress = currentStepIndex + 1;
  
  return {
    currentStepIndex: currentStepIndex,
    totalSteps: totalSteps,
    completedSteps: completedCount,
    percentage: Math.round((effectiveProgress / totalSteps) * 100),
    estimatedTimeRemaining: estimateTimeRemaining(currentStepIndex, totalSteps)
  };
}

function estimateTimeRemaining(currentStepIndex: number, totalSteps: number): number {
  const stepTimes: Record<WizardStepId, number> = {
    'cliente': 1,
    'company': 0.5,
    'seccion': 0.5,
    'operacion': 0.5,
    'upload': 1,
    'extract': 2,
    'form': 5,
    'success': 0.5
  };

  const remainingSteps = totalSteps - currentStepIndex - 1;
  const averageTimePerStep = Object.values(stepTimes).reduce((a, b) => a + b, 0) / Object.keys(stepTimes).length;
  
  return remainingSteps * averageTimePerStep;
}

export function getProgressStats(
  steps: WizardStep[],
  completedSteps: Set<WizardStepId>
): {
  total: number;
  completed: number;
  remaining: number;
  required: number;
  requiredCompleted: number;
  optional: number;
  optionalCompleted: number;
} {
  const requiredSteps = steps.filter(step => step.required);
  const optionalSteps = steps.filter(step => !step.required);
  
  const requiredCompleted = requiredSteps.filter(step => completedSteps.has(step.id)).length;
  const optionalCompleted = optionalSteps.filter(step => completedSteps.has(step.id)).length;

  return {
    total: steps.length,
    completed: completedSteps.size,
    remaining: steps.length - completedSteps.size,
    required: requiredSteps.length,
    requiredCompleted,
    optional: optionalSteps.length,
    optionalCompleted
  };
}

export function updateWizardStateForStep(
  newStep: WizardStepId,
  currentState: WizardState,
  steps: WizardStep[]
): WizardState {
  const updatedSteps = steps.map(step => ({
    ...step,
    current: step.id === newStep,
    completed: currentState.completedSteps.has(step.id)
  }));

  return {
    ...currentState,
    currentStep: newStep,
    previousStep: currentState.currentStep,
    canGoNext: !!getNextStep(newStep, updatedSteps),
    canGoBack: !!getPreviousStep(newStep, updatedSteps)
  };
}

export function markStepAsCompleted(
  stepId: WizardStepId,
  currentState: WizardState,
  formData?: PolizaFormData
): WizardState {
  const validation = validateStepCompletion(stepId, currentState, formData);
  
  if (!validation.isValid) {
    return {
      ...currentState,
      error: `No se puede completar el paso: ${validation.errors.join(', ')}`
    };
  }

  const newCompletedSteps = new Set(currentState.completedSteps);
  newCompletedSteps.add(stepId);

  return {
    ...currentState,
    completedSteps: newCompletedSteps,
    error: null
  };
}

export function resetWizardState(): WizardState {
  return {
    currentStep: 'cliente',
    previousStep: null,
    completedSteps: new Set(),
    stepData: {
      cliente: null,
      company: null, 
      seccion: null,
      operacion: null,
      upload: null,
      extract: null,
      form: null,
      success: null
    },
    isComplete: false,
    canGoNext: true,
    canGoBack: false,
    isProcessing: false,
    error: null
  };
}

export function isWizardComplete(
  steps: WizardStep[],
  completedSteps: Set<WizardStepId>
): boolean {
  const requiredSteps = steps.filter(step => step.required);
  return requiredSteps.every(step => completedSteps.has(step.id));
}

export function createCustomStepConfiguration(
  baseSteps: WizardStep[] = DEFAULT_WIZARD_STEPS,
  overrides: Partial<Record<WizardStepId, Partial<WizardStep>>> = {}
): WizardStep[] {
  return baseSteps.map(step => ({
    ...step,
    ...overrides[step.id]
  }));
}

export function updateStepAvailability(
  steps: WizardStep[],
  conditions: Partial<Record<WizardStepId, boolean>>
): WizardStep[] {
  return steps.map(step => ({
    ...step,
    disabled: conditions[step.id] !== undefined ? !conditions[step.id] : step.disabled
  }));
}

export function getStepsForOperationType(operationType: string): WizardStep[] {
  const baseSteps = [...DEFAULT_WIZARD_STEPS];

  switch (operationType) {
    case 'Nuevo':
      return baseSteps;

    case 'Renovacion':
      return baseSteps.map(step => ({
        ...step,
        required: step.id === 'cliente' ? false : step.required
      }));

    case 'Endoso':
      return baseSteps.map(step => ({
        ...step,
        disabled: step.id === 'upload' ? true : step.disabled,
        skippable: step.id === 'extract' ? true : step.skippable
      }));

    case 'Cancelacion':
      return baseSteps.filter(step => 
        ['cliente', 'company', 'seccion', 'form', 'success'].includes(step.id)
      );

    default:
      return baseSteps;
  }
}

export function getStepUrl(stepId: WizardStepId, baseUrl: string = '/wizard'): string {
  return `${baseUrl}/${stepId}`;
}

export function parseStepFromUrl(url: string, baseUrl: string = '/wizard'): WizardStepId | null {
  const stepPart = url.replace(baseUrl + '/', '');
  const validSteps: WizardStepId[] = ['cliente', 'company', 'seccion', 'operacion', 'upload', 'extract', 'form', 'success'];
  
  return validSteps.includes(stepPart as WizardStepId) ? stepPart as WizardStepId : null;
}

export function getKeyboardShortcuts(): Record<string, { action: string; description: string }> {
  return {
    'ArrowRight': { action: 'next', description: 'Ir al siguiente paso' },
    'ArrowLeft': { action: 'previous', description: 'Ir al paso anterior' },
    'Enter': { action: 'continue', description: 'Continuar (Ctrl+Enter)' },
    'Escape': { action: 'cancel', description: 'Cancelar wizard' },
    'Home': { action: 'first', description: 'Ir al primer paso' },
    'End': { action: 'last', description: 'Ir al último paso' }
  };
}

export function logWizardState(state: WizardState, steps: WizardStep[]): void {
  if (process.env.NODE_ENV === 'development') {
    console.group('🧙‍♂️ Wizard State');
    console.log('Current Step:', state.currentStep);
    console.log('Previous Step:', state.previousStep);
    console.log('Completed Steps:', Array.from(state.completedSteps));
    console.log('Can Go Next:', state.canGoNext);
    console.log('Can Go Back:', state.canGoBack);
    console.log('Is Processing:', state.isProcessing);
    console.log('Error:', state.error);
    console.log('Progress:', calculateWizardProgress(state.currentStep, steps, state.completedSteps));
    console.groupEnd();
  }
}

export function validateStepConfiguration(steps: WizardStep[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  const ids = steps.map(step => step.id);
  const uniqueIds = new Set(ids);
  if (ids.length !== uniqueIds.size) {
    errors.push('Los IDs de pasos deben ser únicos');
  }

  const orders = steps.map(step => step.order);
  const sortedOrders = [...orders].sort((a, b) => a - b);
  if (JSON.stringify(orders) !== JSON.stringify(sortedOrders)) {
    errors.push('El orden de los pasos debe ser secuencial');
  }

  if (steps.length === 0) {
    errors.push('Debe haber al menos un paso configurado');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export default {
  getNextStep,
  getPreviousStep,
  canNavigateToStep,
  getReachableSteps,
  
  validateStepCompletion,
  areRequiredStepsCompleted,
  getFirstStepWithErrors,
  
  calculateWizardProgress,
  getProgressStats,
  
  updateWizardStateForStep,
  markStepAsCompleted,
  resetWizardState,
  isWizardComplete,

  createCustomStepConfiguration,
  updateStepAvailability,
  getStepsForOperationType,

  getStepUrl,
  parseStepFromUrl,
  getKeyboardShortcuts,
  
  logWizardState,
  validateStepConfiguration
};