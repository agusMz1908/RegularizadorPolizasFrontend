export type WizardStepId = 
  | 'cliente'
  | 'company' 
  | 'seccion'
  | 'operacion'
  | 'upload'
  | 'extract'
  | 'form'
  | 'success';

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

export interface NavigationConfig {
  enableKeyboard?: boolean;
  enableGestures?: boolean;
  enableUrlSync?: boolean;
  preventUnload?: boolean;
}

// ============================================================================
// 🎮 EVENTOS DE NAVEGACIÓN
// ============================================================================

export interface NavigationEvent {
  type: 'navigate' | 'skip' | 'back' | 'cancel';
  from: WizardStepId;
  to: WizardStepId;
  timestamp: Date;
  cancelled?: boolean;
}

export interface NavigationValidation {
  canNavigate: boolean;
  canGoBack: boolean;
  canGoNext: boolean;
  canSkip: boolean;
  blockers: string[];
  warnings: string[];
}

// ============================================================================
// 🔄 TIPOS DE TRANSICIÓN
// ============================================================================

export type NavigationDirection = 'forward' | 'backward' | 'jump';
export type NavigationMethod = 'click' | 'keyboard' | 'gesture' | 'programmatic';

export interface NavigationOptions {
  direction?: NavigationDirection;
  method?: NavigationMethod;
  skipValidation?: boolean;
  force?: boolean;
  animated?: boolean;
}

// ============================================================================
// 📊 HISTORIAL DE NAVEGACIÓN
// ============================================================================

export interface NavigationHistoryEntry {
  stepId: WizardStepId;
  timestamp: Date;
  method: NavigationMethod;
  duration: number;
  metadata?: Record<string, any>;
}

export interface NavigationHistory {
  entries: NavigationHistoryEntry[];
  currentIndex: number;
  totalTime: number;
  backwardNavigations: number;
  skipCount: number;
}

// ============================================================================
// ⚙️ CONFIGURACIÓN AVANZADA
// ============================================================================

export interface StepNavigationConfig {
  stepId: WizardStepId;
  canSkip: boolean;
  canGoBack: boolean;
  requiresValidation: boolean;
  autoAdvance: boolean;
  nextStep?: WizardStepId;
  previousStep?: WizardStepId;
}

export interface WizardNavigationConfig {
  steps: StepNavigationConfig[];
  globalConfig: NavigationConfig;
  defaultTransitionDuration: number;
  enableBreadcrumbs: boolean;
  enableProgressBar: boolean;
}
