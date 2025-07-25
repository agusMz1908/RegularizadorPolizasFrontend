// src/utils/mappers/formDataMapper.ts

import { PolizaFormData, PolizaCreateRequest } from '../../types/core/poliza';
import { DocumentProcessResult } from '../../types/ui/wizard';

// ✅ Tipos para las conversiones (definidos localmente para evitar problemas de importación)
interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

// ✅ Tipos para las conversiones
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

// ✅ Reglas de validación para PolizaCreateRequest
const POLIZA_CREATE_VALIDATION_RULES: FormDataValidationRule[] = [
  // Campos obligatorios básicos
  {
    field: 'comcod',
    required: true,
    validator: (value) => Number(value) > 0,
    transformer: (value) => Number(value),
    errorMessage: 'Código de compañía es requerido y debe ser mayor a 0'
  },
  {
    field: 'seccod',
    required: true,
    validator: (value) => Number(value) >= 0,
    transformer: (value) => Number(value),
    errorMessage: 'Código de sección es requerido'
  },
  {
    field: 'clinro',
    required: true,
    validator: (value) => Number(value) > 0,
    transformer: (value) => Number(value),
    errorMessage: 'Código de cliente es requerido y debe ser mayor a 0'
  },
  {
    field: 'conpol',
    required: true,
    validator: (value) => Boolean(value && String(value).trim().length >= 3),
    transformer: (value) => String(value).trim().toUpperCase(),
    errorMessage: 'Número de póliza es requerido (mínimo 3 caracteres)'
  },
  {
    field: 'confchdes',
    required: true,
    validator: (value) => isValidDateString(value),
    transformer: (value) => formatDateForVelneo(value),
    errorMessage: 'Fecha de inicio de vigencia es requerida y debe ser válida'
  },
  {
    field: 'confchhas',
    required: true,
    validator: (value) => isValidDateString(value),
    transformer: (value) => formatDateForVelneo(value),
    errorMessage: 'Fecha de fin de vigencia es requerida y debe ser válida'
  },
  {
    field: 'conpremio',
    required: true,
    validator: (value) => Number(value) > 0,
    transformer: (value) => Number(value),
    errorMessage: 'Premio debe ser mayor a 0'
  },
  {
    field: 'asegurado',
    required: true,
    validator: (value) => Boolean(value && String(value).trim().length >= 2),
    transformer: (value) => String(value).trim().replace(/\s+/g, ' '),
    errorMessage: 'Nombre del asegurado es requerido (mínimo 2 caracteres)'
  },

  // Campos opcionales con validaciones
  {
    field: 'conmataut',
    required: false,
    validator: (value) => !value || isValidMatricula(value),
    transformer: (value) => value ? String(value).trim().toUpperCase() : '',
    errorMessage: 'Formato de matrícula inválido'
  },
  {
    field: 'email',
    required: false,
    validator: (value) => !value || isValidEmail(value),
    transformer: (value) => value ? String(value).trim().toLowerCase() : '',
    errorMessage: 'Formato de email inválido'
  },
  {
    field: 'telefono',
    required: false,
    validator: (value) => !value || isValidTelefono(value),
    transformer: (value) => value ? String(value).replace(/[^0-9+]/g, '') : '',
    errorMessage: 'Formato de teléfono inválido'
  },

  // Campos numéricos opcionales
  {
    field: 'conanioaut',
    required: false,
    validator: (value) => !value || (Number(value) >= 1900 && Number(value) <= new Date().getFullYear() + 2),
    transformer: (value) => value ? Number(value) : undefined,
    errorMessage: 'Año del vehículo debe estar entre 1900 y el año actual + 2'
  },
  {
    field: 'primaComercial',
    required: false,
    validator: (value) => !value || Number(value) >= 0,
    transformer: (value) => value ? Number(value) : 0,
    errorMessage: 'Prima comercial debe ser mayor o igual a 0'
  },
  {
    field: 'premioTotal',
    required: false,
    validator: (value) => !value || Number(value) >= 0,
    transformer: (value) => value ? Number(value) : 0,
    errorMessage: 'Premio total debe ser mayor o igual a 0'
  }
];

// ✅ Clase principal del mapper
export class FormDataMapper {
  
