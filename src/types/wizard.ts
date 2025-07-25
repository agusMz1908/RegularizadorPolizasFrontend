// src/types/wizard.ts

import { PolizaFormData } from './core/poliza';

// ============================================================================
// 🧭 TIPOS DE NAVEGACIÓN DEL WIZARD
// ============================================================================

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
  name: string;
  title: string;
  description: string;
  icon?: string;
  required: boolean;
  disabled?: boolean;
  skippable?: boolean;
  order: number;
}

export interface WizardStepData {
  cliente: any;
  company: any;
  seccion: any;
  operacion: any;
  upload: any;
  extract: any;
  form: PolizaFormData | null;
  success: any;
}

export interface WizardState {
  currentStep: WizardStepId;
  previousStep: WizardStepId | null;
  completedSteps: Set<WizardStepId>;
  stepData: WizardStepData;
  isComplete: boolean;
  canGoNext: boolean;
  canGoBack: boolean;
  isProcessing: boolean;
  error: string | null;
}

// ============================================================================
// 🎯 CONFIGURACIÓN DEL WIZARD
// ============================================================================

export const DEFAULT_WIZARD_STEPS: WizardStep[] = [
  {
    id: 'cliente',
    name: 'Cliente',
    title: 'Seleccionar Cliente',
    description: 'Busque y seleccione el cliente para la póliza',
    icon: '👤',
    required: true,
    order: 1
  },
  {
    id: 'company',
    name: 'Compañía',
    title: 'Seleccionar Compañía',
    description: 'Elija la compañía aseguradora',
    icon: '🏢',
    required: true,
    order: 2
  },
  {
    id: 'seccion',
    name: 'Sección',
    title: 'Tipo de Seguro',
    description: 'Seleccione el tipo de seguro',
    icon: '📋',
    required: true,
    order: 3
  },
  {
    id: 'operacion',
    name: 'Operación',
    title: 'Tipo de Operación',
    description: 'Defina si es nueva póliza, renovación, etc.',
    icon: '⚙️',
    required: true,
    order: 4
  },
  {
    id: 'upload',
    name: 'Subir',
    title: 'Subir Documentos',
    description: 'Suba la póliza en PDF para procesarla',
    icon: '📤',
    required: true,
    order: 5
  },
  {
    id: 'extract',
    name: 'Extraer',
    title: 'Procesamiento IA',
    description: 'Extracción automática de datos con IA',
    icon: '🤖',
    required: false,
    order: 6
  },
  {
    id: 'form',
    name: 'Formulario',
    title: 'Validar Datos',
    description: 'Revise y complete los datos de la póliza',
    icon: '📝',
    required: true,
    order: 7
  },
  {
    id: 'success',
    name: 'Finalizar',
    title: 'Proceso Completado',
    description: 'Póliza procesada exitosamente',
    icon: '✅',
    required: false,
    order: 8
  }
];

// ============================================================================
// 🔄 TIPOS DE NAVEGACIÓN
// ============================================================================

export interface NavigationContext {
  allowSkip?: boolean;
  requireValidation?: boolean;
  autoAdvance?: boolean;
  preventBack?: boolean;
}

export interface NavigationResult {
  success: boolean;
  targetStep: WizardStepId;
  error?: string;
  warnings?: string[];
}

// ============================================================================
// 🎮 TIPOS DE EVENTOS
// ============================================================================

export interface WizardEvent {
  type: 'step_change' | 'validation' | 'error' | 'complete';
  payload: any;
  timestamp: Date;
}

export interface StepChangeEvent extends WizardEvent {
  type: 'step_change';
  payload: {
    from: WizardStepId;
    to: WizardStepId;
    direction: 'forward' | 'backward';
  };
}

export interface ValidationEvent extends WizardEvent {
  type: 'validation';
  payload: {
    step: WizardStepId;
    isValid: boolean;
    errors: string[];
  };
}

export interface ErrorEvent extends WizardEvent {
  type: 'error';
  payload: {
    step: WizardStepId;
    error: string;
    recoverable: boolean;
  };
}

export interface CompleteEvent extends WizardEvent {
  type: 'complete';
  payload: {
    formData: PolizaFormData;
    completedAt: Date;
    duration: number;
  };
}

// ============================================================================
// 📊 TIPOS DE PROGRESO
// ============================================================================

export interface WizardProgress {
  currentStepIndex: number;
  totalSteps: number;
  completedSteps: number;
  percentage: number;
  estimatedTimeRemaining?: number;
}

export interface StepValidationResult {
  stepId: WizardStepId;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  canProceed: boolean;
}

// ============================================================================
// 🔧 CONFIGURACIÓN AVANZADA
// ============================================================================

export interface WizardConfig {
  steps: WizardStep[];
  allowSkipping: boolean;
  requireStepValidation: boolean;
  enablePersistence: boolean;
  persistenceKey: string;
  enableAnalytics: boolean;
  enableKeyboardNavigation: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

export interface WizardTheme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  successColor: string;
  errorColor: string;
  warningColor: string;
}

// ============================================================================
// 📱 RESPONSIVE TYPES
// ============================================================================

export interface WizardBreakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
}

export type WizardLayout = 'horizontal' | 'vertical' | 'compact';

export interface ResponsiveConfig {
  breakpoints: WizardBreakpoints;
  layouts: Record<string, WizardLayout>;
  showStepLabels: Record<string, boolean>;
}

// ============================================================================
// 🔄 EXPORTS - ALTERNATIVA ORGANIZADA
// ============================================================================

// ✅ Export de tipos (ya están exportados arriba individualmente)

// ✅ Export de constantes y valores
export const WIZARD_DEFAULTS = {
  STEPS: DEFAULT_WIZARD_STEPS
};

export const WIZARD_CONSTANTS = {
  STEP_IDS: {
    CLIENTE: 'cliente' as const,
    COMPANY: 'company' as const,
    SECCION: 'seccion' as const,
    OPERACION: 'operacion' as const,
    UPLOAD: 'upload' as const,
    EXTRACT: 'extract' as const,
    FORM: 'form' as const,
    SUCCESS: 'success' as const
  }
};

// ✅ Default export solo con valores
export default {
  DEFAULT_WIZARD_STEPS,
  WIZARD_DEFAULTS,
  WIZARD_CONSTANTS
};