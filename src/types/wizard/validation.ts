// src/types/core/validation.ts

// ✅ Tipos básicos de validación
export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  code?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  fieldErrors: Record<string, string>;
}

export interface ValidationRule {
  field: string;
  required: boolean;
  validator?: (value: any) => boolean;
  transformer?: (value: any) => any;
  defaultValue?: any;
  errorMessage?: string;
  warningMessage?: string;
}

// ✅ Contexto de validación
export interface ValidationContext {
  source: 'manual' | 'azure' | 'import' | 'api';
  operationType: 'create' | 'update' | 'import';
  skipRequired?: boolean;
  skipFormatValidation?: boolean;
  allowPartialData?: boolean;
}

// ✅ Validadores específicos
export interface PolizaValidationRules {
  numeroPoliza: ValidationRule;
  vigenciaDesde: ValidationRule;
  vigenciaHasta: ValidationRule;
  prima: ValidationRule;
  asegurado: ValidationRule;
  matricula: ValidationRule;
  email: ValidationRule;
  telefono: ValidationRule;
  documento: ValidationRule;
}

// ✅ Resultado de validación específica de póliza
export interface PolizaValidationResult extends ValidationResult {
  validatedData: any;
  suggestions: string[];
  confidence: number;
  processingTime: number;
}

// ✅ Tipos para validación de formularios
export interface FormValidationState {
  isValidating: boolean;
  hasErrors: boolean;
  hasWarnings: boolean;
  touchedFields: Set<string>;
  validatedFields: Set<string>;
  lastValidation: Date | null;
}

export interface FormValidationConfig {
  validateOnChange: boolean;
  validateOnBlur: boolean;
  showWarnings: boolean;
  debounceMs: number;
}

// ✅ Constantes de validación
export const VALIDATION_CODES = {
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  OUT_OF_RANGE: 'OUT_OF_RANGE',
  INVALID_DATE: 'INVALID_DATE',
  INCONSISTENT_DATA: 'INCONSISTENT_DATA',
  DUPLICATE_VALUE: 'DUPLICATE_VALUE'
} as const;

export type ValidationCode = keyof typeof VALIDATION_CODES;

// ✅ Tipos para validaciones específicas de Uruguay
export interface UruguayValidationRules {
  ci: RegExp;
  ruc: RegExp;
  matricula: RegExp;
  telefono: RegExp;
  codigoPostal: RegExp;
}

export const URUGUAY_PATTERNS: UruguayValidationRules = {
  ci: /^\d{7,8}$/,
  ruc: /^\d{12}$/,
  matricula: /^[A-Z]{2,3}\d{4}$|^\d{4}[A-Z]{2}$/,
  telefono: /^[0-9]{8,9}$/,
  codigoPostal: /^\d{5}$/
};

export default ValidationResult;