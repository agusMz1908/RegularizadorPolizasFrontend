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
  PolizaFormDataComplete,
  PolizaFormData,
  PolizaFormDataExtended
} from '../../types/poliza-unified';

export { usePolizaWizard } from '../../hooks/usePolizaWizard';