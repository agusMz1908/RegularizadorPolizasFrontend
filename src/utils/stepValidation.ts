// src/utils/stepValidation.ts

import { WizardStepId, WizardState } from '../types/wizard';
import { PolizaFormData } from '../types/core/poliza';

export interface StepValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * Valida si un paso puede completarse
 */
export function validateStepCompletion(
  stepId: WizardStepId,
  wizardState: WizardState,
  formData?: PolizaFormData
): StepValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

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
    
    case 'extract':
      return validateExtractStep(wizardState, formData);
    
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
 * ✅ CORREGIDO: Validar formato del listado, no formato de Velneo
 */
function validateClienteStep(wizardState: WizardState, formData?: PolizaFormData): StepValidationResult {
  const errors: string[] = [];
  const clienteData = wizardState.stepData.cliente;

  if (!clienteData) {
    errors.push('Debe seleccionar un cliente');
  } else {
    // ✅ VALIDAR ID (campo común)
    if (!clienteData.id) {
      errors.push('Cliente debe tener un ID válido');
    }

    // ✅ VALIDAR NOMBRE (usar campos del listado, no de Velneo)
    // El cliente del listado puede tener 'nombre' o 'clinom'
    const nombreCliente = clienteData.nombre || clienteData.clinom;
    if (!nombreCliente) {
      errors.push('Cliente debe tener un nombre');
    }

    // ✅ VALIDAR DOCUMENTO (usar campos del listado, no de Velneo)
    // El cliente del listado puede tener 'documento' o los campos específicos de Velneo
    const documentoCliente = clienteData.documento || clienteData.cliced || clienteData.cliruc;
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
  const companyData = wizardState.stepData.company;

  if (!companyData) {
    errors.push('Debe seleccionar una compañía');
  } else {
    if (!companyData.id) {
      errors.push('Compañía debe tener un ID válido');
    }
    if (!companyData.nombre) {
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
  const seccionData = wizardState.stepData.seccion;

  if (!seccionData) {
    errors.push('Debe seleccionar una sección');
  } else {
    if (!seccionData.id) {
      errors.push('Sección debe tener un ID válido');
    }
    if (!seccionData.codigo) {
      errors.push('Sección debe tener un código');
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
  const operacionData = wizardState.stepData.operacion;

  if (!operacionData) {
    errors.push('Debe seleccionar un tipo de operación');
  } else {
    const validOperations = ['Nuevo', 'Renovacion', 'Endoso', 'Cancelacion'];
    if (!validOperations.includes(operacionData.tipo)) {
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
  const uploadData = wizardState.stepData.upload;

  if (!uploadData || !uploadData.files || uploadData.files.length === 0) {
    errors.push('Debe subir al menos un documento');
  } else {
    // Validar tipos de archivo
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const invalidFiles = uploadData.files.filter((file: any) => 
      !allowedTypes.includes(file.type)
    );
    
    if (invalidFiles.length > 0) {
      errors.push('Solo se permiten archivos PDF, JPG y PNG');
    }

    // Validar tamaño
    const maxSize = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = uploadData.files.filter((file: any) => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      errors.push('Los archivos no pueden superar los 10MB');
    }

    // Advertencias
    if (uploadData.files.length > 5) {
      warnings.push('Muchos archivos subidos, el procesamiento puede tardar más');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validación paso Extract
 */
function validateExtractStep(wizardState: WizardState, formData?: PolizaFormData): StepValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const extractData = wizardState.stepData.extract;

  // Este paso puede ser opcional si no se pudo procesar
  if (!extractData) {
    warnings.push('No se extrajeron datos automáticamente, deberá completar manualmente');
  } else {
    if (extractData.confidence && extractData.confidence < 0.7) {
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

  // Usar formData si está disponible, sino usar datos del wizard
  const data = formData || wizardState.stepData.form;

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

  if (!data.prima || data.prima <= 0) {
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
  const seccionData = wizardState.stepData.seccion;
  if (seccionData?.codigo === 'AUTO') {
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
export function areRequiredStepsCompleted(wizardState: WizardState, steps: any[]): boolean {
  const requiredSteps = steps.filter(step => step.required);
  return requiredSteps.every(step => wizardState.completedSteps.has(step.id));
}

/**
 * Obtiene el primer paso con errores
 */
export function getFirstStepWithErrors(
  wizardState: WizardState,
  steps: any[],
  formData?: PolizaFormData
): WizardStepId | null {
  for (const step of steps) {
    const validation = validateStepCompletion(step.id, wizardState, formData);
    if (!validation.isValid) {
      return step.id;
    }
  }
  return null;
}