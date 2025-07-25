/**
 * src/utils/validators.ts
 * Funciones de validación para formularios y datos
 */

import type { PolizaCreateRequest, PolizaFormData } from '../types/core/poliza';

// ============================================================================
// 🔍 TIPOS DE VALIDACIÓN
// ============================================================================

export interface ValidationResult {
  esValido: boolean;
  errores: string[];
  warnings?: string[];
}

export interface CampoValidacion {
  campo: string;
  esValido: boolean;
  error?: string;
  valor: any;
}

// ============================================================================
// 🛡️ VALIDACIONES PRINCIPALES
// ============================================================================

/**
 * Validar campos requeridos de PolizaCreateRequest
 */
export function validarCamposRequeridos(data: PolizaCreateRequest): ValidationResult {
  const errores: string[] = [];

  // Campos básicos requeridos
  if (!data.comcod || data.comcod <= 0) {
    errores.push("Código de compañía es requerido");
  }

  if (!data.seccod || data.seccod < 0) {
    errores.push("Código de sección es requerido");
  }

  if (!data.clinro || data.clinro <= 0) {
    errores.push("Código de cliente es requerido");
  }

  if (!data.conpol || data.conpol.trim() === "") {
    errores.push("Número de póliza es requerido");
  }

  if (!data.confchdes || data.confchdes.trim() === "") {
    errores.push("Fecha de inicio es requerida");
  }

  if (!data.confchhas || data.confchhas.trim() === "") {
    errores.push("Fecha de fin es requerida");
  }

  if (!data.conpremio || data.conpremio <= 0) {
    errores.push("Premio debe ser mayor a 0");
  }

  if (!data.asegurado || data.asegurado.trim() === "") {
    errores.push("Nombre del asegurado es requerido");
  }

  return {
    esValido: errores.length === 0,
    errores
  };
}

/**
 * Validar consistencia de datos
 */
export function validarConsistenciaDatos(data: PolizaCreateRequest): ValidationResult {
  const errores: string[] = [];
  const warnings: string[] = [];

  // Validar fechas
  if (data.confchdes && data.confchhas) {
    const fechaInicio = new Date(data.confchdes);
    const fechaFin = new Date(data.confchhas);
    
    if (fechaFin <= fechaInicio) {
      errores.push("La fecha de fin debe ser posterior a la fecha de inicio");
    }

    // Warning si la vigencia es muy larga
    const diferenciaDias = (fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24);
    if (diferenciaDias > 400) {
      warnings.push("La vigencia de la póliza es mayor a 400 días");
    }
  }

  // Validar montos
  if (data.contot && data.conpremio && data.contot < data.conpremio) {
    warnings.push("El total es menor que el premio base");
  }

  // Validar cuotas vs forma de pago
  if (data.concuo && data.concuo > 1 && data.consta === "1") {
    warnings.push("Forma de pago es contado pero se especificaron cuotas");
  }

  // Validar año del vehículo
  if (data.conanioaut) {
    const anioActual = new Date().getFullYear();
    if (data.conanioaut > anioActual + 1) {
      errores.push("El año del vehículo no puede ser futuro");
    }
    if (data.conanioaut < 1900) {
      errores.push("El año del vehículo debe ser mayor a 1900");
    }
  }

  return {
    esValido: errores.length === 0,
    errores,
    warnings
  };
}

/**
 * Validar formato de número de póliza
 */
export function validarNumeroPoliza(numeroPoliza: string): ValidationResult {
  const errores: string[] = [];

  if (!numeroPoliza || numeroPoliza.trim() === "") {
    errores.push("Número de póliza es requerido");
    return { esValido: false, errores };
  }

  // Eliminar espacios y convertir a mayúsculas para validación
  const numero = numeroPoliza.trim().toUpperCase();

  // Validar longitud
  if (numero.length < 3) {
    errores.push("Número de póliza debe tener al menos 3 caracteres");
  }

  if (numero.length > 20) {
    errores.push("Número de póliza no puede exceder 20 caracteres");
  }

  // Validar caracteres permitidos (letras, números, guiones)
  const caracteresValidos = /^[A-Z0-9\-_]+$/;
  if (!caracteresValidos.test(numero)) {
    errores.push("Número de póliza solo puede contener letras, números y guiones");
  }

  return {
    esValido: errores.length === 0,
    errores
  };
}

/**
 * Validar matrícula de vehículo
 */
export function validarMatricula(matricula: string): ValidationResult {
  const errores: string[] = [];

  if (!matricula || matricula.trim() === "") {
    // La matrícula no es requerida
    return { esValido: true, errores: [] };
  }

  const mat = matricula.trim().toUpperCase();

  // Validar formato uruguayo básico
  const formatoUruguayo = /^[A-Z]{3}\d{4}$|^[A-Z]{2}\d{4}$|^\d{4}[A-Z]{2}$/;
  
  if (!formatoUruguayo.test(mat)) {
    errores.push("Formato de matrícula inválido (ej: SAA1234, AB1234, 1234AB)");
  }

  return {
    esValido: errores.length === 0,
    errores
  };
}