  /**
   * Convertir PolizaFormData a PolizaCreateRequest
   */
  static mapFormDataToCreateRequest(
    formData: PolizaFormData,
    context: MappingContext
  ): FormDataMappingResult<PolizaCreateRequest> {
    const startTime = Date.now();
    const warnings: string[] = [];
    const errors: string[] = [];
    const unmappedFields: string[] = [];

    // Crear objeto base con valores del contexto
    const createRequest: PolizaCreateRequest = {
      // IDs del contexto
      comcod: context.companiaId || 0,
      seccod: context.seccionId || 0,
      clinro: context.clienteId || 0,

      // Campos básicos requeridos desde el formulario
      conpol: formData.numeroPoliza || '',
      confchdes: formatDateForVelneo(formData.vigenciaDesde),
      confchhas: formatDateForVelneo(formData.vigenciaHasta),
      conpremio: formData.prima || 0,
      asegurado: formData.asegurado || '',

      // Campos de vehículo (usar nombres correctos de PolizaCreateRequest)
      conmaraut: formData.marca || '',
      conanioaut: formData.anio ? Number(formData.anio) : undefined,
      conmataut: formData.matricula || '',
      conmotor: formData.motor || '',
      conchasis: formData.chasis || '',
      vehiculo: formData.vehiculo || '',
      combustible: formData.combustible || '',

      // Información financiera
      moneda: formData.moneda || 'PES',
      primaComercial: formData.primaComercial || 0,
      premioTotal: formData.premioTotal || 0,
      cantidadCuotas: formData.cantidadCuotas || 1,
      valorCuota: formData.valorCuota || 0,
      formaPago: formData.formaPago || '',

      // Información personal
      documento: formData.documento || '',
      email: formData.email || '',
      telefono: formData.telefono || '',
      direccion: formData.direccion || '',
      localidad: formData.localidad || '',
      departamento: formData.departamento || '',

      // Información adicional
      corredor: formData.corredor || '',
      plan: formData.plan || '',
      ramo: formData.ramo || 'AUTOMOVILES',
      cobertura: formData.cobertura || '',
      observaciones: formData.observaciones || '',

      // Metadatos de procesamiento
      procesadoConIA: context.source === 'azure',
      
      // ✅ Campos que SÍ existen en PolizaCreateRequest (según poliza.ts)
      certificado: formData.certificado || '',
      estadoPoliza: formData.estadoPoliza || '',
      tramite: formData.tramite || '',
      tipo: formData.tipo || '',
      tipoVehiculo: formData.tipoVehiculo || '',
      uso: formData.uso || '',
      cobertura: formData.cobertura || '',
      categoriaId: formData.categoriaId || undefined,
      destinoId: formData.destinoId || undefined,
      calidadId: formData.calidadId || undefined
    };

    // Aplicar validaciones y transformaciones
    const validationResult = this.applyValidationRules(createRequest, POLIZA_CREATE_VALIDATION_RULES);
    warnings.push(...validationResult.warnings);
    errors.push(...validationResult.errors);

    // Post-procesamiento específico
    const postProcessResult = this.applyPostProcessing(createRequest, formData, context);
    warnings.push(...postProcessResult.warnings);
    errors.push(...postProcessResult.errors);

    // Identificar campos no mapeados
    const formDataKeys = Object.keys(formData);
    const createRequestKeys = Object.keys(createRequest);
    formDataKeys.forEach(key => {
      if (!createRequestKeys.includes(key) && formData[key as keyof PolizaFormData] !== undefined) {
        unmappedFields.push(key);
      }
    });

    const conversionTime = Date.now() - startTime;
    const fieldsProcessed = Object.keys(createRequest).filter(key => 
      createRequest[key as keyof PolizaCreateRequest] !== undefined && 
      createRequest[key as keyof PolizaCreateRequest] !== ''
    ).length;

    console.log(`📋 FormData -> CreateRequest: ${fieldsProcessed} campos procesados en ${conversionTime}ms`);

    return {
      data: createRequest,
      warnings,
      errors,
      unmappedFields,
      conversionTime,
      fieldsProcessed
    };
  }

