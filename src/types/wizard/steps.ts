export type WizardStepId = 
  | 'cliente' 
  | 'company' 
  | 'seccion' 
  | 'operacion' 
  | 'upload' 
  | 'extract' 
  | 'form' 
  | 'success';

export interface WizardStep {
  id: WizardStepId;
  title: string;
  description: string;
  icon: string;
  order: number;
  required: boolean;
  completed: boolean;
  current: boolean;
  disabled: boolean;
  skippable: boolean;
}

// ✅ Estado del wizard
export interface WizardState {
  currentStep: WizardStepId;
  previousStep: WizardStepId | null;
  completedSteps: Set<WizardStepId>;
  stepData: Record<WizardStepId, any>;
  isComplete: boolean;
  canGoNext: boolean;
  canGoBack: boolean;
  isProcessing: boolean;
  error: string | null;
}

// ✅ Configuración del wizard
export interface WizardConfig {
  steps: WizardStep[];
  allowSkipping: boolean;
  showProgress: boolean;
  saveProgress: boolean;
  storageKey: string;
  onStepChange?: (step: WizardStepId) => void;
  onComplete?: (data: any) => void;
  onError?: (error: string) => void;
}

// ✅ Progreso del wizard
export interface WizardProgress {
  currentStepIndex: number;
  totalSteps: number;
  completedSteps: number;
  percentage: number;
  estimatedTimeRemaining?: number;
  canProgress: boolean;
  nextStep: WizardStepId | null;
  previousStep: WizardStepId | null;
}

// ✅ Configuración por defecto de los pasos
export const DEFAULT_WIZARD_STEPS: WizardStep[] = [
  {
    id: 'cliente',
    title: 'Cliente',
    description: 'Seleccionar cliente para la póliza',
    icon: 'user',
    order: 1,
    required: true,
    completed: false,
    current: true,
    disabled: false,
    skippable: false
  },
  {
    id: 'company',
    title: 'Compañía',
    description: 'Seleccionar compañía de seguros',
    icon: 'building',
    order: 2,
    required: true,
    completed: false,
    current: false,
    disabled: false,
    skippable: false
  },
  {
    id: 'seccion',
    title: 'Sección',
    description: 'Seleccionar sección de la póliza',
    icon: 'folder',
    order: 3,
    required: true,
    completed: false,
    current: false,
    disabled: false,
    skippable: false
  },
  {
    id: 'operacion',
    title: 'Operación',
    description: 'Tipo de operación a realizar',
    icon: 'settings',
    order: 4,
    required: true,
    completed: false,
    current: false,
    disabled: false,
    skippable: false
  },
  {
    id: 'upload',
    title: 'Subir Archivos',
    description: 'Cargar documentos de la póliza',
    icon: 'upload',
    order: 5,
    required: true,
    completed: false,
    current: false,
    disabled: false,
    skippable: false
  },
  {
    id: 'extract',
    title: 'Extraer Datos',
    description: 'Procesamiento automático con IA',
    icon: 'cpu',
    order: 6,
    required: true,
    completed: false,
    current: false,
    disabled: false,
    skippable: true
  },
  {
    id: 'form',
    title: 'Completar Datos',
    description: 'Validar y completar información',
    icon: 'edit',
    order: 7,
    required: true,
    completed: false,
    current: false,
    disabled: false,
    skippable: false
  },
  {
    id: 'success',
    title: 'Finalizado',
    description: 'Póliza procesada exitosamente',
    icon: 'check-circle',
    order: 8,
    required: false,
    completed: false,
    current: false,
    disabled: false,
    skippable: false
  }
];

// ✅ Tipos para navegación
export interface StepTransition {
  from: WizardStepId;
  to: WizardStepId;
  condition?: (state: WizardState) => boolean;
  validation?: (state: WizardState) => { isValid: boolean; errors: string[] };
}

// ✅ Configuraciones por tipo de operación
export interface OperationStepConfig {
  operationType: string;
  steps: WizardStepId[];
  skipSteps?: WizardStepId[];
  requiredSteps?: WizardStepId[];
  customValidations?: Record<WizardStepId, (state: WizardState) => boolean>;
}