/**
 * Validar email
 */
export function validarEmail(email: string): ValidationResult {
  const errores: string[] = [];

  if (!email || email.trim() === "") {
    // Email no es requerido
    return { esValido: true, errores: [] };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errores.push("Formato de email inválido");
  }

  return {
    esValido: errores.length === 0,
    errores
  };
}

/**
 * Validar teléfono
 */
export function validarTelefono(telefono: string): ValidationResult {
  const errores: string[] = [];

  if (!telefono || telefono.trim() === "") {
    // Teléfono no es requerido
    return { esValido: true, errores: [] };
  }

  // Remover espacios, guiones y paréntesis para validación
  const tel = telefono.replace(/[\s\-\(\)]/g, '');

  // Validar que solo contenga números
  if (!/^\d+$/.test(tel)) {
    errores.push("Teléfono solo puede contener números");
  }

  // Validar longitud para Uruguay
  if (tel.length < 8 || tel.length > 12) {
    errores.push("Teléfono debe tener entre 8 y 12 dígitos");
  }

  return {
    esValido: errores.length === 0,
    errores
  };
}

// ============================================================================
// 🎯 VALIDACIONES DE FORMULARIO
// ============================================================================

/**
 * Validar todo el formulario de póliza
 */
export function validarFormularioPoliza(data: PolizaFormData): ValidationResult {
  const errores: string[] = [];
  const warnings: string[] = [];

  // Validar campos individuales
  const validaciones = [
    validarNumeroPoliza(data.numeroPoliza),
    validarMatricula(data.matricula),
    validarEmail(data.email),
    validarTelefono(data.telefono)
  ];

  // Agregar errores de validaciones individuales
  validaciones.forEach(v => {
    errores.push(...v.errores);
  });

  // Validaciones específicas del formulario
  if (!data.vigenciaDesde) {
    errores.push("Fecha de inicio de vigencia es requerida");
  }

  if (!data.vigenciaHasta) {
    errores.push("Fecha de fin de vigencia es requerida");
  }

  if (!data.prima || data.prima <= 0) {
    errores.push("Prima debe ser mayor a 0");
  }

  if (!data.asegurado || data.asegurado.trim() === "") {
    errores.push("Nombre del asegurado es requerido");
  }

  // Warnings
  if (!data.marca) {
    warnings.push("Marca del vehículo no especificada");
  }

  if (!data.anio) {
    warnings.push("Año del vehículo no especificado");
  }

  return {
    esValido: errores.length === 0,
    errores,
    warnings
  };
}

// ============================================================================
// 🧰 UTILIDADES DE VALIDACIÓN
// ============================================================================

/**
 * Limpiar y normalizar string
 */
export function limpiarString(str: string): string {
  return str?.trim().replace(/\s+/g, ' ') || '';
}

/**
 * Validar que un número esté en rango
 */
export function validarRango(valor: number, min: number, max: number, nombreCampo: string): ValidationResult {
  const errores: string[] = [];

  if (valor < min || valor > max) {
    errores.push(`${nombreCampo} debe estar entre ${min} y ${max}`);
  }

  return {
    esValido: errores.length === 0,
    errores
  };
}

/**
 * Validar fecha
 */
export function validarFecha(fecha: string, nombreCampo: string): ValidationResult {
  const errores: string[] = [];

  if (!fecha) {
    errores.push(`${nombreCampo} es requerida`);
    return { esValido: false, errores };
  }

  const fechaObj = new Date(fecha);
  if (isNaN(fechaObj.getTime())) {
    errores.push(`${nombreCampo} tiene formato inválido`);
  }

  return {
    esValido: errores.length === 0,
    errores
  };
}

/**
 * Crear resumen de validación para UI
 */
export function crearResumenValidacion(data: PolizaCreateRequest) {
  const camposRequeridos = {
    comcod: data.comcod > 0,
    clinro: data.clinro > 0,
    conpol: !!data.conpol?.trim(),
    confchdes: !!data.confchdes?.trim(),
    confchhas: !!data.confchhas?.trim(),
    conpremio: data.conpremio > 0,
    asegurado: !!data.asegurado?.trim()
  };

  const camposOpcionales = {
    seccod: data.seccod > 0,
    vehiculo: !!(data.conmaraut || data.marca),
    matricula: !!(data.conmataut || data.matricula),
    anio: !!(data.conanioaut || data.anio),
    direccion: !!(data.condom || data.direccion)
  };

  return {
    requeridos: camposRequeridos,
    opcionales: camposOpcionales,
    completitud: {
      requeridosCompletos: Object.values(camposRequeridos).filter(Boolean).length,
      totalRequeridos: Object.keys(camposRequeridos).length,
      opcionalesCompletos: Object.values(camposOpcionales).filter(Boolean).length,
      totalOpcionales: Object.keys(camposOpcionales).length
    }
  };
}