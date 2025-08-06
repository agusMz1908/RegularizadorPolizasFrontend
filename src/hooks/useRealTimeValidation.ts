import { useState, useEffect } from 'react';
import type { PolicyFormData, FormTabId } from '../types/policyForm';
import { TabsUtils } from '../constants/formTabs';

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
  masterOptions: any
) => {
  const [validationMessages, setValidationMessages] = useState<ValidationMessage[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);

  // Validación en tiempo real con debounce
  useEffect(() => {
    const validateAsync = async () => {
      setIsValidating(true);
      
      // Simular validación asíncrona (puedes conectar con backend)
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
    // Validaciones específicas mejoradas
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
          const diffMonths = (hasta.getTime() - desde.getTime()) / (1000 * 60 * 60 * 24 * 30);
          
          if (diffMonths > 12) {
            return 'Período de vigencia muy largo (máximo 12 meses)';
          }
          if (diffMonths < 1) {
            return 'Período de vigencia muy corto (mínimo 1 mes)';
          }
        }
        break;

      case 'premio':
      case 'total':
        const amount = Number(value);
        if (amount && amount > 1000000) return 'Monto parece excesivo, verificar';
        if (amount && amount < 100) return 'Monto parece muy bajo, verificar';
        break;
    }

    return null;
  };

  const getContextualMessages = (
    formData: PolicyFormData,
    masterOptions: any
  ): ValidationMessage[] => {
    const messages: ValidationMessage[] = [];

    // Sugerencias inteligentes
    if (formData.anio && Number(formData.anio) < 2015 && !formData.matricula) {
      messages.push({
        type: 'info',
        message: 'Vehículos anteriores a 2015 suelen tener matrícula. ¿Deseas agregarla?',
        field: 'matricula',
        action: () => {
          // Navegar al campo matrícula
          const matriculaTab = TabsUtils.getTabForField('matricula');
          if (matriculaTab) {
            // Implementar navegación automática
          }
        },
        actionLabel: 'Ir a Matrícula'
      });
    }

    // Verificación de coherencia
    if (formData.premio && formData.total && Number(formData.premio) > Number(formData.total)) {
      messages.push({
        type: 'warning',
        message: 'El premio no puede ser mayor al total',
        field: 'premio'
      });
    }

    // Completitud automática
    if (formData.marcaModelo && formData.anio && !formData.destinoId) {
      messages.push({
        type: 'info',
        message: 'Basado en el vehículo, sugerimos destino "Particular"',
        field: 'destinoId',
        action: () => {
          // Auto-completar con destino particular
          const particularDestino = masterOptions?.destinos?.find(
            (d: any) => d.desnom?.toLowerCase().includes('particular')
          );
          if (particularDestino) {
            // Trigger auto-complete
          }
        },
        actionLabel: 'Aplicar Sugerencia'
      });
    }

    return messages;
  };

  return {
    fieldErrors,
    validationMessages,
    isValidating,
    clearMessage: (index: number) => {
      setValidationMessages(prev => prev.filter((_, i) => i !== index));
    }
  };
};
