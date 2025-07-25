// src/types/ui/steps.ts

// ✅ Tipos de pasos del wizard
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
}

// ✅ Navegación del wizard
export interface WizardNavigation {
  goToStep: (stepId: WizardStepId) => void;
  goNext: () => void;
  goBack: () => void;
  skipStep: () => void;
  restart: () => void;
  canNavigateToStep: (stepId: WizardStepId) => boolean;
}

// ✅ Datos específicos de cada paso
export interface ClienteStepData {
  selectedCliente: any | null;
  searchTerm: string;
  searchResults: any[];
  isSearching: boolean;
}

export interface CompanyStepData {
  selectedCompany: any | null;
  availableCompanies: any[];
  isLoading: boolean;
}

export interface SeccionStepData {
  selectedSeccion: any | null;
  availableSecciones: any[];
  isLoading: boolean;
}

export interface OperacionStepData {
  selectedOperacion: string | null;
  operacionConfig: any | null;
  autoDetected: boolean;
}

export interface UploadStepData {
  uploadedFile: File | null;
  uploadProgress: number;
  isUploading: boolean;
  uploadError: string | null;
}

export interface ExtractStepData {
  extractedData: any | null;
  isProcessing: boolean;
  processingProgress: number;
  processingError: string | null;
  confidence: number;
}

export interface FormStepData {
  formData: any;
  validation: any;
  activeTab: string;
  isSaving: boolean;
  saveError: string | null;
}

export interface SuccessStepData {
  result: any;
  polizaCreated: any | null;
  nextActions: string[];
}

// ✅ Unión de todos los datos de pasos
export type StepData = 
  | ClienteStepData
  | CompanyStepData  
  | SeccionStepData
  | OperacionStepData
  | UploadStepData
  | ExtractStepData
  | FormStepData
  | SuccessStepData;

// ✅ Eventos del wizard
export interface WizardEvent {
  type: 'step_change' | 'step_complete' | 'step_error' | 'wizard_complete' | 'wizard_error';
  stepId: WizardStepId;
  data?: any;
  timestamp: Date;
}

// ✅ Metadatos del wizard
export interface WizardMetadata {
  sessionId: string;
  startTime: Date;
  lastActivity: Date;
  userAgent: string;
  source: 'manual' | 'automated' | 'imported';
  version: string;
}

// ✅ Resultado final del wizard
export interface WizardResult {
  success: boolean;
  data: any;
  metadata: WizardMetadata;
  completionTime: Date;
  totalDuration: number;
  stepsCompleted: WizardStepId[];
  errors: string[];
  warnings: string[];
}

// ✅ Configuraciones predefinidas
export const DEFAULT_WIZARD_STEPS: WizardStep[] = [
  {
    id: 'cliente',
    title: 'Seleccionar Cliente',
    description: 'Buscar y seleccionar el cliente',
    icon: 'Users',
    order: 1,
    required: true,
    completed: false,
    current: false,
    disabled: false,
    skippable: false
  },
  {
    id: 'company',
    title: 'Compañía',
    description: 'Seleccionar compañía aseguradora',
    icon: 'Building2',
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
    description: 'Seleccionar sección',
    icon: 'Target',
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
    description: 'Tipo de operación',
    icon: 'Settings',
    order: 4,
    required: true,
    completed: false,
    current: false,
    disabled: false,
    skippable: false
  },
  {
    id: 'upload',
    title: 'Subir Archivo',
    description: 'Cargar documento de póliza',
    icon: 'Upload',
    order: 5,
    required: true,
    completed: false,
    current: false,
    disabled: false,
    skippable: false
  },
  {
    id: 'extract',
    title: 'Procesamiento',
    description: 'Extraer datos con IA',
    icon: 'Cpu',
    order: 6,
    required: true,
    completed: false,
    current: false,
    disabled: false,
    skippable: false
  },
  {
    id: 'form',
    title: 'Formulario',
    description: 'Revisar y completar datos',
    icon: 'FileText',
    order: 7,
    required: true,
    completed: false,
    current: false,
    disabled: false,
    skippable: false
  },
  {
    id: 'success',
    title: 'Completado',
    description: 'Póliza creada exitosamente',
    icon: 'CheckCircle',
    order: 8,
    required: false,
    completed: false,
    current: false,
    disabled: false,
    skippable: false
  }
];

export default WizardStep;