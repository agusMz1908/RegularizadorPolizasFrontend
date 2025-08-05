// src/hooks/useFormValidation.ts - Hook para validaciones del formulario (COMPATIBLE CON TU ESTRUCTURA)

import { useCallback, useMemo } from 'react';
import type { PolicyFormData, FormTabId } from '../types/policyForm';
import { VALIDATION_CONFIG } from '../constants/velneoDefault';
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
 * Proporciona validaciones granulares, por campo, por pestaña y globales
 * COMPATIBLE CON TU ESTRUCTURA DE PolicyFormData
 */
export const useFormValidation = (formData: PolicyFormData, touchedFields: Set<string>) => {

  // ===== REGLAS DE VALIDACIÓN ADAPTADAS A TU ESTRUCTURA =====
  const validationRules: ValidationRule[] = useMemo(() => [
    // PESTAÑA 1: DATOS BÁSICOS
    {
      field: 'corredor',
      validator: (value) => {
        if (!value || value.trim() === '') return 'Corredor es requerido';
        if (value.length > VALIDATION_CONFIG.CORREDOR_MAX_LENGTH) {
          return VALIDATION_CONFIG.MESSAGES.MAX_LENGTH(VALIDATION_CONFIG.CORREDOR_MAX_LENGTH);
        }
        return null;
      },
      required: true
    },

    {
      field: 'estadoTramite',
      validator: (value) => {
        if (!value) return 'Estado de trámite es requerido';
        return null;
      },
      required: true
    },

    {
      field: 'tramite',
      validator: (value) => {
        if (!value) return 'Tipo de trámite es requerido';
        return null;
      },
      required: true
    },

    {
      field: 'tipo',
      validator: (value) => {
        if (!value) return 'Tipo es requerido';
        return null;
      },
      required: true
    },

    {
      field: 'estadoPoliza',
      validator: (value) => {
        if (!value) return 'Estado de póliza es requerido';
        return null;
      },
      required: true
    },

    // PESTAÑA 2: DATOS DE LA PÓLIZA
    {
      field: 'desde',
      validator: (value) => {
        if (!value) return 'Fecha desde es requerida';
        const date = new Date(value);
        if (isNaN(date.getTime())) return VALIDATION_CONFIG.MESSAGES.INVALID_DATE;
        return null;
      },
      required: true
    },

    {
      field: 'hasta',
      validator: (value, formData) => {
        if (!value) return 'Fecha hasta es requerida';
        const date = new Date(value);
        if (isNaN(date.getTime())) return VALIDATION_CONFIG.MESSAGES.INVALID_DATE;
        
        // Validación cruzada con fecha desde
        if (formData.desde) {
          const desdeDate = new Date(formData.desde);
          if (date <= desdeDate) {
            return VALIDATION_CONFIG.MESSAGES.DATE_RANGE;
          }
        }
        return null;
      },
      required: true,
      dependencies: ['desde']
    },

    {
      field: 'poliza',
      validator: (value) => {
        if (!value || value.trim() === '') return 'Número de póliza es requerido';
        if (!VALIDATION_CONFIG.POLIZA_PATTERN.test(value)) {
          return 'Formato de número de póliza inválido';
        }
        if (value.length > VALIDATION_CONFIG.POLIZA_MAX_LENGTH) {
          return VALIDATION_CONFIG.MESSAGES.MAX_LENGTH(VALIDATION_CONFIG.POLIZA_MAX_LENGTH);
        }
        return null;
      },
      required: true
    },

    // PESTAÑA 3: DATOS DEL VEHÍCULO
    {
      field: 'marcaModelo',
      validator: (value) => {
        if (!value || value.trim() === '') return 'Marca y modelo son requeridos';
        if (value.length > VALIDATION_CONFIG.MARCA_MODELO_MAX_LENGTH) {
          return VALIDATION_CONFIG.MESSAGES.MAX_LENGTH(VALIDATION_CONFIG.MARCA_MODELO_MAX_LENGTH);
        }
        // Verificar que tenga al menos marca y modelo
        const parts = value.trim().split(' ').filter(Boolean);
        if (parts.length < 2) {
          return 'Debe incluir tanto marca como modelo';
        }
        return null;
      },
      required: true
    },

    {
      field: 'anio',
      validator: (value) => {
        if (!value) return 'Año es requerido';
        const yearStr = String(value);
        if (!VALIDATION_CONFIG.ANIO_PATTERN.test(yearStr)) {
          return 'Año debe ser un número de 4 dígitos';
        }
        const year = Number(yearStr);
        if (isNaN(year) || year < VALIDATION_CONFIG.ANIO_MIN || year > VALIDATION_CONFIG.ANIO_MAX) {
          return VALIDATION_CONFIG.MESSAGES.INVALID_YEAR;
        }
        return null;
      },
      required: true
    },

    {
      field: 'destinoId',
      validator: (value) => {
        if (!value || value === 0) return 'Destino es requerido';
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

    {
      field: 'calidadId',
      validator: (value) => {
        if (!value || value === 0) return 'Calidad es requerida';
        return null;
      },
      required: true
    },

    {
      field: 'categoriaId',
      validator: (value) => {
        if (!value || value === 0) return 'Categoría es requerida';
        return null;
      },
      required: true
    },

    // PESTAÑA 4: DATOS DE LA COBERTURA
    {
      field: 'coberturaId',
      validator: (value) => {
        if (!value || value === 0) return 'Cobertura es requerida';
        return null;
      },
      required: true
    },

    {
      field: 'zonaCirculacion',
      validator: (value) => {
        if (!value) return 'Zona de circulación es requerida';
        return null;
      },
      required: true
    },

    {
      field: 'monedaId',
      validator: (value) => {
        if (!value || value === 0) return 'Moneda es requerida';
        return null;
      },
      required: true
    },

    // PESTAÑA 5: CONDICIONES DE PAGO
    {
      field: 'formaPago',
      validator: (value) => {
        if (!value) return 'Forma de pago es requerida';
        return null;
      },
      required: true
    },

    {
      field: 'premio',
      validator: (value) => {
        if (!value && value !== 0) return 'Premio es requerido';
        const amount = Number(value);
        if (isNaN(amount)) return 'Premio debe ser un número válido';
        if (amount < VALIDATION_CONFIG.PREMIO_MIN) {
          return VALIDATION_CONFIG.MESSAGES.NEGATIVE_AMOUNT;
        }
        return null;
      },
      required: true
    },

    {
      field: 'total',
      validator: (value) => {
        if (!value && value !== 0) return 'Total es requerido';
        const amount = Number(value);
        if (isNaN(amount)) return 'Total debe ser un número válido';
        if (amount < VALIDATION_CONFIG.TOTAL_MIN) {
          return VALIDATION_CONFIG.MESSAGES.NEGATIVE_AMOUNT;
        }
        return null;
      },
      required: true
    },

    {
      field: 'cuotas',
      validator: (value) => {
        if (!value) return 'Cantidad de cuotas es requerida';
        const cuotas = Number(value);
        if (isNaN(cuotas)) return 'Cuotas debe ser un número válido';
        if (cuotas < VALIDATION_CONFIG.CUOTAS_MIN || cuotas > VALIDATION_CONFIG.CUOTAS_MAX) {
          return VALIDATION_CONFIG.MESSAGES.INVALID_CUOTAS;
        }
        return null;
      },
      required: true
    }
  ], []);

  // ===== VALIDAR CAMPO INDIVIDUAL =====
  const validateField = useCallback((field: keyof PolicyFormData): FieldValidationResult => {
    const rule = validationRules.find(r => r.field === field);
    const value = formData[field];
    
    let error: string | null = null;
    let warning: string | null = null;

    // Aplicar regla de validación si existe
    if (rule) {
      error = rule.validator(value, formData);
    }

    // Validaciones de warnings (campos opcionales pero recomendados)
    if (!error) {
      warning = getFieldWarning(field, value, formData);
    }

    return {
      isValid: error === null,
      error,
      warning
    };
  }, [formData, validationRules]);

  // ===== GENERAR WARNINGS =====
  const getFieldWarning = useCallback((
    field: keyof PolicyFormData, 
    value: any, 
    formData: PolicyFormData
  ): string | null => {
    switch (field) {
      case 'matricula':
        if (!value && formData.anio && Number(formData.anio) < new Date().getFullYear()) {
          return 'Considere agregar la matrícula si el vehículo ya está matriculado';
        }
        break;

      case 'motor':
        if (!value) {
          return 'El número de motor puede ser requerido por la compañía';
        }
        break;

      case 'valorCuota':
        if (!value && formData.cuotas && Number(formData.cuotas) > 1) {
          return 'Considere especificar el valor de la cuota';
        }
        break;

      case 'dirCobro':
        if (!value) {
          return 'La dirección de cobro puede ser diferente a la del cliente';
        }
        break;

      case 'certificado':
        if (!value && formData.poliza) {
          return 'Algunas compañías requieren el número de certificado';
        }
        break;

      case 'asignado':
        if (!value) {
          return 'Considere asignar un responsable al trámite';
        }
        break;
    }

    return null;
  }, []);

  // ===== VALIDAR PESTAÑA =====
  const validateTab = useCallback((tabId: FormTabId): TabValidationResult => {
    const tabFields = TabsUtils.getFieldsForTab(tabId);
    const requiredTabFields = TabsUtils.getRequiredFieldsForTab(tabId);
    
    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};
    const missingRequired: string[] = [];

    // Validar cada campo de la pestaña
    tabFields.forEach(field => {
      const validation = validateField(field as keyof PolicyFormData);
      
      if (validation.error) {
        errors[field] = validation.error;
        if (requiredTabFields.includes(field)) {
          missingRequired.push(field);
        }
      }
      
      if (validation.warning) {
        warnings[field] = validation.warning;
      }
    });

    // Calcular completitud
    const completedFields = requiredTabFields.filter(field => {
      const value = formData[field as keyof PolicyFormData];
      return value !== null && value !== undefined && value !== '' && value !== 0;
    });

    const completion = requiredTabFields.length > 0 
      ? Math.round((completedFields.length / requiredTabFields.length) * 100)
      : 100;

    return {
      isValid: Object.keys(errors).length === 0,
      completion,
      errors,
      warnings,
      missingRequired
    };
  }, [formData, validateField]);

  // ===== VALIDAR FORMULARIO COMPLETO =====
  const validateForm = useCallback((): FormValidationResult => {
    const tabResults = {} as Record<FormTabId, TabValidationResult>;
    let totalErrors = 0;
    let totalWarnings = 0;
    const globalErrors: Record<string, string> = {};
    const globalWarnings: Record<string, string> = {};

    // Validar cada pestaña usando TabsUtils.getAllTabs()
    const allTabs = TabsUtils.getAllTabs();
    allTabs.forEach(tab => {
      const tabResult = validateTab(tab.id);
      tabResults[tab.id] = tabResult;
      totalErrors += Object.keys(tabResult.errors).length;
      totalWarnings += Object.keys(tabResult.warnings).length;
    });

    // Validaciones globales cruzadas
    if (formData.premio && formData.total && Number(formData.premio) > Number(formData.total)) {
      globalWarnings.premio = 'El premio es mayor que el total, verifique los montos';
    }

    if (formData.cuotas && formData.valorCuota && formData.total) {
      const totalEstimado = Number(formData.cuotas) * Number(formData.valorCuota);
      const diferencia = Math.abs(totalEstimado - Number(formData.total));
      if (diferencia > Number(formData.total) * 0.1) { // 10% de diferencia
        globalWarnings.valorCuota = 'El total de cuotas no coincide con el total de la póliza';
      }
    }

    // Calcular completitud general
    const allCompletions = Object.values(tabResults).map(r => r.completion);
    const overallCompletion = allCompletions.length > 0 
      ? Math.round(allCompletions.reduce((sum, comp) => sum + comp, 0) / allCompletions.length)
      : 0;

    const isValid = totalErrors === 0 && Object.keys(globalErrors).length === 0;

    return {
      isValid,
      overallCompletion,
      totalErrors,
      totalWarnings,
      tabResults,
      globalErrors,
      globalWarnings
    };
  }, [formData, validateTab]);

  // ===== OBTENER ERRORES SOLO DE CAMPOS TOCADOS =====
  const getTouchedErrors = useCallback(() => {
    const touchedErrors: Record<string, string> = {};
    
    Array.from(touchedFields).forEach(field => {
      const validation = validateField(field as keyof PolicyFormData);
      if (validation.error) {
        touchedErrors[field] = validation.error;
      }
    });

    return touchedErrors;
  }, [touchedFields, validateField]);

  // ===== HELPERS =====
  const helpers = useMemo(() => ({
    // Verificar si un campo es requerido
    isFieldRequired: (field: keyof PolicyFormData) => {
      return validationRules.some(rule => rule.field === field && rule.required);
    },

    // Obtener dependencias de un campo
    getFieldDependencies: (field: keyof PolicyFormData) => {
      const rule = validationRules.find(r => r.field === field);
      return rule?.dependencies || [];
    },

    // Verificar si un campo tiene errores
    hasFieldError: (field: keyof PolicyFormData) => {
      return validateField(field).error !== null;
    },

    // Verificar si un campo tiene warnings
    hasFieldWarning: (field: keyof PolicyFormData) => {
      return validateField(field).warning !== null;
    },

    // Obtener el primer campo con error en una pestaña
    getFirstTabError: (tabId: FormTabId) => {
      const tabResult = validateTab(tabId);
      return Object.keys(tabResult.errors)[0] || null;
    },

    // Obtener estadísticas de validación
    getValidationStats: () => {
      const formResult = validateForm();
      return {
        totalFields: Object.keys(formData).length,
        requiredFields: validationRules.filter(r => r.required).length,
        completedFields: validationRules.filter(r => {
          const value = formData[r.field];
          return value !== null && value !== undefined && value !== '';
        }).length,
        errorsCount: formResult.totalErrors,
        warningsCount: formResult.totalWarnings,
        overallHealth: formResult.overallCompletion
      };
    }
  }), [formData, validationRules, validateField, validateTab, validateForm]);

  // ===== RETURN DEL HOOK =====
  return {
    // Validaciones principales
    validateField,
    validateTab,
    validateForm,
    getTouchedErrors,

    // Helpers
    helpers,

    // Computed values
    currentFormValidation: validateForm(),
    touchedErrors: getTouchedErrors()
  };
};