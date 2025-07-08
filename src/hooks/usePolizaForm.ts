// hooks/usePolizaForm.ts
import { useState, useCallback, useEffect } from 'react';
import { PolizaFormData } from '../types/poliza';
import { ValidationError } from '../types/processing';

interface UsePolizaFormOptions {
  initialData?: PolizaFormData;
  ramoCode?: string;
  onValidation?: (isValid: boolean, errors: ValidationError[]) => void;
  onSubmit?: (data: PolizaFormData) => Promise<void>;
}

export const usePolizaForm = (options: UsePolizaFormOptions = {}) => {
  const { initialData = {}, ramoCode, onValidation, onSubmit } = options;

  const [formData, setFormData] = useState<PolizaFormData>(initialData);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setFormData(initialData);
    setIsDirty(false);
  }, [initialData]);

  const updateField = useCallback((field: keyof PolizaFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setIsDirty(true);
  }, []);

  const validateForm = useCallback((): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (!formData.numeroPoliza) {
      errors.push({
        field: 'numeroPoliza',
        message: 'El número de póliza es requerido',
        value: formData.numeroPoliza,
      });
    }

    if (!formData.vigenciaDesde) {
      errors.push({
        field: 'vigenciaDesde',
        message: 'La fecha de inicio es requerida',
        value: formData.vigenciaDesde,
      });
    }

    if (!formData.vigenciaHasta) {
      errors.push({
        field: 'vigenciaHasta',
        message: 'La fecha de fin es requerida',
        value: formData.vigenciaHasta,
      });
    }

    if (!formData.nombreAsegurado) {
      errors.push({
        field: 'nombreAsegurado',
        message: 'El nombre del asegurado es requerido',
        value: formData.nombreAsegurado,
      });
    }

    if (ramoCode === 'AUTO') {
      if (!formData.marca) {
        errors.push({
          field: 'marca',
          message: 'La marca del vehículo es requerida',
          value: formData.marca,
        });
      }

      if (!formData.chapa) {
        errors.push({
          field: 'chapa',
          message: 'La chapa del vehículo es requerida',
          value: formData.chapa,
        });
      }
    }

    if (formData.vigenciaDesde && formData.vigenciaHasta) {
      const fechaDesde = new Date(formData.vigenciaDesde);
      const fechaHasta = new Date(formData.vigenciaHasta);
      
      if (fechaHasta <= fechaDesde) {
        errors.push({
          field: 'vigenciaHasta',
          message: 'La fecha de fin debe ser posterior a la fecha de inicio',
          value: formData.vigenciaHasta,
        });
      }
    }

    if (formData.prima && formData.prima < 0) {
      errors.push({
        field: 'prima',
        message: 'La prima no puede ser negativa',
        value: formData.prima,
      });
    }

    return errors;
  }, [formData, ramoCode]);

  const validate = useCallback(() => {
    const errors = validateForm();
    setValidationErrors(errors);
    const isValid = errors.length === 0;
    onValidation?.(isValid, errors);
    return isValid;
  }, [validateForm, onValidation]);

  const submitForm = useCallback(async () => {
    if (!validate()) {
      return false;
    }

    if (!onSubmit) {
      return true;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setIsDirty(false);
      return true;
    } catch (error) {
      console.error('Error submitting form:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [validate, onSubmit, formData]);

  const reset = useCallback(() => {
    setFormData(initialData);
    setValidationErrors([]);
    setIsSubmitting(false);
    setIsDirty(false);
  }, [initialData]);

  const getFieldError = useCallback((field: keyof PolizaFormData): string | undefined => {
    return validationErrors.find(error => error.field === field)?.message;
  }, [validationErrors]);

  const hasFieldError = useCallback((field: keyof PolizaFormData): boolean => {
    return validationErrors.some(error => error.field === field);
  }, [validationErrors]);

  return {
    formData,
    validationErrors,
    isSubmitting,
    isDirty,
    updateField,
    validate,
    submitForm,
    reset,
    getFieldError,
    hasFieldError,
    isValid: validationErrors.length === 0,
  };
};