import { PolizaFormData } from '../types/core/poliza';
import { ValidationError, ValidationResult } from '../types/wizard/validation';

export function validateCI(ci: string): { isValid: boolean; error?: string; formatted?: string } {
  if (!ci) {
    return { isValid: false, error: 'La cédula es requerida' };
  }

  const cleanCI = ci.replace(/\D/g, '');
  
  if (cleanCI.length < 7 || cleanCI.length > 8) {
    return { isValid: false, error: 'La cédula debe tener 7 u 8 dígitos' };
  }

  const formattedCI = cleanCI.padStart(8, '0');

  if (!validateCICheckDigit(formattedCI)) {
    return { isValid: false, error: 'Número de cédula inválido' };
  }

  return { 
    isValid: true, 
    formatted: formatCI(formattedCI)
  };
}

function validateCICheckDigit(ci: string): boolean {
  if (ci.length !== 8) return false;
  
  const digits = ci.split('').map(Number);
  const weights = [2, 9, 8, 7, 6, 3, 4];
  
  let sum = 0;
  for (let i = 0; i < 7; i++) {
    sum += digits[i] * weights[i];
  }
  
  const remainder = sum % 10;
  const checkDigit = remainder === 0 ? 0 : 10 - remainder;
  
  return checkDigit === digits[7];
}

export function formatCI(ci: string): string {
  const clean = ci.replace(/\D/g, '').padStart(8, '0');
  return `${clean.slice(0, 1)}.${clean.slice(1, 4)}.${clean.slice(4, 7)}-${clean.slice(7)}`;
}

export function validateRUT(rut: string): { isValid: boolean; error?: string; formatted?: string } {
  if (!rut) {
    return { isValid: false, error: 'El RUT es requerido' };
  }

  const cleanRUT = rut.replace(/\D/g, '');
  
  if (cleanRUT.length !== 12) {
    return { isValid: false, error: 'El RUT debe tener 12 dígitos' };
  }

  if (!validateRUTCheckDigit(cleanRUT)) {
    return { isValid: false, error: 'Número de RUT inválido' };
  }

  return { 
    isValid: true, 
    formatted: formatRUT(cleanRUT)
  };
}

function validateRUTCheckDigit(rut: string): boolean {
  if (rut.length !== 12) return false;
  
  const digits = rut.split('').map(Number);
  const weights = [4, 3, 6, 7, 8, 9, 2, 3, 4, 5, 6];
  
  let sum = 0;
  for (let i = 0; i < 11; i++) {
    sum += digits[i] * weights[i];
  }
  
  const remainder = sum % 11;
  let checkDigit: number;
  
  if (remainder < 2) {
    checkDigit = remainder;
  } else {
    checkDigit = 11 - remainder;
  }
  
  return checkDigit === digits[11];
}

