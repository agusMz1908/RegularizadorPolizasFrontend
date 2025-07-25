// src/types/core/formData.ts

import { PolizaFormData } from '../core/poliza';
import { ValidationError } from './validation';

// ✅ Estados del formulario
export interface FormState<T = any> {
  data: T;
  originalData: T;
  isDirty: boolean;
  isSubmitting: boolean;
  isValid: boolean;
  hasChanges: boolean;
  lastSaved: Date | null;
  autoSaveEnabled: boolean;
}

// ✅ Configuración del formulario
export interface FormConfig {
  autoSave: boolean;
  autoSaveInterval: number; // en milisegundos
  validateOnChange: boolean;
  validateOnBlur: boolean;
  showValidationSummary: boolean;
  allowPartialSave: boolean;
  confirmOnDiscard: boolean;
}

// ✅ Campos del formulario con metadatos
export interface FormField<T = any> {
  name: string;
  value: T;
  defaultValue: T;
  isRequired: boolean;
  isReadOnly: boolean;
  isVisible: boolean;
  isDisabled: boolean;
  isDirty: boolean;
  isTouched: boolean;
  isValidated: boolean;
  validation: {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
  };
  metadata: {
    label: string;
    placeholder?: string;
    helpText?: string;
    maxLength?: number;
    minLength?: number;
    pattern?: RegExp;
    source?: 'manual' | 'azure' | 'default' | 'calculated';
    confidence?: number;
  };
}

// ✅ Secciones del formulario (tabs)
export interface FormSection {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  order: number;
  isRequired: boolean;
  isComplete: boolean;
  isVisible: boolean;
  fields: string[];
  validation: {
    isValid: boolean;
    errorCount: number;
    warningCount: number;
    requiredFieldsCompleted: number;
    totalRequiredFields: number;
  };
}

// ✅ Contexto del formulario de póliza
export interface PolizaFormContext {
  // Datos del wizard
  clienteId: number;
  companiaId: number;
  seccionId: number;
  operationType: 'create' | 'edit' | 'copy';
  
  // Origen de los datos
  dataSource: 'manual' | 'azure' | 'import' | 'template';
  documentId?: string;
  templateId?: string;
  
  // Configuración del formulario
  config: FormConfig;
  
  // Estado de las secciones
  sections: Record<string, FormSection>;
  activeSection: string;
  
  // Metadatos
  metadata: {
    createdAt: Date;
    lastModified: Date;
    modifiedBy: string;
    version: number;
    sessionId: string;
  };
}

// ✅ Historial de cambios
export interface FormChangeLog {
  timestamp: Date;
  field: string;
  oldValue: any;
  newValue: any;
  source: 'user' | 'auto' | 'system';
  reason?: string;
}

// ✅ Resultado de operaciones del formulario
export interface FormOperationResult {
  success: boolean;
  operation: 'save' | 'submit' | 'validate' | 'reset' | 'restore';
  timestamp: Date;
  data?: any;
  errors: ValidationError[];
  warnings: ValidationError[];
  metadata: {
    processingTime: number;
    fieldsProcessed: number;
    fieldsChanged: number;
  };
}

// ✅ Configuración de auto-guardado
export interface AutoSaveConfig {
  enabled: boolean;
  interval: number; // segundos
  maxRetries: number;
  retryDelay: number; // segundos
  saveOnUnload: boolean;
  saveOnVisibilityChange: boolean;
  minChangesThreshold: number;
}

// ✅ Estado del auto-guardado
export interface AutoSaveState {
  isEnabled: boolean;
  lastSaveAttempt: Date | null;
  lastSuccessfulSave: Date | null;
  nextSaveIn: number; // segundos
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  saveCount: number;
  errorCount: number;
  lastError: string | null;
}

// ✅ Templates de formulario
export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category: 'vehiculos' | 'hogar' | 'vida' | 'general';
  isDefault: boolean;
  isActive: boolean;
  data: Partial<PolizaFormData>;
  config: Partial<FormConfig>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  usage: {
    timesUsed: number;
    lastUsed: Date | null;
    averageCompletionTime: number; // minutos
  };
}

// ✅ Importación/Exportación de formularios
export interface FormImportExport {
  version: string;
  exportedAt: Date;
  exportedBy: string;
  formData: PolizaFormData;
  context: PolizaFormContext;
  validation: ValidationError[];
  checksum: string;
}

// ✅ Estadísticas del formulario
export interface FormStatistics {
  totalFields: number;
  completedFields: number;
  requiredFields: number;
  completedRequiredFields: number;
  fieldsWithErrors: number;
  fieldsWithWarnings: number;
  completionPercentage: number;
  estimatedCompletionTime: number; // minutos
  timeSpent: number; // minutos
  autoFilledFields: number;
  manuallyFilledFields: number;
}

// ✅ Eventos del formulario
export interface FormEvent {
  type: 'field_change' | 'section_change' | 'validation' | 'save' | 'submit' | 'error';
  timestamp: Date;
  field?: string;
  section?: string;
  oldValue?: any;
  newValue?: any;
  error?: string;
  metadata?: Record<string, any>;
}

// ✅ Configuración de validación por campo
export interface FieldValidationConfig {
  required: boolean;
  validateOnChange: boolean;
  validateOnBlur: boolean;
  debounceMs: number;
  customValidator?: (value: any, formData: any) => ValidationError[];
  dependencies: string[]; // otros campos que afectan la validación
}

// ✅ Tipos para formularios dinámicos
export interface DynamicFormField {
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'textarea';
  name: string;
  label: string;
  required: boolean;
  options?: Array<{ value: any; label: string; disabled?: boolean }>;
  validation: FieldValidationConfig;
  conditional?: {
    dependsOn: string;
    values: any[];
    operation: 'equals' | 'not_equals' | 'in' | 'not_in';
  };
}

// ✅ Configuración completa de formulario dinámico
export interface DynamicFormConfig {
  id: string;
  title: string;
  description: string;
  sections: Array<{
    id: string;
    title: string;
    fields: DynamicFormField[];
  }>;
  globalValidation?: (data: any) => ValidationError[];
}

// ✅ Tipos para wizard de formularios
export interface FormWizardStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  isRequired: boolean;
  isComplete: boolean;
  canSkip: boolean;
  fields: string[];
  validation: (data: any) => ValidationError[];
  onEnter?: (data: any) => void;
  onExit?: (data: any) => void;
}

export interface FormWizardConfig {
  steps: FormWizardStep[];
  allowSkipping: boolean;
  showProgress: boolean;
  saveProgress: boolean;
  linearNavigation: boolean; // solo permitir navegación secuencial
}

// ✅ Exportaciones para uso fácil
export type PolizaFormState = FormState<PolizaFormData>;
export type PolizaFormField = FormField;
export type PolizaFormSection = FormSection;

export default FormState;