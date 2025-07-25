export { default } from './PolizaWizard';
export { default as PolizaWizard } from './PolizaWizard';

export type {
  Cliente,
  Company,
  DocumentProcessResult,
  ExtractedField,
  WizardStep,
  WizardState,
  WizardError,
  ValidationResult,
  StepProgress,
  WizardConfig,
  WizardMetrics
} from '../../types/wizard';

export type {
  PolizaFormData,
  PolizaCreateRequest,
  Poliza
} from '../../types/poliza';

export { usePolizaWizard } from '../../hooks/usePolizaWizard';