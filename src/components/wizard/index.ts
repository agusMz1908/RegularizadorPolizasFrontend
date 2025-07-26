// src/components/wizard/index.ts
// ✅ VERSIÓN LIMPIA - SOLO EXPORTS QUE REALMENTE EXISTEN

// ============================================================================
// 🧩 COMPONENTES
// ============================================================================
export { default } from './PolizaWizard';
export { default as PolizaWizard } from './PolizaWizard';
export { UploadStep } from './steps/UploadStep';
export { ProcessingStep } from './steps/ProcessingStep';
export { FormStep } from './steps/FormStep';

// ============================================================================
// 📝 TIPOS QUE REALMENTE EXISTEN EN wizard.ts
// ============================================================================
export type {
  WizardStep,
  WizardState,
  DocumentProcessResult
} from '../../types/ui/wizard';

export type {
  PolizaFormData,
  PolizaCreateRequest,
} from '../../types/core/poliza';

// ============================================================================
// 🔧 HOOKS
// ============================================================================
export { usePolizaWizard } from '../../hooks/usePolizaWizard';

// ============================================================================
// 🏭 FACTORY FUNCTIONS
// ============================================================================
export { createValidationState, createStepData } from '../../types/ui/wizard';