  /**
   * Convertir PolizaCreateRequest a PolizaFormData (para edición)
   */
  static mapCreateRequestToFormData(
    createRequest: PolizaCreateRequest
  ): FormDataMappingResult<PolizaFormData> {
    const startTime = Date.now();
    const warnings: string[] = [];
    const errors: string[] = [];
    const unmappedFields: string[] = [];

    const formData: PolizaFormData = {
      // Campos básicos
      numeroPoliza: createRequest.conpol || '',
      vigenciaDesde: formatDateForForm(createRequest.confchdes),
      vigenciaHasta: formatDateForForm(createRequest.confchhas),
      prima: createRequest.conpremio || 0,
      moneda: createRequest.moneda || 'PES',
      asegurado: createRequest.asegurado || '',
      compania: createRequest.comcod || 0,
      seccionId: createRequest.seccod || 0,
      clienteId: createRequest.clinro || 0,
      cobertura: createRequest.cobertura || '',

      // Campos opcionales básicos
      observaciones: createRequest.observaciones || '',
      
      // Información del vehículo (usar nombres correctos)
      vehiculo: createRequest.vehiculo || '',
      marca: createRequest.conmaraut || '',
      modelo: createRequest.modelo || '', // Campo legacy en PolizaCreateRequest
      anio: createRequest.conanioaut ? String(createRequest.conanioaut) : '',
      matricula: createRequest.conmataut || '',
      motor: createRequest.conmotor || '',
      chasis: createRequest.conchasis || '',
      combustible: createRequest.combustible || '',

      // Información financiera
      primaComercial: createRequest.primaComercial || 0,
      premioTotal: createRequest.premioTotal || 0,
      cantidadCuotas: createRequest.cantidadCuotas || 0,
      valorCuota: createRequest.valorCuota || 0,
      formaPago: createRequest.formaPago || '',
      primeraCuotaFecha: '', // Campo específico del FormData
      primeraCuotaMonto: 0,  // Campo específico del FormData

      // Información personal
      documento: createRequest.documento || '',
      email: createRequest.email || '',
      telefono: createRequest.telefono || '',
      direccion: createRequest.direccion || '',
      localidad: createRequest.localidad || '',
      departamento: createRequest.departamento || '',

      // Información adicional
      corredor: createRequest.corredor || '',
      plan: createRequest.plan || '',
      ramo: createRequest.ramo || '',
      certificado: createRequest.certificado || '',
      estadoPoliza: createRequest.estadoPoliza || '',
      tramite: createRequest.tramite || '',
      tipo: createRequest.tipo || '',
      destino: '', // Campo específico del FormData
      categoria: '', // Campo específico del FormData  
      calidad: '', // Campo específico del FormData
      tipoVehiculo: createRequest.tipoVehiculo || '',
      uso: createRequest.uso || '',

      // IDs para combos (si están disponibles)
      combustibleId: null,
      categoriaId: null,
      destinoId: null,
      calidadId: null,

      // Campos adicionales
      operacion: null,
      seccion: '',

      // Campo legacy
      nombreAsegurado: createRequest.asegurado || '',
      chapa: createRequest.conmataut || ''
    };

    const conversionTime = Date.now() - startTime;
    const fieldsProcessed = Object.keys(formData).filter(key => 
      formData[key as keyof PolizaFormData] !== undefined && 
      formData[key as keyof PolizaFormData] !== ''
    ).length;

    console.log(`📝 CreateRequest -> FormData: ${fieldsProcessed} campos procesados en ${conversionTime}ms`);

    return {
      data: formData,
      warnings,
      errors,
      unmappedFields,
      conversionTime,
      fieldsProcessed
    };
  }

