import { useState, useEffect } from 'react';
import { PolizaFormData } from '../../types/core/poliza';

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  touchedFields: Set<string>;
}

export interface UseFormValidationReturn {
  // Estado de validación
  validation: ValidationResult;
  
  // Acciones
  validateField: (field: keyof PolizaFormData, value: any) => void;
  validateAll: (formData: PolizaFormData) => boolean;
  markFieldTouched: (field: keyof PolizaFormData) => void;
  clearErrors: () => void;
  
  // Helpers para UI
  getFieldError: (field: keyof PolizaFormData) => ValidationError | undefined;
  hasFieldError: (field: keyof PolizaFormData) => boolean;
  isFieldTouched: (field: keyof PolizaFormData) => boolean;
}

export const useFormValidation = (): UseFormValidationReturn => {
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: false,
    errors: [],
    warnings: [],
    touchedFields: new Set()
  });

  // ✅ Validar campo individual
  const validateField = (field: keyof PolizaFormData, value: any): void => {
    const fieldErrors = validateSingleField(field, value);
    
    setValidation(prev => ({
      ...prev,
      errors: [
        ...prev.errors.filter(error => error.field !== field),
        ...fieldErrors.filter(error => error.severity === 'error')
      ],
      warnings: [
        ...prev.warnings.filter(warning => warning.field !== field),
        ...fieldErrors.filter(error => error.severity === 'warning')
      ]
    }));
  };

  // ✅ Validar todo el formulario
  const validateAll = (formData: PolizaFormData): boolean => {
    const allErrors: ValidationError[] = [];
    const allWarnings: ValidationError[] = [];

    // Validar campos requeridos básicos
    const requiredFields = [
      'numeroPoliza', 'asegurado', 'vigenciaDesde', 'vigenciaHasta', 
      'prima', 'moneda', 'cobertura', 'compania', 'clienteId', 'seccionId'
    ];

    requiredFields.forEach(field => {
      const fieldErrors = validateSingleField(field as keyof PolizaFormData, formData[field as keyof PolizaFormData]);
      allErrors.push(...fieldErrors.filter(error => error.severity === 'error'));
      allWarnings.push(...fieldErrors.filter(error => error.severity === 'warning'));
    });

    const isValid = allErrors.length === 0;

    setValidation(prev => ({
      ...prev,
      isValid,
      errors: allErrors,
      warnings: allWarnings
    }));

    return isValid;
  };

  // ✅ Marcar campo como tocado
  const markFieldTouched = (field: keyof PolizaFormData): void => {
    setValidation(prev => ({
      ...prev,
      touchedFields: new Set([...prev.touchedFields, field])
    }));
  };

  // ✅ Limpiar errores
  const clearErrors = (): void => {
    setValidation(prev => ({
      ...prev,
      errors: [],
      warnings: []
    }));
  };

  // ✅ Helpers para UI
  const getFieldError = (field: keyof PolizaFormData): ValidationError | undefined => {
    return validation.errors.find(error => error.field === field);
  };

  const hasFieldError = (field: keyof PolizaFormData): boolean => {
    return validation.errors.some(error => error.field === field);
  };

  const isFieldTouched = (field: keyof PolizaFormData): boolean => {
    return validation.touchedFields.has(field);
  };

  // ✅ Actualizar isValid cuando cambien los errores
  useEffect(() => {
    setValidation(prev => ({
      ...prev,
      isValid: prev.errors.length === 0
    }));
  }, [validation.errors.length]);

  return {
    validation,
    validateField,
    validateAll,
    markFieldTouched,
    clearErrors,
    getFieldError,
    hasFieldError,
    isFieldTouched
  };
};

// 🔧 VALIDACIÓN BÁSICA (simplificada por ahora)
const validateSingleField = (field: keyof PolizaFormData, value: any): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Por ahora, solo validaciones básicas
  switch (field) {
    case 'numeroPoliza':
      if (!value || !value.toString().trim()) {
        errors.push({
          field,
          message: 'El número de póliza es requerido',
          severity: 'error'
        });
      }
      break;

    case 'asegurado':
      if (!value || !value.toString().trim()) {
        errors.push({
          field,
          message: 'El nombre del asegurado es requerido',
          severity: 'error'
        });
      }
      break;

    // Agregar más validaciones según necesites
  }

  return errors;
};

export default useFormValidation;