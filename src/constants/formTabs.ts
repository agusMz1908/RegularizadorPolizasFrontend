// src/constants/formTabs.ts - Configuración de pestañas del formulario (COMPATIBLE CON TU ESTRUCTURA)

import type { FormTabId, PolicyFormData } from '../types/policyForm';
import { REQUIRED_FIELDS_BY_TAB } from './velneoDefault';

export interface FormTab {
  id: FormTabId;
  label: string;
  icon: string;
  description: string;
  color: string;
  fields: (keyof PolicyFormData)[];
}

// ===== DEFINICIÓN DE PESTAÑAS COMPATIBLES CON TU ESTRUCTURA =====
export const FORM_TABS: FormTab[] = [
  {
    id: 'datos_basicos',
    label: 'Datos Básicos',
    icon: 'User',
    description: 'Corredor, asegurado y tomador',
    color: 'bg-blue-500',
    fields: [
      'corredor', 'asegurado', 'dirCobro', 'estadoTramite', 
      'tomador', 'domicilio', 'tramite', 'fecha', 'asignado', 'tipo', 'estadoPoliza'
    ]
  },
  {
    id: 'datos_poliza',
    label: 'Datos Póliza',
    icon: 'FileText',
    description: 'Compañía, fechas, número',
    color: 'bg-green-500',
    fields: ['compania', 'desde', 'hasta', 'poliza', 'certificado']
  },
  {
    id: 'datos_vehiculo',
    label: 'Vehículo',
    icon: 'Car',
    description: 'Marca, modelo, características',
    color: 'bg-purple-500',
    fields: [
      'marcaModelo', 'anio', 'matricula', 'motor', 'destinoId', 
      'combustibleId', 'chasis', 'calidadId', 'categoriaId'
    ]
  },
  {
    id: 'datos_cobertura',
    label: 'Cobertura',
    icon: 'Shield',
    description: 'Cobertura y zona',
    color: 'bg-orange-500',
    fields: ['coberturaId', 'zonaCirculacion', 'monedaId']
  },
  {
    id: 'condiciones_pago',
    label: 'Pago',
    icon: 'CreditCard',
    description: 'Forma pago, premio, cuotas',
    color: 'bg-emerald-500',
    fields: ['formaPago', 'premio', 'total', 'moneda', 'valorCuota', 'cuotas']
  },
  {
    id: 'observaciones',
    label: 'Observaciones',
    icon: 'MessageSquare',
    description: 'Notas adicionales',
    color: 'bg-slate-500',
    fields: ['observaciones']
  }
] as const;

// ===== MAPEO INVERSO: CAMPO → PESTAÑA =====
export const FIELD_TO_TAB: Record<string, FormTabId> = FORM_TABS.reduce((acc, tab) => {
  tab.fields.forEach(field => {
    acc[field as string] = tab.id;
  });
  return acc;
}, {} as Record<string, FormTabId>);

// ===== UTILIDADES PARA MANEJO DE PESTAÑAS =====
export const TabsUtils = {
  /**
   * Obtiene todas las pestañas ordenadas
   */
  getAllTabs: (): FormTab[] => {
    return [...FORM_TABS]; // Retorna copia para evitar mutaciones
  },

  /**
   * Obtiene una pestaña por su ID
   */
  getTabById: (tabId: FormTabId): FormTab | undefined => {
    return FORM_TABS.find(tab => tab.id === tabId);
  },

  /**
   * Obtiene la siguiente pestaña
   */
  getNextTab: (currentTabId: FormTabId): FormTab | null => {
    const currentIndex = FORM_TABS.findIndex(tab => tab.id === currentTabId);
    if (currentIndex === -1 || currentIndex === FORM_TABS.length - 1) return null;
    return FORM_TABS[currentIndex + 1];
  },

  /**
   * Obtiene la pestaña anterior
   */
  getPreviousTab: (currentTabId: FormTabId): FormTab | null => {
    const currentIndex = FORM_TABS.findIndex(tab => tab.id === currentTabId);
    if (currentIndex <= 0) return null;
    return FORM_TABS[currentIndex - 1];
  },

  /**
   * Obtiene todos los campos de una pestaña
   */
  getFieldsForTab: (tabId: FormTabId): string[] => {
    const tab = FORM_TABS.find(t => t.id === tabId);
    return tab ? tab.fields.map(f => f as string) : [];
  },

  /**
   * Obtiene los campos requeridos de una pestaña
   */
  getRequiredFieldsForTab: (tabId: FormTabId): string[] => {
    const requiredFields = REQUIRED_FIELDS_BY_TAB[tabId];
    return requiredFields ? [...requiredFields] : []; // Copia el array readonly
  },

  /**
   * Obtiene la pestaña que contiene un campo específico
   */
  getTabForField: (field: string): FormTabId | null => {
    return FIELD_TO_TAB[field] || null;
  },

  /**
   * Verifica si una pestaña es la primera
   */
  isFirstTab: (tabId: FormTabId): boolean => {
    return FORM_TABS[0]?.id === tabId;
  },

  /**
   * Verifica si una pestaña es la última
   */
  isLastTab: (tabId: FormTabId): boolean => {
    return FORM_TABS[FORM_TABS.length - 1]?.id === tabId;
  },

  /**
   * Calcula el progreso general basado en todas las pestañas
   */
  calculateOverallProgress: (formData: PolicyFormData): number => {
    const allTabs = TabsUtils.getAllTabs();
    let totalRequired = 0;
    let totalCompleted = 0;

    allTabs.forEach(tab => {
      const requiredFields = TabsUtils.getRequiredFieldsForTab(tab.id);
      totalRequired += requiredFields.length;
      
      const completedFields = requiredFields.filter(field => {
        const value = formData[field as keyof PolicyFormData];
        return value !== null && value !== undefined && value !== '';
      });
      
      totalCompleted += completedFields.length;
    });

    return totalRequired > 0 ? Math.round((totalCompleted / totalRequired) * 100) : 0;
  },

  /**
   * Obtiene estadísticas de validación por pestaña
   */
  getTabValidationStats: (tabId: FormTabId, formData: PolicyFormData, errors: Record<string, string>) => {
    const requiredFields = TabsUtils.getRequiredFieldsForTab(tabId);
    const allFields = TabsUtils.getFieldsForTab(tabId);
    
    const completedRequired = requiredFields.filter(field => {
      const value = formData[field as keyof PolicyFormData];
      return value !== null && value !== undefined && value !== '';
    });

    const tabErrors = allFields.filter(field => errors[field]);

    return {
      totalRequired: requiredFields.length,
      completedRequired: completedRequired.length,
      completion: requiredFields.length > 0 ? Math.round((completedRequired.length / requiredFields.length) * 100) : 100,
      hasErrors: tabErrors.length > 0,
      errorCount: tabErrors.length
    };
  }
};