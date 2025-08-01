export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}