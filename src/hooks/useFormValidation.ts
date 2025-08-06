// src/hooks/useFormValidation.ts - ✅ COMPLETAMENTE CORREGIDO
import { useCallback, useMemo } from 'react';
import type { PolicyFormData } from '../types/poliza'; // ✅ IMPORTACIÓN CORRECTA
import type { FormTabId } from '../types/policyForm'; // ✅ IMPORTACIÓN CORRECTA
import { TabsUtils } from '../constants/formTabs';

export interface ValidationRule {
  field: keyof PolicyFormData;
  validator: (value: any, formData: PolicyFormData) => string | null;
  required?: boolean;
  dependencies?: (keyof PolicyFormData)[];
}

export interface FieldValidationResult {
  isValid: boolean;
  error: string | null;
  warning: string | null;
}

export interface TabValidationResult {
  isValid: boolean;
  completion: number;
  errors: Record<string, string>;
  warnings: Record<string, string>;
  missingRequired: string[];
}

export interface FormValidationResult {
  isValid: boolean;
  overallCompletion: number;
  totalErrors: number;
  totalWarnings: number;
  tabResults: Record<FormTabId, TabValidationResult>;
  globalErrors: Record<string, string>;
  globalWarnings: Record<string, string>;
}

/**
 * 🔍 HOOK PARA VALIDACIONES AVANZADAS DEL FORMULARIO
 */