  /**
   * Convertir DocumentProcessResult a PolizaFormData inicial
   */
  static mapDocumentResultToFormData(
    documentResult: DocumentProcessResult,
    context: Partial<MappingContext> = {}
  ): FormDataMappingResult<PolizaFormData> {
    const startTime = Date.now();
    const warnings: string[] = [];
    const errors: string[] = [];
    const unmappedFields: string[] = [];

    const formData: PolizaFormData = {
      // Campos básicos desde Azure
      numeroPoliza: documentResult.numeroPoliza || '',
      vigenciaDesde: formatDateForForm(documentResult.vigenciaDesde),
      vigenciaHasta: formatDateForForm(documentResult.vigenciaHasta),
      prima: documentResult.prima || 0,
      moneda: documentResult.moneda || 'PES',
      asegurado: documentResult.asegurado || '',
      
      // IDs del contexto
      compania: context.companiaId || 0,
      seccionId: context.seccionId || 0,
      clienteId: context.clienteId || 0,
      cobertura: '',

      // Campos opcionales básicos
      observaciones: this.generateInitialObservations(documentResult),
      
      // Información del vehículo
      vehiculo: documentResult.vehiculo || '',
      marca: documentResult.marca || '',
      modelo: documentResult.modelo || '',
      anio: documentResult.anio || '',
      matricula: documentResult.matricula || '',
      motor: documentResult.motor || '',
      chasis: documentResult.chasis || '',
      combustible: documentResult.combustible || '',

      // Información financiera
      primaComercial: documentResult.primaComercial || 0,
      premioTotal: documentResult.premioTotal || 0,
      cantidadCuotas: 0,
      valorCuota: 0,
      formaPago: '',
      primeraCuotaFecha: '',
      primeraCuotaMonto: 0,

      // Información personal
      documento: documentResult.documento || '',
      email: documentResult.email || '',
      telefono: documentResult.telefono || '',
      direccion: documentResult.direccion || '',
      localidad: documentResult.localidad || '',
      departamento: documentResult.departamento || '',

      // Información adicional (limitada a lo que existe en DocumentProcessResult)
      corredor: documentResult.corredor || '',
      plan: documentResult.plan || '',
      ramo: documentResult.ramo || '',
      certificado: '',
      estadoPoliza: '',
      tramite: '',
      tipo: '',
      destino: '',
      categoria: '',
      calidad: '',
      tipoVehiculo: '',
      uso: '',

      // IDs para combos
      combustibleId: null,
      categoriaId: null,
      destinoId: null,
      calidadId: null,

      // Campos adicionales
      operacion: null,
      seccion: '',

      // Campos legacy y adicionales requeridos por PolizaFormData
      nombreAsegurado: documentResult.asegurado || '',
      chapa: documentResult.matricula || '',
      color: '', // Campo adicional de PolizaFormData
      impuestoMSP: 0, // Campo adicional de PolizaFormData
      descuentos: 0, // Campo adicional de PolizaFormData
      recargos: 0, // Campo adicional de PolizaFormData
      codigoPostal: '', // Campo adicional de PolizaFormData
      estadoGestionVelneo: '' // Campo adicional de PolizaFormData
    };

    // Validar datos convertidos
    if (!formData.numeroPoliza) {
      warnings.push('Número de póliza no detectado automáticamente');
    }
    if (!formData.asegurado) {
      warnings.push('Nombre del asegurado no detectado automáticamente');
    }
    if (!formData.vigenciaDesde || !formData.vigenciaHasta) {
      warnings.push('Fechas de vigencia no detectadas completamente');
    }

    const conversionTime = Date.now() - startTime;
    const fieldsProcessed = Object.keys(formData).filter(key => 
      formData[key as keyof PolizaFormData] !== undefined && 
      formData[key as keyof PolizaFormData] !== ''
    ).length;

    console.log(`🤖 DocumentResult -> FormData: ${fieldsProcessed} campos procesados en ${conversionTime}ms`);

    return {
      data: formData,
      warnings,
      errors,
      unmappedFields,
      conversionTime,
      fieldsProcessed
    };
  }

  /**
   * Aplicar reglas de validación y transformación
   */
  private static applyValidationRules(
    data: any,
    rules: FormDataValidationRule[]
  ): { warnings: string[]; errors: string[] } {
    const warnings: string[] = [];
    const errors: string[] = [];

    rules.forEach(rule => {
      const value = data[rule.field];

      // Verificar campo requerido
      if (rule.required && (value === undefined || value === null || value === '')) {
        if (rule.defaultValue !== undefined) {
          data[rule.field] = rule.defaultValue;
          warnings.push(`Campo requerido ${rule.field} no presente - asignado valor por defecto`);
        } else {
          errors.push(rule.errorMessage || `Campo requerido ${rule.field} no presente`);
        }
        return;
      }

      // Si el campo no es requerido y está vacío, continuar
      if (!rule.required && (value === undefined || value === null || value === '')) {
        return;
      }

      // Aplicar transformación
      if (rule.transformer) {
        try {
          data[rule.field] = rule.transformer(value);
        } catch (error) {
          warnings.push(`Error transformando campo ${rule.field}: ${error}`);
        }
      }

      // Aplicar validación
      if (rule.validator && !rule.validator(data[rule.field])) {
        errors.push(rule.errorMessage || `Valor inválido para campo ${rule.field}`);
      }
    });

    return { warnings, errors };
  }