export const OPERATION_STEP_CONFIGS: Record<string, OperationStepConfig> = {
  'Nuevo': {
    operationType: 'Nuevo',
    steps: ['cliente', 'company', 'seccion', 'operacion', 'upload', 'extract', 'form', 'success'],
    requiredSteps: ['cliente', 'company', 'seccion', 'operacion', 'upload', 'form']
  },
  'Renovacion': {
    operationType: 'Renovacion',
    steps: ['cliente', 'company', 'seccion', 'operacion', 'upload', 'extract', 'form', 'success'],
    requiredSteps: ['company', 'seccion', 'operacion', 'upload', 'form']
  },
  'Endoso': {
    operationType: 'Endoso',
    steps: ['cliente', 'company', 'seccion', 'operacion', 'form', 'success'],
    skipSteps: ['upload', 'extract'],
    requiredSteps: ['cliente', 'company', 'seccion', 'operacion', 'form']
  },
  'Cancelacion': {
    operationType: 'Cancelacion',
    steps: ['cliente', 'company', 'seccion', 'form', 'success'],
    requiredSteps: ['cliente', 'company', 'seccion', 'form']
  }
};

// ✅ Constantes para iconos (usando lucide-react)
export const STEP_ICONS: Record<WizardStepId, string> = {
  cliente: 'user',
  company: 'building',
  seccion: 'folder',
  operacion: 'settings',
  upload: 'upload',
  extract: 'cpu',
  form: 'edit',
  success: 'check-circle'
};

// ✅ Mensajes por defecto
export const STEP_MESSAGES = {
  LOADING: 'Cargando...',
  PROCESSING: 'Procesando...',
  COMPLETED: 'Completado',
  ERROR: 'Error',
  REQUIRED: 'Este campo es requerido',
  INVALID: 'Datos inválidos',
  SUCCESS: 'Operación exitosa'
};

// ✅ Configuración de timeouts
export const WIZARD_TIMEOUTS = {
  AUTO_SAVE: 30000, // 30 segundos
  SESSION_TIMEOUT: 1800000, // 30 minutos
  PROCESSING_TIMEOUT: 300000, // 5 minutos
  VALIDATION_DEBOUNCE: 500 // 500ms
};

// ✅ Estados de validación
export type ValidationStatus = 'idle' | 'validating' | 'valid' | 'invalid' | 'error';

export interface StepValidationState {
  status: ValidationStatus;
  errors: string[];
  warnings: string[];
  lastValidated?: Date;
}

// ✅ Métricas del wizard
export interface WizardMetrics {
  startTime: Date;
  endTime?: Date;
  currentStepStartTime: Date;
  stepTimes: Record<WizardStepId, number>;
  totalTime: number;
  errorCount: number;
  retryCount: number;
  completionRate: number;
}

// ✅ Eventos del wizard
export type WizardEvent = 
  | 'step-enter'
  | 'step-exit'
  | 'step-complete'
  | 'step-error'
  | 'wizard-start'
  | 'wizard-complete'
  | 'wizard-error'
  | 'wizard-reset';

export interface WizardEventData {
  event: WizardEvent;
  stepId?: WizardStepId;
  timestamp: Date;
  data?: any;
  error?: Error;
}

// ✅ Hooks y utilidades para types
export interface WizardHookConfig {
  initialStep?: WizardStepId;
  steps?: WizardStep[];
  operationType?: string;
  enablePersistence?: boolean;
  enableValidation?: boolean;
  enableLogging?: boolean;
  enableMetrics?: boolean;
  autoSave?: boolean;
  sessionTimeout?: number;
  storageKey?: string;
}

// ✅ Contexto del wizard
export interface WizardContextValue {
  state: WizardState;
  steps: WizardStep[];
  progress: WizardProgress;
  config: WizardHookConfig;
  actions: {
    goNext: () => Promise<boolean>;
    goBack: () => void;
    goToStep: (step: WizardStepId) => Promise<boolean>;
    completeStep: (stepId: WizardStepId, data?: any) => Promise<boolean>;
    resetWizard: () => void;
    setStepData: (stepId: WizardStepId, data: any) => void;
  };
  validation: {
    validateCurrentStep: (formData?: any) => boolean;
    getValidationErrors: () => string[];
    isStepValid: (stepId: WizardStepId) => boolean;
  };
  persistence: {
    saveState: () => void;
    loadState: () => boolean;
    clearSavedState: () => void;
    hasStoredState: () => boolean;
  };
}

export default {
  DEFAULT_WIZARD_STEPS,
  OPERATION_STEP_CONFIGS,
  STEP_ICONS,
  STEP_MESSAGES,
  WIZARD_TIMEOUTS
};