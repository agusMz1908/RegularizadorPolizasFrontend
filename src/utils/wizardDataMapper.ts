import { Cliente } from '../types/core/cliente';
import { Company } from '../types/core/company';
import { PolizaFormData } from '../types/core/poliza';
import { Seccion } from '../types/core/seccion';
import { TipoOperacion } from './operationLogic';

export function mapClienteToFormData(cliente: Cliente): Partial<PolizaFormData> {
  return {
    clienteId: cliente.id,
    asegurado: cliente.clinom || '',
    nombreAsegurado: cliente.clinom || '',
    documento: cliente.cliced || cliente.cliruc || '',
    telefono: cliente.clitelcel || cliente.telefono || '',
    email: cliente.cliemail || '',
    direccion: cliente.clidir || '',
    departamento: cliente.clidptnom || '',
    localidad: cliente.clilocnom || '',
    codigoPostal: cliente.cliposcod?.toString() || '',
    tipo: cliente.clitpo || 'PERSONA'
  };
}

/**
 * Mapea datos de la compañía de Velneo a PolizaFormData
 */
export function mapCompanyToFormData(company: Company): Partial<PolizaFormData> {
  return {
    compania: company.id,
    nombreCompania: company.comnom || ''
  };
}

/**
 * Mapea datos de la sección de Velneo a PolizaFormData
 */
export function mapSeccionToFormData(seccion: Seccion): Partial<PolizaFormData> {
  return {
    seccionId: seccion.id,
    seccion: seccion.seccion || '',
    ramo: mapSeccionToRamo(seccion.seccion)
  };
}

/**
 * Mapea datos de la operación a PolizaFormData
 */
export function mapOperacionToFormData(operacion: TipoOperacion): Partial<PolizaFormData> {
  return {
    operacion: operacion
  };
}

// ============================================================================
// 🎨 FUNCIONES DE DISPLAY PARA UI
// ============================================================================

/**
 * Obtiene el nombre para mostrar del cliente
 */
export function getClienteDisplayName(cliente: Cliente | null): string {
  if (!cliente) return 'No seleccionado';
  return cliente.clinom || `Cliente ID: ${cliente.id}`;
}

/**
 * Obtiene el nombre para mostrar de la compañía
 */
export function getCompanyDisplayName(company: Company | null): string {
  if (!company) return 'No seleccionada';
  return company.comnom || `Compañía ID: ${company.id}`;
}

/**
 * Obtiene el nombre para mostrar de la sección
 */
export function getSeccionDisplayName(seccion: Seccion | null): string {
  if (!seccion) return 'No seleccionada';
  return seccion.seccion || `Sección ID: ${seccion.id}`;
}

/**
 * Obtiene el nombre para mostrar de la operación
 */
export function getOperacionDisplayName(operacion: TipoOperacion | null): string {
  if (!operacion) return 'No especificada';
  return operacion;
}

// ============================================================================
// 🛠️ FUNCIONES AUXILIARES
// ============================================================================

/**
 * Mapea nombre de sección a código de ramo
 */
function mapSeccionToRamo(seccionNombre: string): string {
  const seccionUpper = seccionNombre.toUpperCase();
  
  if (seccionUpper.includes('AUTO') || seccionUpper.includes('VEHICUL')) {
    return 'AUTO';
  } else if (seccionUpper.includes('HOGAR') || seccionUpper.includes('CASA')) {
    return 'HOGAR';
  } else if (seccionUpper.includes('VIDA')) {
    return 'VIDA';
  } else if (seccionUpper.includes('ACCIDENTE')) {
    return 'ACCIDENTES';
  } else if (seccionUpper.includes('SALUD')) {
    return 'SALUD';
  }
  
  return seccionNombre;
}

/**
 * Combina todos los datos del wizard en un objeto PolizaFormData parcial
 */
export function combineWizardData(wizardStepData: {
  cliente: Cliente | null;
  company: Company | null;
  seccion: Seccion | null;
  operacion: TipoOperacion | null;
}): Partial<PolizaFormData> {
  const combined: Partial<PolizaFormData> = {};

  // Mapear datos del cliente
  if (wizardStepData.cliente) {
    Object.assign(combined, mapClienteToFormData(wizardStepData.cliente));
  }

  // Mapear datos de la compañía
  if (wizardStepData.company) {
    Object.assign(combined, mapCompanyToFormData(wizardStepData.company));
  }

  // Mapear datos de la sección
  if (wizardStepData.seccion) {
    Object.assign(combined, mapSeccionToFormData(wizardStepData.seccion));
  }

  // Mapear datos de la operación
  if (wizardStepData.operacion) {
    Object.assign(combined, mapOperacionToFormData(wizardStepData.operacion));
  }

  return combined;
}

/**
 * Valida que los datos del wizard sean válidos
 */
export function validateWizardData(wizardStepData: {
  cliente: Cliente | null;
  company: Company | null;
  seccion: Seccion | null;
  operacion: TipoOperacion | null;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!wizardStepData.cliente) {
    errors.push('Cliente es requerido');
  } else if (!wizardStepData.cliente.clinom) {
    errors.push('Cliente debe tener un nombre válido');
  }

  if (!wizardStepData.company) {
    errors.push('Compañía es requerida');
  } else if (!wizardStepData.company.comnom) {
    errors.push('Compañía debe tener un nombre válido');
  }

  if (!wizardStepData.seccion) {
    errors.push('Sección es requerida');
  } else if (!wizardStepData.seccion.seccion) {
    errors.push('Sección debe tener un nombre válido');
  }

  if (!wizardStepData.operacion) {
    errors.push('Tipo de operación es requerido');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// ============================================================================
// 🔧 UTILIDADES DE DEBUG
// ============================================================================

/**
 * Función para debug del mapeo de datos
 */
export function debugWizardMapping(
  wizardStepData: any,
  mappedData: Partial<PolizaFormData>
): void {
  console.group('🔍 DEBUG: Mapeo de datos del wizard');
  console.log('📝 Datos originales del wizard:', wizardStepData);
  console.log('📤 Datos mapeados para formulario:', mappedData);
  console.groupEnd();
}