export function formatRUT(rut: string): string {
  const clean = rut.replace(/\D/g, '');
  return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}.${clean.slice(8, 11)}.${clean.slice(11)}`;
}

export function validateMatricula(matricula: string): { isValid: boolean; error?: string; formatted?: string } {
  if (!matricula) {
    return { isValid: true }; 
  }

  const clean = matricula.replace(/[^A-Z0-9]/g, '').toUpperCase();

  const formats = [
    /^[A-Z]{3}\d{4}$/,  
    /^[A-Z]{2}\d{4}$/,  
    /^\d{4}[A-Z]{2}$/  
  ];

  const isValidFormat = formats.some(format => format.test(clean));
  
  if (!isValidFormat) {
    return { 
      isValid: false, 
      error: 'Formato de matrícula inválido. Use ABC1234, AB1234 o 1234AB' 
    };
  }

  return { 
    isValid: true, 
    formatted: clean 
  };
}

export function validateTelefono(telefono: string): { isValid: boolean; error?: string; formatted?: string } {
  if (!telefono) {
    return { isValid: true }; // Opcional
  }

  const clean = telefono.replace(/\D/g, '');

  if (clean.length < 8 || clean.length > 9) {
    return { 
      isValid: false, 
      error: 'El teléfono debe tener 8 o 9 dígitos' 
    };
  }

  if (clean.length === 9) {
    if (!clean.startsWith('09')) {
      return { 
        isValid: false, 
        error: 'Los móviles deben comenzar con 09' 
      };
    }
  } else if (clean.length === 8) {
    if (clean.startsWith('0') || clean.startsWith('1')) {
      return { 
        isValid: false, 
        error: 'Número de teléfono fijo inválido' 
      };
    }
  }

  return { 
    isValid: true, 
    formatted: formatTelefono(clean)
  };
}

export function formatTelefono(telefono: string): string {
  const clean = telefono.replace(/\D/g, '');
  
  if (clean.length === 9) {
    return `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6)}`;
  } else if (clean.length === 8) {
    return `${clean.slice(0, 4)} ${clean.slice(4)}`;
  }
  
  return telefono;
}

export function validateCodigoPostal(cp: string): { isValid: boolean; error?: string } {
  if (!cp) {
    return { isValid: true }; 
  }

  const clean = cp.replace(/\D/g, '');
  
  if (clean.length !== 5) {
    return { 
      isValid: false, 
      error: 'El código postal debe tener 5 dígitos' 
    };
  }

  const cpNum = parseInt(clean);
  if (cpNum < 10000 || cpNum > 99999) {
    return { 
      isValid: false, 
      error: 'Código postal fuera del rango válido' 
    };
  }

  return { isValid: true };
}

export function validateNumeroPoliza(numero: string): { isValid: boolean; error?: string } {
  if (!numero) {
    return { isValid: false, error: 'El número de póliza es requerido' };
  }

  if (numero.length < 5) {
    return { 
      isValid: false, 
      error: 'El número de póliza debe tener al menos 5 caracteres' 
    };
  }

  if (numero.length > 20) {
    return { 
      isValid: false, 
      error: 'El número de póliza no puede tener más de 20 caracteres' 
    };
  }

  return { isValid: true };
}

export function validateVigencia(desde: string, hasta: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!desde) {
    errors.push('La fecha de inicio de vigencia es requerida');
  }

  if (!hasta) {
    errors.push('La fecha de fin de vigencia es requerida');
  }

  if (desde && hasta) {
    const fechaDesde = new Date(desde);
    const fechaHasta = new Date(hasta);

    if (isNaN(fechaDesde.getTime())) {
      errors.push('Fecha de inicio inválida');
    }

    if (isNaN(fechaHasta.getTime())) {
      errors.push('Fecha de fin inválida');
    }

    if (fechaDesde.getTime() && fechaHasta.getTime()) {
      if (fechaHasta <= fechaDesde) {
        errors.push('La fecha de fin debe ser posterior a la fecha de inicio');
      }

      const diffYears = (fechaHasta.getTime() - fechaDesde.getTime()) / (1000 * 60 * 60 * 24 * 365);
      if (diffYears > 2) {
        errors.push('La vigencia no puede ser mayor a 2 años');
      }

      const today = new Date();
      const diffDaysFromToday = (fechaDesde.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDaysFromToday < -365) {
        errors.push('La fecha de inicio no puede ser mayor a 1 año en el pasado');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateMontos(prima: number, premioTotal?: number): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!prima || prima <= 0) {
    errors.push('La prima debe ser mayor a 0');
  }

  if (prima > 10000000) {
    errors.push('La prima parece excesivamente alta, verificar');
  }

  if (premioTotal !== undefined) {
    if (premioTotal < prima) {
      errors.push('El premio total no puede ser menor a la prima');
    }

    if (premioTotal > prima * 2) {
      errors.push('El premio total parece excesivamente alto comparado con la prima');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateAnoVehiculo(ano: string | number): { isValid: boolean; error?: string } {
  const currentYear = new Date().getFullYear();
  const year = typeof ano === 'string' ? parseInt(ano) : ano;

  if (!year || isNaN(year)) {
    return { isValid: false, error: 'El año del vehículo es requerido' };
  }

  if (year < 1900) {
    return { isValid: false, error: 'Año del vehículo muy antiguo' };
  }

  if (year > currentYear + 1) {
    return { isValid: false, error: 'Año del vehículo no puede ser futuro' };
  }

  return { isValid: true };
}

export function validateEmail(email: string): { isValid: boolean; error?: string } {
  if (!email) {
    return { isValid: true }; 
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Formato de email inválido' };
  }

  if (email.length > 254) {
    return { isValid: false, error: 'Email demasiado largo' };
  }

  return { isValid: true };
}

export function validateRequired(value: any, fieldName: string): { isValid: boolean; error?: string } {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, error: `${fieldName} es requerido` };
  }

  if (typeof value === 'string' && value.trim() === '') {
    return { isValid: false, error: `${fieldName} es requerido` };
  }

  return { isValid: true };
}

export function validateLength(
  value: string, 
  fieldName: string, 
  min?: number, 
  max?: number
): { isValid: boolean; error?: string } {
  if (!value) {
    return { isValid: true }; 
  }

  if (min !== undefined && value.length < min) {
    return { 
      isValid: false, 
      error: `${fieldName} debe tener al menos ${min} caracteres` 
    };
  }

  if (max !== undefined && value.length > max) {
    return { 
      isValid: false, 
      error: `${fieldName} no puede tener más de ${max} caracteres` 
    };
  }

  return { isValid: true };
}

export function validatePolizaForm(formData: PolizaFormData): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  const requiredValidation = validateRequired(formData.asegurado, 'Nombre del asegurado');
  if (!requiredValidation.isValid) {
    errors.push({
      field: 'asegurado',
      message: requiredValidation.error!,
      severity: 'error'
    });
  }

  if (formData.documento) {
    const ciValidation = validateCI(formData.documento);
    if (!ciValidation.isValid) {
      errors.push({
        field: 'documento',
        message: ciValidation.error!,
        severity: 'error'
      });
    }
  }

  const polizaValidation = validateNumeroPoliza(formData.numeroPoliza);
  if (!polizaValidation.isValid) {
    errors.push({
      field: 'numeroPoliza',
      message: polizaValidation.error!,
      severity: 'error'
    });
  }

  const vigenciaValidation = validateVigencia(formData.vigenciaDesde, formData.vigenciaHasta);
  if (!vigenciaValidation.isValid) {
    vigenciaValidation.errors.forEach(error => {
      errors.push({
        field: 'vigencia',
        message: error,
        severity: 'error'
      });
    });
  }

  const montosValidation = validateMontos(formData.prima, formData.premioTotal);
  if (!montosValidation.isValid) {
    montosValidation.errors.forEach(error => {
      errors.push({
        field: 'prima',
        message: error,
        severity: 'error'
      });
    });
  }

  if (formData.email) {
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      errors.push({
        field: 'email',
        message: emailValidation.error!,
        severity: 'error'
      });
    }
  }

  if (formData.telefono) {
    const telefonoValidation = validateTelefono(formData.telefono);
    if (!telefonoValidation.isValid) {
      errors.push({
        field: 'telefono',
        message: telefonoValidation.error!,
        severity: 'error'
      });
    }
  }

  if (formData.matricula) {
    const matriculaValidation = validateMatricula(formData.matricula);
    if (!matriculaValidation.isValid) {
      warnings.push({
        field: 'matricula',
        message: matriculaValidation.error!,
        severity: 'warning'
      });
    }
  }

  if (formData.anio) {
    const anoValidation = validateAnoVehiculo(formData.anio);
    if (!anoValidation.isValid) {
      errors.push({
        field: 'anio',
        message: anoValidation.error!,
        severity: 'error'
      });
    }
  }

  if (formData.prima > 100000) {
    warnings.push({
      field: 'prima',
      message: 'Prima muy alta, revisar con supervisor',
      severity: 'warning'
    });
  }

  const fieldErrors: Record<string, string> = {};
  errors.forEach(error => {
    if (!fieldErrors[error.field]) {
      fieldErrors[error.field] = error.message;
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fieldErrors
  };
}

export function validateField(
  fieldName: keyof PolizaFormData, 
  value: any, 
  formData?: PolizaFormData
): ValidationError[] {
  const errors: ValidationError[] = [];

  switch (fieldName) {
    case 'asegurado':
    case 'nombreAsegurado':
      const requiredValidation = validateRequired(value, 'Nombre del asegurado');
      if (!requiredValidation.isValid) {
        errors.push({
          field: fieldName,
          message: requiredValidation.error!,
          severity: 'error'
        });
      }
      
      const lengthValidation = validateLength(value, 'Nombre del asegurado', 3, 100);
      if (!lengthValidation.isValid) {
        errors.push({
          field: fieldName,
          message: lengthValidation.error!,
          severity: 'error'
        });
      }
      break;

    case 'documento':
      if (value) {
        const ciValidation = validateCI(value);
        if (!ciValidation.isValid) {
          errors.push({
            field: fieldName,
            message: ciValidation.error!,
            severity: 'error'
          });
        }
      }
      break;

    case 'email':
      if (value) {
        const emailValidation = validateEmail(value);
        if (!emailValidation.isValid) {
          errors.push({
            field: fieldName,
            message: emailValidation.error!,
            severity: 'error'
          });
        }
      }
      break;

    case 'telefono':
      if (value) {
        const telefonoValidation = validateTelefono(value);
        if (!telefonoValidation.isValid) {
          errors.push({
            field: fieldName,
            message: telefonoValidation.error!,
            severity: 'error'
          });
        }
      }
      break;

    case 'matricula':
      if (value) {
        const matriculaValidation = validateMatricula(value);
        if (!matriculaValidation.isValid) {
          errors.push({
            field: fieldName,
            message: matriculaValidation.error!,
            severity: 'warning'
          });
        }
      }
      break;

    case 'numeroPoliza':
      const polizaValidation = validateNumeroPoliza(value);
      if (!polizaValidation.isValid) {
        errors.push({
          field: fieldName,
          message: polizaValidation.error!,
          severity: 'error'
        });
      }
      break;

    case 'prima':
      if (value <= 0) {
        errors.push({
          field: fieldName,
          message: 'La prima debe ser mayor a 0',
          severity: 'error'
        });
      }
      if (value > 100000) {
        errors.push({
          field: fieldName,
          message: 'Prima muy alta, revisar con supervisor',
          severity: 'warning'
        });
      }
      break;

    case 'anio':
      if (value) {
        const anoValidation = validateAnoVehiculo(value);
        if (!anoValidation.isValid) {
          errors.push({
            field: fieldName,
            message: anoValidation.error!,
            severity: 'error'
          });
        }
      }
      break;

    case 'vigenciaDesde':
    case 'vigenciaHasta':
      if (formData && formData.vigenciaDesde && formData.vigenciaHasta) {
        const vigenciaValidation = validateVigencia(formData.vigenciaDesde, formData.vigenciaHasta);
        if (!vigenciaValidation.isValid) {
          vigenciaValidation.errors.forEach(error => {
            errors.push({
              field: fieldName,
              message: error,
              severity: 'error'
            });
          });
        }
      }
      break;
  }

  return errors;
}

export function cleanAndFormatFormData(formData: PolizaFormData): PolizaFormData {
  const cleaned = { ...formData };

  if (cleaned.documento) {
    const ciValidation = validateCI(cleaned.documento);
    if (ciValidation.isValid && ciValidation.formatted) {
      cleaned.documento = ciValidation.formatted;
    }
  }

  if (cleaned.telefono) {
    const telefonoValidation = validateTelefono(cleaned.telefono);
    if (telefonoValidation.isValid && telefonoValidation.formatted) {
      cleaned.telefono = telefonoValidation.formatted;
    }
  }

  if (cleaned.matricula) {
    const matriculaValidation = validateMatricula(cleaned.matricula);
    if (matriculaValidation.isValid && matriculaValidation.formatted) {
      cleaned.matricula = matriculaValidation.formatted;
    }
  }

  if (cleaned.asegurado) {
    cleaned.asegurado = cleaned.asegurado.trim();
  }
  if (cleaned.nombreAsegurado) {
    cleaned.nombreAsegurado = cleaned.nombreAsegurado.trim();
  }
  if (cleaned.email) {
    cleaned.email = cleaned.email.trim().toLowerCase();
  }

  return cleaned;
}

export default {
  validateCI,
  validateRUT,
  validateMatricula,
  validateTelefono,
  validateCodigoPostal,
  
  formatCI,
  formatRUT,
  formatTelefono,
  
  validateNumeroPoliza,
  validateVigencia,
  validateMontos,
  validateAnoVehiculo,
  
  validateEmail,
  validateRequired,
  validateLength,
  
  validatePolizaForm,
  validateField,
  cleanAndFormatFormData
};