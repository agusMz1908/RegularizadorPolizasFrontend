// src/utils/formDataMapper.ts
// ✅ VERSIÓN CORREGIDA - TIPOS COMPATIBLES

import { PolizaFormData, PolizaCreateRequest } from '../types/core/poliza';
import { DocumentProcessResult } from '../types/ui/wizard';
import { ValidationError, ValidationResult } from '../types/wizard/validation';

// ✅ Helpers para conversión de tipos
const toStringValue = (value: any): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  return String(value);
};

const toNumberValue = (value: any): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(/[^\d.-]/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const toSafeNumber = (value: string | number): number => {
  if (typeof value === 'number') return value;
  if (!value || value === '') return 0;
  const parsed = parseFloat(value.replace(/[^\d.-]/g, ''));
  return isNaN(parsed) ? 0 : parsed;
};

// ✅ Tipos auxiliares para el mapper
interface ExtractedField {
  name: string;
  value: string;
  confidence: number;
  boundingBox?: any;
}

export interface FormDataMappingResult<T> {
  data: T;
  warnings: string[];
  errors: string[];
  unmappedFields: string[];
  conversionTime: number;
  fieldsProcessed: number;
}

export interface FormDataValidationRule {
  field: string;
  required: boolean;
  validator?: (value: any) => boolean;
  transformer?: (value: any) => any;
  defaultValue?: any;
  errorMessage?: string;
}

export interface MappingContext {
  clienteId?: number;
  companiaId?: number;
  seccionId?: number;
  operacionTipo?: string;
  source: 'manual' | 'azure' | 'import' | 'api';
  timestamp: Date;
  userId?: string;
}

/**
 * Convierte datos de formulario de Azure AI a formato PolizaFormData
 */
export function mapAzureToFormData(
  azureResult: DocumentProcessResult,
  context: MappingContext
): FormDataMappingResult<PolizaFormData> {
  const startTime = performance.now();
  const errors: string[] = [];
  const warnings: string[] = [];
  const unmappedFields: string[] = [];

  try {
    // Mapeo básico de datos extraídos
    const mappedData: Partial<PolizaFormData> = {};

    // Mapear campos básicos del cliente
    if (azureResult.extractedFields) {
      Object.entries(azureResult.extractedFields).forEach(([key, value]) => {
        const field = { name: key, value: toStringValue(value), confidence: 100 };
        
        switch (field.name.toLowerCase()) {
          case 'nombre':
          case 'client_name':
          case 'asegurado':
            mappedData.asegurado = field.value;
            mappedData.nombreAsegurado = field.value;
            break;
          case 'documento':
          case 'document_number':
          case 'ci':
          case 'cedula':
            mappedData.documento = field.value;
            break;
          case 'telefono':
          case 'phone':
          case 'celular':
            mappedData.telefono = field.value;
            break;
          case 'email':
          case 'correo':
            mappedData.email = field.value;
            break;
          case 'direccion':
          case 'address':
          case 'domicilio':
            mappedData.direccion = field.value;
            break;
          
          // Datos de la póliza
          case 'numero_poliza':
          case 'policy_number':
          case 'poliza':
            mappedData.numeroPoliza = field.value;
            break;
          case 'fecha_inicio':
          case 'start_date':
          case 'vigencia_desde':
          case 'desde':
            mappedData.vigenciaDesde = field.value;
            break;
          case 'fecha_vencimiento':
          case 'end_date':
          case 'vigencia_hasta':
          case 'hasta':
            mappedData.vigenciaHasta = field.value;
            break;
          case 'suma_asegurada':
          case 'insured_amount':
          case 'capital':
            mappedData.primaComercial = toStringValue(toNumberValue(field.value));
            break;
          case 'premio':
          case 'premium':
          case 'prima':
            mappedData.prima = toStringValue(toNumberValue(field.value));
            mappedData.premioTotal = toStringValue(toNumberValue(field.value));
            break;
          
          // Datos del vehículo (si aplica)
          case 'marca':
          case 'brand':
            mappedData.marca = field.value;
            break;
          case 'modelo':
          case 'model':
            mappedData.modelo = field.value;
            break;
          case 'año':
          case 'year':
          case 'ano':
            mappedData.anio = field.value;
            break;
          case 'patente':
          case 'plate':
          case 'matricula':
          case 'chapa':
            mappedData.matricula = field.value.toUpperCase();
            mappedData.chapa = field.value.toUpperCase();
            break;
          case 'chasis':
          case 'chassis':
          case 'numero_chasis':
            mappedData.chasis = field.value;
            break;
          case 'motor':
            mappedData.motor = field.value;
            break;
          
          default:
            unmappedFields.push(field.name);
            warnings.push(`Campo no mapeado: ${field.name} = ${field.value}`);
        }
      });
    }

    // Aplicar contexto y valores por defecto
    const formData: PolizaFormData = {
      // IDs del contexto
      clienteId: context.clienteId || 0,
      compania: context.companiaId || 0,
      nombreCompania: '',
      seccionId: context.seccionId || 0,
      
      // Campos requeridos con valores por defecto
      numeroPoliza: mappedData.numeroPoliza || '',
      vigenciaDesde: mappedData.vigenciaDesde || new Date().toISOString().split('T')[0],
      vigenciaHasta: mappedData.vigenciaHasta || new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
      prima: mappedData.prima || '0',
      moneda: 'UYU',
      asegurado: mappedData.asegurado || '',
      cobertura: '',

      // Datos del cliente
      nombreAsegurado: mappedData.nombreAsegurado || mappedData.asegurado || '',
      documento: mappedData.documento || '',
      telefono: mappedData.telefono || '',
      email: mappedData.email || '',
      direccion: mappedData.direccion || '',
      localidad: '',
      departamento: '',
      codigoPostal: '',
      
      // Datos del vehículo
      vehiculo: '',
      marca: mappedData.marca || '',
      modelo: mappedData.modelo || '',
      anio: mappedData.anio || new Date().getFullYear().toString(),
      matricula: mappedData.matricula || '',
      chapa: mappedData.chapa || mappedData.matricula || '',
      motor: mappedData.motor || '',
      chasis: mappedData.chasis || '',
      combustible: '',
      color: '',
      
      // Datos comerciales - TODOS COMO STRING
      primaComercial: mappedData.primaComercial || mappedData.prima || '0',
      premioTotal: mappedData.premioTotal || mappedData.prima || '0',
      cantidadCuotas: 1,
      valorCuota: '0',
      formaPago: 'Contado',
      primeraCuotaFecha: '',
      primeraCuotaMonto: '0',
      impuestoMSP: '0',
      descuentos: '0',
      recargos: '0',
      
      // Clasificaciones
      corredor: '',
      plan: '',
      ramo: '',
      certificado: '',
      tipo: '',
      destino: '',
      calidad: '',
      categoria: '',
      tipoVehiculo: '',
      uso: '',
      
      // Estados
      estadoPoliza: 'VIG',
      tramite: 'Nuevo',
      estadoGestionVelneo: '1',
      
      // IDs para combos
      combustibleId: null,
      categoriaId: null,
      destinoId: null,
      calidadId: null,
      
      // Campos adicionales
      operacion: context.operacionTipo || null,
      seccion: '',
      observaciones: '',
      
      // Campos específicos Velneo
      tramiteVelneo: 'Nuevo',
      estadoPolizaVelneo: 'VIG',
      formaPagoVelneo: '1',
      monedaVelneo: 'UYU',
      
      // Campos adicionales
      endoso: '',
      tipoMovimiento: '',
      zonaCirculacion: '',
      codigoMoneda: '',
      totalBonificaciones: '',
      observacionesGestion: '',
      informacionAdicional: '',
      datosVelneo: undefined
    };

    const conversionTime = performance.now() - startTime;

    return {
      data: formData,
      warnings,
      errors,
      unmappedFields,
      conversionTime,
      fieldsProcessed: Object.keys(azureResult.extractedFields || {}).length
    };

  } catch (error) {
    errors.push(`Error en conversión: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    
    return {
      data: createEmptyFormData(context),
      warnings,
      errors,
      unmappedFields,
      conversionTime: performance.now() - startTime,
      fieldsProcessed: 0
    };
  }
}

/**
 * Convierte PolizaFormData a formato para Velneo/backend
 */
export function mapFormDataToVelneo(
  formData: PolizaFormData,
  context: MappingContext
): FormDataMappingResult<PolizaCreateRequest> {
  const startTime = performance.now();
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const velneoData: PolizaCreateRequest = {
      // Campos básicos requeridos
      comcod: formData.compania,
      seccod: formData.seccionId,
      clinro: formData.clienteId,
      conpol: formData.numeroPoliza,
      confchdes: formData.vigenciaDesde,
      confchhas: formData.vigenciaHasta,
      conpremio: toSafeNumber(formData.prima), // Convertir string a number
      asegurado: formData.asegurado,

      // Datos del cliente
      clinom: formData.nombreAsegurado || formData.asegurado,
      condom: formData.direccion,
      
      // Datos del vehículo
      conmaraut: formData.marca,
      conanioaut: parseInt(formData.anio) || new Date().getFullYear(),
      conmataut: formData.matricula,
      conmotor: formData.motor,
      conchasis: formData.chasis,
      
      // Datos comerciales - CONVERTIR STRINGS A NUMBERS
      contot: toSafeNumber(formData.premioTotal),
      concuo: formData.cantidadCuotas,
      moncod: getMonedaId(formData.moneda),
      conimp: toSafeNumber(formData.primaComercial),
      
      // Clasificaciones - convertir null a undefined para compatibilidad
      calidadId: formData.calidadId ?? undefined,
      destinoId: formData.destinoId ?? undefined,
      categoriaId: formData.categoriaId ?? undefined,
      convig: formData.estadoPoliza || 'VIG',
      consta: formData.formaPago === 'Contado' ? '1' : 
              formData.formaPago === 'Tarjeta' ? '2' :
              formData.formaPago === 'Débito Automático' ? '3' : '4',
      contra: formData.tramite || 'Nuevo',
      
      // Campos adicionales
      ramo: formData.ramo,
      tposegdsc: formData.cobertura,
      observaciones: formData.observaciones,
      
      // Campos legacy para compatibilidad
      vehiculo: formData.vehiculo,
      marca: formData.marca,
      modelo: formData.modelo,
      motor: formData.motor,
      chasis: formData.chasis,
      matricula: formData.matricula,
      combustible: formData.combustible,
      anio: parseInt(formData.anio) || new Date().getFullYear(),
      primaComercial: toSafeNumber(formData.primaComercial),
      premioTotal: toSafeNumber(formData.premioTotal),
      corredor: formData.corredor,
      plan: formData.plan,
      documento: formData.documento,
      email: formData.email,
      telefono: formData.telefono,
      direccion: formData.direccion,
      localidad: formData.localidad,
      departamento: formData.departamento,
      moneda: formData.moneda,
      
      // Campos del wizard
      seccionId: formData.seccionId,
      estado: formData.estadoPoliza,
      tramite: formData.tramite,
      estadoPoliza: formData.estadoPoliza,
      tipoVehiculo: formData.tipoVehiculo,
      uso: formData.uso,
      formaPago: formData.formaPago,
      cantidadCuotas: formData.cantidadCuotas,
      valorCuota: toSafeNumber(formData.valorCuota),
      tipo: formData.tipo,
      cobertura: formData.cobertura,
      certificado: formData.certificado,
      
      // Auditoría
      procesadoConIA: context.source === 'azure',
      fechaCreacion: new Date().toISOString(),
      fechaModificacion: new Date().toISOString()
    };

    return {
      data: velneoData,
      warnings,
      errors,
      unmappedFields: [],
      conversionTime: performance.now() - startTime,
      fieldsProcessed: Object.keys(formData).length
    };

  } catch (error) {
    errors.push(`Error en conversión a Velneo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    
    return {
      data: {} as PolizaCreateRequest,
      warnings,
      errors,
      unmappedFields: [],
      conversionTime: performance.now() - startTime,
      fieldsProcessed: 0
    };
  }
}

/**
 * Valida datos del formulario según reglas de negocio
 */
export function validateFormData(
  formData: PolizaFormData,
  rules: FormDataValidationRule[]
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Validación de campos requeridos
  rules.forEach(rule => {
    const value = (formData as any)[rule.field];
    
    if (rule.required && (!value || value === '')) {
      errors.push({
        field: rule.field,
        message: rule.errorMessage || `${rule.field} es requerido`,
        severity: 'error'
      });
    }
    
    // Validación personalizada
    if (value && rule.validator && !rule.validator(value)) {
      errors.push({
        field: rule.field,
        message: rule.errorMessage || `${rule.field} no es válido`,
        severity: 'error'
      });
    }
  });

  // Validaciones de negocio específicas - CORREGIDAS PARA STRINGS
  if (formData.vigenciaHasta <= formData.vigenciaDesde) {
    errors.push({
      field: 'vigenciaHasta',
      message: 'La fecha de vencimiento debe ser posterior a la fecha de inicio',
      severity: 'error'
    });
  }

  const primaValue = toSafeNumber(formData.prima);
  if (primaValue < 0) {
    errors.push({
      field: 'prima',
      message: 'La prima no puede ser negativa',
      severity: 'error'
    });
  }

  const premioTotalValue = toSafeNumber(formData.premioTotal);
  if (premioTotalValue < 0) {
    errors.push({
      field: 'premioTotal',
      message: 'El premio total no puede ser negativo',
      severity: 'error'
    });
  }

  // Validaciones específicas de Uruguay
  if (formData.documento && !/^\d{7,8}$/.test(formData.documento)) {
    errors.push({
      field: 'documento',
      message: 'La cédula debe tener 7 u 8 dígitos',
      severity: 'error'
    });
  }

  if (formData.matricula && !/^[A-Z]{2,3}\d{4}$|^\d{4}[A-Z]{2}$/.test(formData.matricula)) {
    warnings.push({
      field: 'matricula',
      message: 'Formato de matrícula inusual para Uruguay',
      severity: 'warning'
    });
  }

  if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.push({
      field: 'email',
      message: 'Formato de email inválido',
      severity: 'error'
    });
  }

  // Warnings - CORREGIDOS PARA STRINGS
  const primaComercialValue = toSafeNumber(formData.primaComercial);
  if (primaComercialValue > 1000000) {
    warnings.push({
      field: 'primaComercial',
      message: 'Prima muy alta, revisar con supervisor',
      severity: 'warning'
    });
  }

  if (primaValue > primaComercialValue * 1.5) {
    warnings.push({
      field: 'prima',
      message: 'Prima excesiva comparada con prima comercial',
      severity: 'warning'
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fieldErrors: errors.reduce((acc, error) => {
      acc[error.field] = error.message;
      return acc;
    }, {} as Record<string, string>)
  };
}

/**
 * Aplica transformaciones a los datos del formulario
 */
export function transformFormData(
  formData: PolizaFormData,
  rules: FormDataValidationRule[]
): PolizaFormData {
  const transformed = { ...formData };

  rules.forEach(rule => {
    if (rule.transformer) {
      const currentValue = (transformed as any)[rule.field];
      (transformed as any)[rule.field] = rule.transformer(currentValue);
    }
  });

  // Transformaciones automáticas
  transformed.asegurado = transformed.asegurado.trim().toUpperCase();
  transformed.nombreAsegurado = transformed.nombreAsegurado.trim().toUpperCase();
  transformed.documento = transformed.documento.replace(/\D/g, '');
  transformed.matricula = transformed.matricula.toUpperCase().replace(/\s/g, '');
  transformed.chapa = transformed.chapa.toUpperCase().replace(/\s/g, '');
  transformed.email = transformed.email.toLowerCase().trim();

  return transformed;
}

/**
 * Crea un formulario vacío con valores por defecto
 */
function createEmptyFormData(context: MappingContext): PolizaFormData {
  const today = new Date().toISOString().split('T')[0];
  const nextYear = new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0];
  
  return {
    // Campos requeridos
    numeroPoliza: '',
    vigenciaDesde: today,
    vigenciaHasta: nextYear,
    prima: '0',
    moneda: 'UYU',
    asegurado: '',
    compania: context.companiaId || 0,
    nombreCompania: '',
    seccionId: context.seccionId || 0,
    clienteId: context.clienteId || 0,
    cobertura: '',

    // Campos opcionales existentes
    observaciones: '',
    vehiculo: '',
    marca: '',
    modelo: '',
    matricula: '',
    motor: '',
    chasis: '',
    anio: new Date().getFullYear().toString(),
    primaComercial: '0',
    premioTotal: '0',
    cantidadCuotas: 1,
    valorCuota: '0',
    formaPago: 'Contado',
    primeraCuotaFecha: '',
    primeraCuotaMonto: '0',
    documento: '',
    email: '',
    telefono: '',
    direccion: '',
    localidad: '',
    departamento: '',
    corredor: '',
    plan: '',
    ramo: '',
    certificado: '',
    estadoPoliza: 'VIG',
    tramite: 'Nuevo',
    tipo: '',
    destino: '',
    combustible: '',
    calidad: '',
    categoria: '',
    tipoVehiculo: '',
    uso: '',

    // IDs para combos
    combustibleId: null,
    categoriaId: null,
    destinoId: null,
    calidadId: null,

    // Campos adicionales existentes
    operacion: context.operacionTipo || null,
    seccion: '',

    // Campos faltantes que causan errores
    nombreAsegurado: '',
    chapa: '',

    // Campos adicionales del hook usePolizaForm
    color: '',
    impuestoMSP: '0',
    descuentos: '0',
    recargos: '0',
    codigoPostal: '',

    // Campos específicos de Velneo
    tramiteVelneo: 'Nuevo',
    estadoPolizaVelneo: 'VIG',
    formaPagoVelneo: '1',
    monedaVelneo: 'UYU',
    estadoGestionVelneo: '1',
    
    // Campos adicionales
    endoso: '',
    tipoMovimiento: '',
    zonaCirculacion: '',
    codigoMoneda: '',
    totalBonificaciones: '',
    observacionesGestion: '',
    informacionAdicional: '',
    datosVelneo: undefined
  };
}

/**
 * Convierte nombre de moneda a ID
 */
function getMonedaId(moneda: string): number {
  switch (moneda) {
    case 'UYU': return 1;
    case 'USD': return 2;
    case 'UI': return 3;
    default: return 1;
  }
}

/**
 * Reglas de validación por defecto para pólizas
 */
export const defaultPolizaValidationRules: FormDataValidationRule[] = [
  {
    field: 'asegurado',
    required: true,
    validator: (value: string) => value.length >= 3,
    errorMessage: 'El nombre del asegurado debe tener al menos 3 caracteres'
  },
  {
    field: 'documento',
    required: true,
    validator: (value: string) => /^\d{7,8}$/.test(value),
    errorMessage: 'El documento debe tener 7 u 8 dígitos'
  },
  {
    field: 'numeroPoliza',
    required: true,
    validator: (value: string) => value.length >= 5,
    errorMessage: 'El número de póliza debe tener al menos 5 caracteres'
  },
  {
    field: 'prima',
    required: true,
    validator: (value: string) => toSafeNumber(value) > 0,
    errorMessage: 'La prima debe ser mayor a 0'
  },
  {
    field: 'vigenciaDesde',
    required: true,
    errorMessage: 'La fecha de inicio de vigencia es obligatoria'
  },
  {
    field: 'vigenciaHasta',
    required: true,
    errorMessage: 'La fecha de fin de vigencia es obligatoria'
  },
  {
    field: 'email',
    required: false,
    validator: (value: string) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    errorMessage: 'Formato de email inválido'
  }
];