// src/utils/stepHelpers.ts - FUNCIONES FALTANTES IMPLEMENTADAS

import { 
  WizardStepId, 
  WizardStep, 
  WizardState, 
  WizardProgress,
  DEFAULT_WIZARD_STEPS 
} from '../types/wizard/steps';
import { PolizaFormData } from '../types/core/poliza';

declare const process: { env: { NODE_ENV?: string } };

// ============================================================================
// 🧭 FUNCIONES DE NAVEGACIÓN
// ============================================================================

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

  // Permitir ir hacia atrás si el paso ya fue completado
  if (targetStepIndex < currentStepIndex && completedSteps.has(targetStep)) {
    return true;
  }

  // Para ir hacia adelante, verificar que los pasos requeridos estén completos
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

// ============================================================================
// 📊 FUNCIONES DE PROGRESO
// ============================================================================

export function calculateWizardProgress(
  currentStep: WizardStepId,
  steps: WizardStep[],
  completedSteps: Set<WizardStepId>
): WizardProgress {
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const totalSteps = steps.length;
  const completedCount = completedSteps.size;
  const percentage = Math.round((completedCount / totalSteps) * 100);

  return {
    currentStepIndex,
    totalSteps,
    completedSteps: completedCount,
    percentage,
    canProgress: currentStepIndex < totalSteps - 1,
    nextStep: getNextStep(currentStep, steps),
    previousStep: getPreviousStep(currentStep, steps)
  };
}

export function getProgressStats(
  steps: WizardStep[],
  completedSteps: Set<WizardStepId>
): {
  total: number;
  completed: number;
  remaining: number;
  percentage: number;
  requiredCompleted: number;
  requiredRemaining: number;
} {
  const total = steps.length;
  const completed = completedSteps.size;
  const remaining = total - completed;
  const percentage = Math.round((completed / total) * 100);

  const requiredSteps = steps.filter(step => step.required);
  const requiredCompleted = requiredSteps.filter(step => completedSteps.has(step.id)).length;
  const requiredRemaining = requiredSteps.length - requiredCompleted;

  return {
    total,
    completed,
    remaining,
    percentage,
    requiredCompleted,
    requiredRemaining
  };
}

// ============================================================================
// 🔄 FUNCIONES DE ESTADO
// ============================================================================

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
    canGoNext: !!getNextStep(newStep, updatedSteps),
    canGoBack: !!getPreviousStep(newStep, updatedSteps)
  };
}

