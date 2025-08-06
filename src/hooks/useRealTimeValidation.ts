// src/hooks/useRealTimeValidation.ts - ✅ COMPLETAMENTE CORREGIDO
import { useState, useEffect } from 'react';
import type { PolicyFormData } from '../types/poliza'; // ✅ IMPORTACIÓN CORRECTA
import type { FormTabId } from '../types/policyForm'; // ✅ IMPORTACIÓN CORRECTA
import type { MasterDataOptionsDto } from '../types/masterData'; // ✅ IMPORTACIÓN CORRECTA

export interface ValidationMessage {
  type: 'error' | 'warning' | 'info' | 'success';
  message: string;
  field?: keyof PolicyFormData;
  tab?: FormTabId;
  action?: () => void;
  actionLabel?: string;
}

export const useRealTimeValidation = (
  formData: PolicyFormData,
  touchedFields: Set<string>,
  masterOptions: MasterDataOptionsDto | null
) => {
  const [validationMessages, setValidationMessages] = useState<ValidationMessage[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);

  // Validación en tiempo real con debounce
  useEffect(() => {
    const validateAsync = async () => {
      setIsValidating(true);
      
      // Simular validación asíncrona
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const errors: Record<string, string> = {};
      const messages: ValidationMessage[] = [];

      // Validaciones en tiempo real
      Object.keys(formData).forEach(field => {
        const value = formData[field as keyof PolicyFormData];
        const isTouched = touchedFields.has(field);
        
        if (isTouched) {
          const error = validateFieldRealTime(field as keyof PolicyFormData, value, formData);
          if (error) {
            errors[field] = error;
          }
        }
      });

      // Validaciones contextuales
      const contextualMessages = getContextualMessages(formData, masterOptions);
      messages.push(...contextualMessages);

      setFieldErrors(errors);
      setValidationMessages(messages);
      setIsValidating(false);
    };

    const debounceTimer = setTimeout(validateAsync, 500);
    return () => clearTimeout(debounceTimer);
  }, [formData, touchedFields, masterOptions]);

  const validateFieldRealTime = (
    field: keyof PolicyFormData,
    value: any,
    fullFormData: PolicyFormData
  ): string | null => {
    // Validaciones específicas en tiempo real
    switch (field) {
      case 'poliza':
        if (value && value.length < 3) return 'Número de póliza muy corto';
        if (value && !/^[A-Z0-9-]+$/i.test(value)) return 'Formato de póliza inválido';
        break;
        
      case 'anio':
        const year = Number(value);
        const currentYear = new Date().getFullYear();
        if (year && year > currentYear + 1) return 'Año no puede ser futuro';
        if (year && year < 1900) return 'Año demasiado antiguo';
        break;

      case 'hasta':
        if (fullFormData.desde && value) {
          const desde = new Date(fullFormData.desde);
          const hasta = new Date(value);
          if (hasta <= desde) return 'La fecha hasta debe ser posterior a la fecha desde';
        }
        break;

      case 'premio':
      case 'total':
        const amount = Number(value);
        if (value && (isNaN(amount) || amount <= 0)) {
          return 'Debe ser un número mayor a 0';
        }
        if (amount > 999999) return 'Monto muy alto';
        break;

      case 'cuotas':
        const cuotas = Number(value);
        if (value && (isNaN(cuotas) || cuotas < 1 || cuotas > 48)) {
          return 'Cuotas debe estar entre 1 y 48';
        }
        break;
    }

    return null;
  };

  const getContextualMessages = (
    formData: PolicyFormData,
    masterOptions: MasterDataOptionsDto | null
  ): ValidationMessage[] => {
    const messages: ValidationMessage[] = [];

    // Sugerencias inteligentes basadas en datos maestros
    if (masterOptions && formData.combustibleId && formData.categoriaId) {
      // Validación contextual: ciertos combustibles con ciertas categorías
      const combustible = masterOptions.combustibles?.find(c => c.id === formData.combustibleId);
      const categoria = masterOptions.categorias?.find(c => c.id === formData.categoriaId);
      
      if (combustible?.id === 'ELE' && categoria?.catdsc?.includes('CAMION')) {
        messages.push({
          type: 'warning',
          message: 'Vehículo eléctrico categorizado como camión es inusual. Verifique los datos.',
          field: 'combustibleId',
          tab: 'datos_vehiculo'
        });
      }
    }

    // Avisos sobre completitud de datos
    if (formData.poliza && formData.desde && formData.hasta && !formData.premio) {
      messages.push({
        type: 'info',
        message: 'Datos de póliza completos. Ahora defina el premio para continuar.',
        tab: 'datos_cobertura'
      });
    }

    // Avisos de forma de pago vs cuotas
    if (formData.formaPago === 'Contado' && Number(formData.cuotas) > 1) {
      messages.push({
        type: 'warning',
        message: 'Pago al contado con múltiples cuotas. Verifique la forma de pago.',
        field: 'formaPago',
        tab: 'condiciones_pago'
      });
    }

    return messages;
  };

  return {
    validationMessages,
    fieldErrors,
    isValidating,
    validateFieldRealTime
  };
};