export const useFormValidation = (formData: PolicyFormData, touchedFields: Set<string>) => {

  const validationRules: ValidationRule[] = useMemo(() => [
    // DATOS BÁSICOS
    {
      field: 'corredor',
      validator: (value) => {
        if (!value || value.trim() === '') return 'Corredor es requerido';
        if (value.length > 100) return 'Nombre del corredor muy largo (máx. 100 caracteres)';
        return null;
      },
      required: true
    },
    {
      field: 'asegurado',
      validator: (value) => {
        if (!value || value.trim() === '') return 'Asegurado es requerido';
        if (value.length > 150) return 'Nombre del asegurado muy largo (máx. 150 caracteres)';
        return null;
      },
      required: true
    },
    {
      field: 'estadoTramite',
      validator: (value) => {
        if (!value) return 'Estado de trámite es requerido';
        const validStates = ['Pendiente', 'En proceso', 'Terminado', 'Modificaciones'];
        if (!validStates.includes(value)) return 'Estado de trámite inválido';
        return null;
      },
      required: true
    },
    {
      field: 'tramite',
      validator: (value) => {
        if (!value) return 'Tipo de trámite es requerido';
        const validTypes = ['Nuevo', 'Renovación', 'Cambio', 'Endoso'];
        if (!validTypes.includes(value)) return 'Tipo de trámite inválido';
        return null;
      },
      required: true
    },

    // DATOS PÓLIZA
    {
      field: 'poliza',
      validator: (value) => {
        if (!value || value.trim() === '') return 'Número de póliza es requerido';
        if (value.length < 3) return 'Número de póliza muy corto';
        if (!/^[A-Z0-9-]+$/i.test(value)) return 'Formato de póliza inválido';
        return null;
      },
      required: true
    },
    {
      field: 'desde',
      validator: (value) => {
        if (!value) return 'Fecha de inicio de vigencia es requerida';
        const date = new Date(value);
        if (isNaN(date.getTime())) return 'Fecha de inicio inválida';
        return null;
      },
      required: true
    },
    {
      field: 'hasta',
      validator: (value, formData) => {
        if (!value) return 'Fecha de fin de vigencia es requerida';
        const date = new Date(value);
        if (isNaN(date.getTime())) return 'Fecha de fin inválida';
        
        if (formData.desde) {
          const desde = new Date(formData.desde);
          if (date <= desde) return 'La fecha hasta debe ser posterior a la fecha desde';
        }
        return null;
      },
      required: true,
      dependencies: ['desde']
    },

    // DATOS VEHÍCULO
    {
      field: 'marcaModelo',
      validator: (value) => {
        if (!value || value.trim() === '') return 'Marca y modelo son requeridos';
        if (value.length < 3) return 'Marca y modelo muy cortos';
        return null;
      },
      required: true
    },
    {
      field: 'anio',
      validator: (value) => {
        if (value) {
          const year = Number(value);
          const currentYear = new Date().getFullYear();
          if (isNaN(year)) return 'Año debe ser un número';
          if (year < 1900) return 'Año muy antiguo';
          if (year > currentYear + 1) return 'Año no puede ser futuro';
        }
        return null;
      }
    },
    {
      field: 'destinoId',
      validator: (value) => {
        if (!value) return 'Destino es requerido';
        return null;
      },
      required: true
    },
    {
      field: 'combustibleId',
      validator: (value) => {
        if (!value) return 'Combustible es requerido';
        return null;
      },
      required: true
    },

    // DATOS COBERTURA
    {
      field: 'premio',
      validator: (value) => {
        if (!value) return 'Premio es requerido';
        const amount = Number(value);
        if (isNaN(amount) || amount <= 0) return 'Premio debe ser mayor a 0';
        if (amount > 999999) return 'Premio muy alto';
        return null;
      },
      required: true
    },
    {
      field: 'total',
      validator: (value) => {
        if (!value) return 'Total es requerido';
        const amount = Number(value);
        if (isNaN(amount) || amount <= 0) return 'Total debe ser mayor a 0';
        return null;
      },
      required: true
    },
    {
      field: 'formaPago',
      validator: (value) => {
        if (!value) return 'Forma de pago es requerida';
        return null;
      },
      required: true
    },
    {
      field: 'cuotas',
      validator: (value) => {
        if (value) {
          const cuotas = Number(value);
          if (isNaN(cuotas) || cuotas < 1 || cuotas > 48) {
            return 'Cuotas debe estar entre 1 y 48';
          }
        }
        return null;
      }
    }
  ], []);

  // Validar campo individual
  const validateField = useCallback((field: keyof PolicyFormData, value: any): FieldValidationResult => {
    const rule = validationRules.find(r => r.field === field);
    if (!rule) {
      return { isValid: true, error: null, warning: null };
    }

    const error = rule.validator(value, formData);
    return {
      isValid: !error,
      error,
      warning: null
    };
  }, [formData, validationRules]);

  // Validar pestaña completa
  const validateTab = useCallback((tabId: FormTabId): TabValidationResult => {
    const tabFields = TabsUtils.getFieldsForTab(tabId);
    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};
    let missingRequired: string[] = [];

    tabFields.forEach(fieldName => {
      const field = fieldName as keyof PolicyFormData;
      const value = formData[field];
      const result = validateField(field, value);
      
      if (!result.isValid && result.error) {
        errors[field] = result.error;
      }
      if (result.warning) {
        warnings[field] = result.warning;
      }
      
      // Verificar campos requeridos
      const rule = validationRules.find(r => r.field === field);
      if (rule?.required && (!value || value === '')) {
        missingRequired.push(field);
      }
    });

    const completion = Math.round(
      ((tabFields.length - Object.keys(errors).length - missingRequired.length) / tabFields.length) * 100
    );

    return {
      isValid: Object.keys(errors).length === 0 && missingRequired.length === 0,
      completion: Math.max(0, completion),
      errors,
      warnings,
      missingRequired
    };
  }, [formData, validateField, validationRules]);

  // Validar formulario completo
  const validateForm = useCallback((): FormValidationResult => {
    const tabs: FormTabId[] = ['datos_basicos', 'datos_poliza', 'datos_vehiculo', 'datos_cobertura', 'condiciones_pago', 'observaciones'];
    const tabResults: Record<FormTabId, TabValidationResult> = {} as Record<FormTabId, TabValidationResult>;
    
    let totalErrors = 0;
    let totalWarnings = 0;
    let totalCompletion = 0;

    tabs.forEach(tabId => {
      const result = validateTab(tabId);
      tabResults[tabId] = result;
      totalErrors += Object.keys(result.errors).length;
      totalWarnings += Object.keys(result.warnings).length;
      totalCompletion += result.completion;
    });

    const overallCompletion = Math.round(totalCompletion / tabs.length);
    const isValid = totalErrors === 0;

    return {
      isValid,
      overallCompletion,
      totalErrors,
      totalWarnings,
      tabResults,
      globalErrors: {},
      globalWarnings: {}
    };
  }, [validateTab]);

  return {
    validateField,
    validateTab,
    validateForm,
    validationRules
  };
};