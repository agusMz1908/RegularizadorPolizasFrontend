export { default } from './PolizaWizard';
export { default as PolizaWizard } from './PolizaWizard';
export { UploadStep } from './steps/UploadStep';
export { ProcessingStep } from './steps/ProcessingStep';
export { FormStep } from './steps/FormStep';

export type {
  Cliente,
  DocumentProcessResult,
  ExtractedField,
  WizardStep,
  WizardState,
  WizardError,
  ValidationResult,
  StepProgress,
  WizardConfig,
  WizardMetrics
} from '../../types/ui/wizard';

export type {
  PolizaFormData,
  PolizaCreateRequest,
} from '../../types/core/poliza';

export { usePolizaWizard } from '../../hooks/usePolizaWizard';