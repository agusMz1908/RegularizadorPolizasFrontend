// src/utils/stepValidation.ts
// ✅ VERSIÓN CORREGIDA - ERRORES DE TIPOS SOLUCIONADOS

import { WizardStep, WizardState } from '../types/ui/wizard';
import { PolizaFormData } from '../types/core/poliza';
import { TipoOperacion } from './operationLogic';

export interface StepValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

// ✅ Helper para acceso seguro a stepData
const getStepData = (wizardState: WizardState, step: string): any => {
  return wizardState.stepData?.[step as keyof typeof wizardState.stepData];
};

// ✅ Helper para conversión segura string -> number
const toNumber = (value: string | number): number => {
  if (typeof value === 'number') return value;
  if (!value || value === '') return 0;
  const parsed = parseFloat(value.toString().replace(/[^\d.-]/g, ''));
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Valida si un paso puede completarse
 */
export function validateStepCompletion(
  stepId: WizardStep,
  wizardState: WizardState,
  formData?: PolizaFormData
): StepValidationResult {
  switch (stepId) {
    case 'cliente':
      return validateClienteStep(wizardState, formData);
    
    case 'company':
      return validateCompanyStep(wizardState, formData);
    
    case 'seccion':
      return validateSeccionStep(wizardState, formData);
    
    case 'operacion':
      return validateOperacionStep(wizardState, formData);
    
    case 'upload':
      return validateUploadStep(wizardState, formData);
    
    case 'processing':
      return validateProcessingStep(wizardState, formData);
    
    case 'form':
      return validateFormStep(wizardState, formData);
    
    case 'success':
      return { isValid: true, errors: [], warnings: [] };
    
    default:
      return {
        isValid: false,
        errors: [`Paso desconocido: ${stepId}`],
        warnings: []
      };
  }
}

/**
 * Validación paso Cliente
 */
function validateClienteStep(wizardState: WizardState, formData?: PolizaFormData): StepValidationResult {
  const errors: string[] = [];
  
  // ✅ Acceso seguro al cliente seleccionado
  const cliente = wizardState.selectedCliente;

  if (!cliente) {
    errors.push('Debe seleccionar un cliente');
  } else {
    // ✅ Validar ID
    if (!cliente.id) {
      errors.push('Cliente debe tener un ID válido');
    }

    // ✅ Validar nombre (usar campos reales del Cliente)
    const nombreCliente = cliente.clinom || cliente.nombre;
    if (!nombreCliente) {
      errors.push('Cliente debe tener un nombre');
    }

    // ✅ Validar documento (usar campos reales del Cliente)
    const documentoCliente = cliente.cliced || cliente.cliruc || cliente.documento;
    if (!documentoCliente) {
      errors.push('Cliente debe tener un documento (CI o RUC)');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: []
  };
}

/**
 * Validación paso Compañía
 */
function validateCompanyStep(wizardState: WizardState, formData?: PolizaFormData): StepValidationResult {
  const errors: string[] = [];
  
  // ✅ Acceso seguro a la compañía seleccionada
  const company = wizardState.selectedCompany;

  if (!company) {
    errors.push('Debe seleccionar una compañía');
  } else {
    if (!company.id) {
      errors.push('Compañía debe tener un ID válido');
    }
    // ✅ Usar campo real 'nombre' de Company
    if (!company.nombre) {
      errors.push('Compañía debe tener un nombre');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: []
  };
}

/**
 * Validación paso Sección
 */
function validateSeccionStep(wizardState: WizardState, formData?: PolizaFormData): StepValidationResult {
  const errors: string[] = [];
  
  // ✅ Acceso seguro a la sección seleccionada
  const seccion = wizardState.selectedSeccion;

  if (!seccion) {
    errors.push('Debe seleccionar una sección');
  } else {
    if (!seccion.id) {
      errors.push('Sección debe tener un ID válido');
    }
    // ✅ Usar campo real 'seccion' de Seccion
    if (!seccion.seccion) {
      errors.push('Sección debe tener un nombre');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: []
  };
}

/**
 * Validación paso Operación
 */
function validateOperacionStep(wizardState: WizardState, formData?: PolizaFormData): StepValidationResult {
  const errors: string[] = [];
  
  // ✅ Acceso seguro a la operación seleccionada
  const operacion = wizardState.selectedOperacion;

  if (!operacion) {
    errors.push('Debe seleccionar un tipo de operación');
  } else {
    // ✅ Validar usando TipoOperacion enum
    const validOperations: TipoOperacion[] = ['EMISION', 'RENOVACION', 'ENDOSO'];
    if (!validOperations.includes(operacion)) {
      errors.push('Tipo de operación no válido');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: []
  };
}

/**
 * Validación paso Upload
 */
function validateUploadStep(wizardState: WizardState, formData?: PolizaFormData): StepValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // ✅ Acceso seguro al archivo subido
  const uploadedFile = wizardState.uploadedFile;

  if (!uploadedFile) {
    errors.push('Debe subir un documento');
  } else {
    // Validar tipo de archivo
    const allowedTypes = ['application/pdf'];
    if (!allowedTypes.includes(uploadedFile.type)) {
      errors.push('Solo se permiten archivos PDF');
    }

    // Validar tamaño
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (uploadedFile.size > maxSize) {
      errors.push('El archivo no puede superar los 10MB');
    }

    // Advertencias
    if (uploadedFile.size > 5 * 1024 * 1024) { // 5MB
      warnings.push('Archivo grande, el procesamiento puede tardar más');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validación paso Processing (antes Extract)
 */
function validateProcessingStep(wizardState: WizardState, formData?: PolizaFormData): StepValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // ✅ Acceso seguro a los datos extraídos
  const extractedData = wizardState.extractedData;

  // Este paso puede ser opcional si no se pudo procesar
  if (!extractedData) {
    warnings.push('No se extrajeron datos automáticamente, deberá completar manualmente');
  } else {
    if (!extractedData.success) {
      warnings.push('El procesamiento no fue completamente exitoso, verifique los datos');
    }
    
    if (extractedData.confidence && extractedData.confidence < 70) {
      warnings.push('Baja confianza en la extracción, verifique los datos cuidadosamente');
    }
  }

  return {
    isValid: true, // Este paso siempre es válido
    errors,
    warnings
  };
}

/**
 * Validación paso Form
 */
function validateFormStep(wizardState: WizardState, formData?: PolizaFormData): StepValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // ✅ Usar formData si está disponible
  const data = formData;

  if (!data) {
    errors.push('No hay datos del formulario para validar');
    return { isValid: false, errors, warnings };
  }

  // Validaciones obligatorias
  if (!data.numeroPoliza) {
    errors.push('Número de póliza es obligatorio');
  }

  if (!data.asegurado) {
    errors.push('Nombre del asegurado es obligatorio');
  }

  if (!data.vigenciaDesde) {
    errors.push('Fecha de inicio de vigencia es obligatoria');
  }

  if (!data.vigenciaHasta) {
    errors.push('Fecha de fin de vigencia es obligatoria');
  }

  // ✅ Validación corregida para prima como string
  const primaNum = toNumber(data.prima);
  if (!data.prima || primaNum <= 0) {
    errors.push('Prima debe ser mayor a cero');
  }

  // Validaciones de fechas
  if (data.vigenciaDesde && data.vigenciaHasta) {
    const fechaDesde = new Date(data.vigenciaDesde);
    const fechaHasta = new Date(data.vigenciaHasta);
    
    if (fechaDesde >= fechaHasta) {
      errors.push('La fecha de inicio debe ser anterior a la fecha de fin');
    }

    const now = new Date();
    if (fechaHasta < now) {
      warnings.push('La póliza ya está vencida');
    }
  }

  // Validaciones específicas por sección
  const seccion = wizardState.selectedSeccion;
  if (seccion?.seccion === 'AUTOMOVILES') {
    if (!data.matricula) {
      errors.push('Matrícula es obligatoria para seguros de auto');
    }
    if (!data.marca) {
      warnings.push('Se recomienda especificar la marca del vehículo');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Verifica si todos los pasos requeridos están completados
 */
export function areRequiredStepsCompleted(
  wizardState: WizardState, 
  requiredSteps: WizardStep[]
): boolean {
  // ✅ Verificar que los campos requeridos estén presentes
  const hasCliente = !!wizardState.selectedCliente;
  const hasCompany = !!wizardState.selectedCompany;
  const hasSeccion = !!wizardState.selectedSeccion;
  const hasOperacion = !!wizardState.selectedOperacion;
  const hasFile = !!wizardState.uploadedFile;

  // Verificar según los pasos requeridos
  for (const step of requiredSteps) {
    switch (step) {
      case 'cliente':
        if (!hasCliente) return false;
        break;
      case 'company':
        if (!hasCompany) return false;
        break;
      case 'seccion':
        if (!hasSeccion) return false;
        break;
      case 'operacion':
        if (!hasOperacion) return false;
        break;
      case 'upload':
        if (!hasFile) return false;
        break;
    }
  }

  return true;
}

/**
 * Obtiene el primer paso con errores
 */
export function getFirstStepWithErrors(
  wizardState: WizardState,
  steps: WizardStep[],
  formData?: PolizaFormData
): WizardStep | null {
  for (const step of steps) {
    const validation = validateStepCompletion(step, wizardState, formData);
    if (!validation.isValid) {
      return step;
    }
  }
  return null;
}

/**
 * Valida el estado completo del wizard
 */
export function validateWizardState(wizardState: WizardState, formData?: PolizaFormData): StepValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validar cada paso
  const steps: WizardStep[] = ['cliente', 'company', 'seccion', 'operacion', 'upload'];
  
  for (const step of steps) {
    const validation = validateStepCompletion(step, wizardState, formData);
    errors.push(...validation.errors);
    warnings.push(...(validation.warnings || []));
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Obtiene el siguiente paso válido
 */
export function getNextValidStep(wizardState: WizardState): WizardStep | null {
  const stepOrder: WizardStep[] = [
    'cliente', 
    'company', 
    'seccion', 
    'operacion', 
    'upload', 
    'processing', 
    'form', 
    'success'
  ];

  for (const step of stepOrder) {
    const validation = validateStepCompletion(step, wizardState);
    if (!validation.isValid) {
      return step;
    }
  }

  return null;
}

export default {
  validateStepCompletion,
  areRequiredStepsCompleted,
  getFirstStepWithErrors,
  validateWizardState,
  getNextValidStep
};