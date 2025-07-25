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
  canSubmit?: boolean;
  blockers?: ValidationError[];
  recommendations?: string[];
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

export interface ValidationContext {
  source: 'manual' | 'azure' | 'import' | 'api';
  operationType: 'create' | 'update' | 'import';
  skipRequired?: boolean;
  skipFormatValidation?: boolean;
  allowPartialData?: boolean;
}

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

export interface PolizaValidationResult extends ValidationResult {
  validatedData: any;
  suggestions: string[];
  confidence: number;
  processingTime: number;
}

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

export const VALIDATION_CODES = {
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  OUT_OF_RANGE: 'OUT_OF_RANGE',
  INVALID_DATE: 'INVALID_DATE',
  INCONSISTENT_DATA: 'INCONSISTENT_DATA',
  DUPLICATE_VALUE: 'DUPLICATE_VALUE'
} as const;

export type ValidationCode = keyof typeof VALIDATION_CODES;

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

export const createValidationResult = (
  isValid: boolean,
  errors: ValidationError[] = [],
  warnings: ValidationError[] = [],
  fieldErrors: Record<string, string> = {}
): ValidationResult => ({
  isValid,
  errors,
  warnings,
  fieldErrors
});

export const errorsToFieldErrors = (errors: ValidationError[]): Record<string, string> => {
  return errors.reduce((acc, error) => {
    if (!acc[error.field]) {
      acc[error.field] = error.message;
    }
    return acc;
  }, {} as Record<string, string>);
};

export default ValidationResult;