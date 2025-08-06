// src/types/policyForm.ts - VERSIÓN LIMPIA SIN DUPLICACIÓN
// ⚠️ NO DEFINIR SelectOption aquí - importar desde ui.ts

import type { SelectOption } from './ui';  // ← IMPORTAR desde ui.ts
import type { PolicyFormData } from './poliza';
import type { MasterDataOptionsDto } from './masterData';

/**
 * 🗂️ IDs DE PESTAÑAS DEL FORMULARIO
 */
export type FormTabId = 
  | 'datos_basicos'
  | 'datos_poliza' 
  | 'datos_vehiculo'
  | 'datos_cobertura'
  | 'condiciones_pago'
  | 'observaciones';

/**
 * 📊 ESTADO DEL FORMULARIO DE PÓLIZA
 */
export interface PolicyFormState {
  // Datos del formulario
  formData: PolicyFormData;
  
  // Estado de validación
  errors: Record<string, string>;
  touchedFields: Set<string>;
  isValid: boolean;
  
  // Estado de UI
  activeTab: FormTabId;
  isSubmitting: boolean;
  isDirty: boolean;
  
  // Progreso
  completionPercentage: number;
  tabCompletion: Record<FormTabId, number>;
  
  // Datos de contexto
  masterOptions: MasterDataOptionsDto | null;
  loadingMasters: boolean;
}

/**
 * 📊 PROGRESO DEL FORMULARIO
 */
export interface FormProgress {
  overall: number;  // Progreso general 0-100
  byTab: Record<FormTabId, {
    completion: number;     // 0-100
    errors: number;         // Cantidad de errores
    required: string[];     // Campos requeridos
    completed: string[];    // Campos completados
  }>;
}

/**
 * ✅ VALIDACIÓN DE CAMPO
 */
export interface FieldValidation {
  field: keyof PolicyFormData;
  isRequired: boolean;
  validator?: (value: any, formData: PolicyFormData) => string | null;
  dependency?: keyof PolicyFormData;  // Campo del que depende
}

/**
 * ✅ RESULTADO DE VALIDACIÓN DE FORMULARIO
 */
export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
  missingRequired: string[];
}

/**
 * 🎯 ACCIONES DEL FORMULARIO
 */
export interface FormActions {
  updateField: (field: keyof PolicyFormData, value: any) => void;
  setActiveTab: (tab: FormTabId) => void;
  validateForm: () => FormValidationResult;
  resetForm: () => void;
  submitForm: () => Promise<void>;
  goToFieldError: (field: keyof PolicyFormData) => void;
}

/**
 * 🔄 MAPEO AUTOMÁTICO DESDE AZURE
 */
export interface AutoMappingResult {
  mappedFields: (keyof PolicyFormData)[];
  unmappedFields: string[];
  confidence: Record<keyof PolicyFormData, number>;  // 0-100 por campo
  warnings: string[];
  suggestions: Record<string, string[]>;  // Sugerencias para campos no mapeados
}

/**
 * 📝 CONTEXTO DEL FORMULARIO (para React Context si lo usamos)
 */
export interface PolicyFormContextValue {
  state: PolicyFormState;
  actions: FormActions;
  
  // Datos de contexto externa
  scannedData: any;      // AzureProcessResponse
  selectedClient: any;   // ClienteDto
  selectedCompany: any;  // CompanyDto
  selectedSection: any;  // SeccionDto
  
  // Callbacks
  onSubmit: (result: any) => void;
  onError: (error: string) => void;
  onBack: () => void;
}

/**
 * 📋 METADATOS DE CAMPO
 */
export interface FieldMetadata {
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea';
  tab: FormTabId;
  required: boolean;
  readonly?: boolean;
  placeholder?: string;
  icon?: string;
  
  // Para selects
  optionsSource?: 'master' | 'plain';
  masterType?: 'categoria' | 'destino' | 'calidad' | 'combustible' | 'moneda';
  plainOptions?: string[];
  
  // Para validación
  validator?: string;  // Nombre de la función de validación
  dependency?: keyof PolicyFormData;
  
  // Para mapeo automático
  azureField?: string;  // Campo correspondiente en Azure response
  fallbackValue?: any;
}

// Re-exportar SelectOption desde ui.ts para conveniencia
export type { SelectOption };