export function markStepAsCompleted(
  stepId: WizardStepId,
  currentState: WizardState,
  formData?: PolizaFormData
): WizardState {
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

// ============================================================================
// ⚙️ FUNCIONES DE CONFIGURACIÓN
// ============================================================================

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

// ============================================================================
// 🔗 FUNCIONES DE URL
// ============================================================================

export function getStepUrl(stepId: WizardStepId, baseUrl: string = '/wizard'): string {
  return `${baseUrl}/${stepId}`;
}

export function parseStepFromUrl(url: string, baseUrl: string = '/wizard'): WizardStepId | null {
  const stepPart = url.replace(baseUrl + '/', '');
  const validSteps: WizardStepId[] = ['cliente', 'company', 'seccion', 'operacion', 'upload', 'extract', 'form', 'success'];
  
  return validSteps.includes(stepPart as WizardStepId) ? stepPart as WizardStepId : null;
}

// ============================================================================
// ⌨️ FUNCIONES DE NAVEGACIÓN POR TECLADO
// ============================================================================

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

// ============================================================================
// 🐛 FUNCIONES DE DEBUG
// ============================================================================

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

// ============================================================================
// 📈 FUNCIONES DE MÉTRICAS
// ============================================================================

export function calculateStepMetrics(
  stepId: WizardStepId,
  startTime: Date,
  endTime: Date = new Date()
): {
  stepId: WizardStepId;
  duration: number;
  startTime: Date;
  endTime: Date;
} {
  return {
    stepId,
    duration: endTime.getTime() - startTime.getTime(),
    startTime,
    endTime
  };
}

export function getWizardPerformanceMetrics(
  completedSteps: Set<WizardStepId>,
  stepTimes: Record<WizardStepId, number>,
  totalStartTime: Date
): {
  totalSteps: number;
  completedSteps: number;
  totalTime: number;
  averageStepTime: number;
  fastestStep: { stepId: WizardStepId; time: number } | null;
  slowestStep: { stepId: WizardStepId; time: number } | null;
  completionRate: number;
} {
  const totalSteps = DEFAULT_WIZARD_STEPS.length;
  const completed = completedSteps.size;
  const totalTime = Date.now() - totalStartTime.getTime();
  
  const stepTimeArray = Object.entries(stepTimes).map(([stepId, time]) => ({ 
    stepId: stepId as WizardStepId, 
    time 
  }));
  
  const averageStepTime = stepTimeArray.length > 0 
    ? stepTimeArray.reduce((sum, item) => sum + item.time, 0) / stepTimeArray.length
    : 0;

  const fastestStep = stepTimeArray.length > 0 
    ? stepTimeArray.reduce((fastest, current) => current.time < fastest.time ? current : fastest)
    : null;

  const slowestStep = stepTimeArray.length > 0 
    ? stepTimeArray.reduce((slowest, current) => current.time > slowest.time ? current : slowest)
    : null;

  return {
    totalSteps,
    completedSteps: completed,
    totalTime,
    averageStepTime,
    fastestStep,
    slowestStep,
    completionRate: (completed / totalSteps) * 100
  };
}

// ============================================================================
// 🔄 FUNCIONES DE SINCRONIZACIÓN
// ============================================================================

export function syncWizardStateWithUrl(
  currentUrl: string,
  wizardState: WizardState,
  baseUrl: string = '/wizard'
): { shouldSync: boolean; targetStep: WizardStepId | null } {
  const urlStep = parseStepFromUrl(currentUrl, baseUrl);
  
  if (!urlStep) {
    return { shouldSync: false, targetStep: null };
  }

  if (urlStep !== wizardState.currentStep) {
    return { shouldSync: true, targetStep: urlStep };
  }

  return { shouldSync: false, targetStep: null };
}

export function generateWizardStateChecksum(state: WizardState): string {
  const stateString = JSON.stringify({
    currentStep: state.currentStep,
    completedSteps: Array.from(state.completedSteps).sort(),
    stepDataKeys: Object.keys(state.stepData).sort()
  });
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < stateString.length; i++) {
    const char = stateString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return hash.toString(36);
}

// ============================================================================
// 🔧 FUNCIONES DE UTILIDAD
// ============================================================================

export function getStepDisplayName(stepId: WizardStepId): string {
  const stepNames: Record<WizardStepId, string> = {
    cliente: 'Cliente',
    company: 'Compañía',
    seccion: 'Sección',
    operacion: 'Operación',
    upload: 'Subir Archivos',
    extract: 'Extraer Datos',
    form: 'Completar Formulario',
    success: 'Finalizado'
  };
  
  return stepNames[stepId] || stepId;
}

export function getStepDescription(stepId: WizardStepId): string {
  const descriptions: Record<WizardStepId, string> = {
    cliente: 'Seleccionar el cliente para la póliza',
    company: 'Elegir la compañía de seguros',
    seccion: 'Definir la sección de la póliza',
    operacion: 'Especificar el tipo de operación',
    upload: 'Cargar los documentos necesarios',
    extract: 'Extraer datos automáticamente',
    form: 'Completar y validar la información',
    success: 'Proceso completado exitosamente'
  };
  
  return descriptions[stepId] || 'Descripción no disponible';
}

export function isStepAccessible(
  stepId: WizardStepId,
  completedSteps: Set<WizardStepId>,
  steps: WizardStep[]
): boolean {
  const step = steps.find(s => s.id === stepId);
  if (!step || step.disabled) {
    return false;
  }

  // Si el paso ya fue completado, siempre es accesible
  if (completedSteps.has(stepId)) {
    return true;
  }

  // Verificar dependencias previas
  const stepIndex = steps.findIndex(s => s.id === stepId);
  for (let i = 0; i < stepIndex; i++) {
    const prevStep = steps[i];
    if (prevStep.required && !completedSteps.has(prevStep.id)) {
      return false;
    }
  }

  return true;
}

export function getNextRequiredStep(
  currentStep: WizardStepId,
  steps: WizardStep[],
  completedSteps: Set<WizardStepId>
): WizardStepId | null {
  const currentIndex = steps.findIndex(step => step.id === currentStep);
  
  for (let i = currentIndex + 1; i < steps.length; i++) {
    const step = steps[i];
    if (step.required && !completedSteps.has(step.id) && !step.disabled) {
      return step.id;
    }
  }
  
  return null;
}

export function getIncompleteRequiredSteps(
  steps: WizardStep[],
  completedSteps: Set<WizardStepId>
): WizardStepId[] {
  return steps
    .filter(step => step.required && !completedSteps.has(step.id) && !step.disabled)
    .map(step => step.id);
}

// ============================================================================
// 📤 EXPORT DEFAULT
// ============================================================================

export default {
  // Navegación
  getNextStep,
  getPreviousStep,
  canNavigateToStep,
  getReachableSteps,
  
  // Progreso
  calculateWizardProgress,
  getProgressStats,
  
  // Estado
  updateWizardStateForStep,
  markStepAsCompleted,
  resetWizardState,
  isWizardComplete,

  // Configuración
  createCustomStepConfiguration,
  updateStepAvailability,
  getStepsForOperationType,

  // URL
  getStepUrl,
  parseStepFromUrl,
  getKeyboardShortcuts,
  
  // Debug
  logWizardState,
  validateStepConfiguration,

  // Métricas
  calculateStepMetrics,
  getWizardPerformanceMetrics,

  // Sincronización
  syncWizardStateWithUrl,
  generateWizardStateChecksum,

  // Utilidades
  getStepDisplayName,
  getStepDescription,
  isStepAccessible,
  getNextRequiredStep,
  getIncompleteRequiredSteps
};