  /**
   * Post-procesamiento específico
   */
  private static applyPostProcessing(
    createRequest: PolizaCreateRequest,
    originalFormData: PolizaFormData,
    context: MappingContext
  ): { warnings: string[]; errors: string[] } {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Validar coherencia de fechas
    if (createRequest.confchdes && createRequest.confchhas) {
      const fechaInicio = new Date(createRequest.confchdes);
      const fechaFin = new Date(createRequest.confchhas);
      
      if (fechaInicio >= fechaFin) {
        errors.push('Fecha de inicio debe ser anterior a fecha de fin');
      }
      
      // Verificar que las fechas no sean muy antiguas o futuras
      const now = new Date();
      const maxFutureYears = 2;
      const maxPastYears = 10;
      
      if (fechaInicio > new Date(now.getFullYear() + maxFutureYears, now.getMonth(), now.getDate())) {
        warnings.push('Fecha de inicio muy lejana en el futuro');
      }
      
      if (fechaFin < new Date(now.getFullYear() - maxPastYears, now.getMonth(), now.getDate())) {
        warnings.push('Fecha de fin muy antigua');
      }
    }

    // Validar coherencia financiera
    if (createRequest.conpremio && createRequest.premioTotal) {
      if (createRequest.conpremio > createRequest.premioTotal * 1.1) { // 10% de tolerancia
        warnings.push('Prima mayor que premio total - verificar cálculos');
      }
    }

    // Asegurar que campos críticos no estén vacíos
    if (!createRequest.moneda) {
      createRequest.moneda = 'PES';
      warnings.push('Moneda no especificada - asignado PES por defecto');
    }

    if (!createRequest.ramo) {
      createRequest.ramo = 'AUTOMOVILES';
      warnings.push('Ramo no especificado - asignado AUTOMOVILES por defecto');
    }

    // Normalizar matrícula
    if (createRequest.conmataut) {
      const originalMatricula = createRequest.conmataut;
      createRequest.conmataut = createRequest.conmataut.toUpperCase().replace(/[^A-Z0-9]/g, '');
      
      if (originalMatricula !== createRequest.conmataut) {
        warnings.push(`Matrícula normalizada: ${originalMatricula} → ${createRequest.conmataut}`);
      }
    }

    return { warnings, errors };
  }

  /**
   * Generar observaciones iniciales para documentos procesados
   */
  private static generateInitialObservations(documentResult: DocumentProcessResult): string {
    const observations = [];
    
    observations.push('📄 DOCUMENTO PROCESADO AUTOMÁTICAMENTE');
    observations.push(`📁 Archivo: ${documentResult.nombreArchivo || 'Desconocido'}`);
    observations.push(`📅 Fecha: ${new Date().toLocaleString('es-UY')}`);
    
    if (documentResult.nivelConfianza) {
      observations.push(`🎯 Confianza: ${(documentResult.nivelConfianza * 100).toFixed(1)}%`);
    }
    
    if (documentResult.requiereVerificacion) {
      observations.push('⚠️ REQUIERE VERIFICACIÓN MANUAL');
    }
    
    observations.push('✅ Revisar datos antes de procesar');
    
    return observations.join('\n');
  }
}

// ✅ Funciones de utilidad
function formatDateForVelneo(dateValue: any): string {
  if (!dateValue) return '';
  
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return '';
    
    // Formato DD/MM/YYYY para Velneo
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch {
    return '';
  }
}

function formatDateForForm(dateValue: any): string {
  if (!dateValue) return '';
  
  try {
    // Si ya está en formato DD/MM/YYYY, convertir a YYYY-MM-DD
    if (typeof dateValue === 'string' && dateValue.includes('/')) {
      const [day, month, year] = dateValue.split('/');
      if (day && month && year) {
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
    
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return '';
    
    // Formato YYYY-MM-DD para inputs de fecha HTML
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

function isValidDateString(value: any): boolean {
  if (!value) return false;
  
  try {
    const date = new Date(value);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
}

function isValidMatricula(value: string): boolean {
  if (!value) return true; // Opcional
  
  const matricula = value.trim().toUpperCase();
  // Formato uruguayo: AAA1234, AA1234, 1234AA
  return /^[A-Z]{2,3}\d{4}$|^\d{4}[A-Z]{2}$/.test(matricula);
}

function isValidEmail(value: string): boolean {
  if (!value) return true; // Opcional
  
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidTelefono(value: string): boolean {
  if (!value) return true; // Opcional
  
  const telefono = value.replace(/[^0-9]/g, '');
  return telefono.length >= 8 && telefono.length <= 12;
}

export default FormDataMapper;