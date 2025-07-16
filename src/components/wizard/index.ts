export { default as PolizaWizard } from './PolizaWizard';
export { default } from './PolizaWizard';

// Re-exportar tipos relacionados
export type {
  Cliente,
  Company,
  DocumentProcessResult,
  ExtractedField,
  PolizaFormData,
  PolizaCreateRequest,
  WizardStep,
  WizardState,
  WizardResult,
  WizardError,
  ValidationResult,
  StepProgress,
  WizardConfig,
  WizardMetrics
} from '../../types/wizard';