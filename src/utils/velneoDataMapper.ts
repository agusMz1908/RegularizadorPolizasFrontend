// src/utils/velneoDataMappers.ts

import { PolizaFormData, PolizaCreateRequest } from '../types/core/poliza';
import { ValidationError } from '../types/wizard/validation';

// ============================================================================
// 🏢 CONFIGURACIONES POR COMPAÑÍA
// ============================================================================

/**
 * Configuraciones específicas por compañía de seguros
 */
export interface CompanyConfig {
  id: number;
  nombre: string;
  codigo: string;
  requiredFields: (keyof PolizaFormData)[];
  fieldMappings: Record<string, string>;
  businessRules: BusinessRule[];
  defaultValues: Partial<PolizaFormData>;
  formatters: Record<string, (value: any) => any>;
}

interface BusinessRule {
  field: keyof PolizaFormData;
  condition: (value: any, formData: PolizaFormData) => boolean;
  action: 'error' | 'warning' | 'transform';
  message: string;
  transform?: (value: any) => any;
}

// Configuraciones por compañía
const COMPANY_CONFIGS: Record<number, CompanyConfig> = {
  1: { // Ejemplo: Sancor Seguros
    id: 1,
    nombre: 'Sancor Seguros',
    codigo: 'SAN',
    requiredFields: ['asegurado', 'documento', 'numeroPoliza', 'vigenciaDesde', 'vigenciaHasta', 'prima'],
    fieldMappings: {
      'asegurado': 'asegurado',
      'documento': 'conci',
      'numeroPoliza': 'conpol',
      'vigenciaDesde': 'confchdes',
      'vigenciaHasta': 'confchhas',
      'prima': 'conpremio'
    },
    businessRules: [
      {
        field: 'prima',
        condition: (value) => value > 50000,
        action: 'warning',
        message: 'Prima alta para Sancor, verificar autorización'
      }
    ],
    defaultValues: {
      moneda: 'UYU',
      formaPago: 'Contado'
    },
    formatters: {
      documento: (value: string) => value.replace(/\D/g, '').padStart(8, '0')
    }
  },
  2: { // Ejemplo: Mapfre
    id: 2,
    nombre: 'Mapfre',
    codigo: 'MAP',
    requiredFields: ['asegurado', 'documento', 'numeroPoliza', 'vigenciaDesde', 'vigenciaHasta', 'prima', 'matricula'],
    fieldMappings: {
      'asegurado': 'asegurado',
      'documento': 'cedula_identidad',
      'numeroPoliza': 'numero_poliza',
      'vigenciaDesde': 'fecha_desde',
      'vigenciaHasta': 'fecha_hasta',
      'prima': 'prima_neta',
      'matricula': 'placa_vehiculo'
    },
    businessRules: [
      {
        field: 'matricula',
        condition: (value) => !value || value === '',
        action: 'error',
        message: 'Matrícula es obligatoria para Mapfre'
      }
    ],
    defaultValues: {
      moneda: 'USD',
      formaPago: 'Tarjeta'
    },
    formatters: {
      matricula: (value: string) => value.toUpperCase().replace(/\s/g, '')
    }
  }
};

// ============================================================================
// 🚗 MAPPERS POR TIPO DE PÓLIZA
// ============================================================================

/**
 * Mapper específico para pólizas de vehículos
 */
export function mapVehiculoToVelneo(
  formData: PolizaFormData,
  companyId: number
): PolizaCreateRequest {
  const config = getCompanyConfig(companyId);
  const baseMapping = mapBasePolizaToVelneo(formData, config);

  return {
    ...baseMapping,
    
    // Campos específicos de vehículos
    conmaraut: formData.marca || '',
    conmotor: formData.motor || '',
    conchasis: formData.chasis || '',
    conmataut: formatMatricula(formData.matricula || ''),
    conanioaut: parseInt(formData.anio) || new Date().getFullYear(),
    conpadaut: generatePadronVehiculo(formData),
    
    // Clasificaciones específicas de auto
    catdsc: mapCategoriaVehiculo(formData.categoria),
    desdsc: mapDestinoVehiculo(formData.destino),
    caldsc: mapCalidadVehiculo(formData.calidad),
    
    // Campos adicionales de vehículos
    conclaaut: mapClaseVehiculo(formData.tipoVehiculo),
    condedaut: mapDeducibleVehiculo(formData.prima),
    conresciv: calculateResponsabilidadCivil(formData.prima),
    conbonnsin: calculateBonificacionSinSiniestros(formData),
    conbonant: calculateBonificacionAntiguedad(formData),
    concaraut: mapCaracteristicasVehiculo(formData),
    concapaut: mapCapacidadVehiculo(formData.tipoVehiculo),
    
    // Metadatos específicos
    ramo: 'AUTOMOTOR',
    tposegdsc: determineCobertura(formData.cobertura),
    
    // Campos legacy para compatibilidad
    vehiculo: `${formData.marca} ${formData.modelo} ${formData.anio}`.trim(),
    combustible: formData.combustible || 'NAFTA'
  };
}

/**
 * Mapper específico para pólizas de hogar
 */
export function mapHogarToVelneo(
  formData: PolizaFormData,
  companyId: number
): PolizaCreateRequest {
  const config = getCompanyConfig(companyId);
  const baseMapping = mapBasePolizaToVelneo(formData, config);

  return {
    ...baseMapping,
    
    // Campos específicos de hogar
    ramo: 'HOGAR',
    tposegdsc: 'INTEGRAL_HOGAR',
    
    // Dirección como campo principal
    condom: formData.direccion || '',
    
    // Clasificaciones específicas de hogar
    catdsc: mapCategoriaHogar(formData.categoria),
    desdsc: mapDestinoHogar(formData.destino),
    caldsc: mapCalidadHogar(formData.calidad),
    
    // Suma asegurada como campo principal
    contot: formData.primaComercial || formData.prima,
    
    // Metadatos específicos
    concar: 'HOGAR_FAMILIAR',
    conend: '',
    forpagvid: ''
  };
}

/**
 * Mapper específico para pólizas de vida
 */
export function mapVidaToVelneo(
  formData: PolizaFormData,
  companyId: number
): PolizaCreateRequest {
  const config = getCompanyConfig(companyId);
  const baseMapping = mapBasePolizaToVelneo(formData, config);

  return {
    ...baseMapping,
    
    // Campos específicos de vida
    ramo: 'VIDA',
    tposegdsc: 'VIDA_INDIVIDUAL',
    
    // Beneficiario principal es el asegurado
    clinom: formData.asegurado,
    clinro1: formData.clienteId,
    
    // Clasificaciones específicas de vida
    catdsc: mapCategoriaVida(formData.categoria),
    caldsc: mapCalidadVida(formData.calidad),
    
    // Forma de pago específica para vida
    forpagvid: mapFormaPagoVida(formData.formaPago),
    consta: mapFormaPagoToCode(formData.formaPago),
    
    // Capital asegurado
    contot: formData.primaComercial || formData.prima * 10, // Típicamente 10x la prima
    
    // Sin campos de vehículo
    conmaraut: '',
    conmotor: '',
    conchasis: '',
    conmataut: '',
    conanioaut: 0
  };
}

// ============================================================================
// 🔄 MAPPER BASE Y UTILIDADES
// ============================================================================

/**
 * Mapper base que aplica a todos los tipos de póliza
 */
function mapBasePolizaToVelneo(
  formData: PolizaFormData,
  config: CompanyConfig
): PolizaCreateRequest {
  // Aplicar formatters específicos de la compañía
  const formattedData = applyFormatters(formData, config);
  
  return {
    // Campos básicos requeridos
    comcod: config.id,
    seccod: formData.seccionId,
    clinro: formData.clienteId,
    conpol: formattedData.numeroPoliza,
    confchdes: formatDateForVelneo(formattedData.vigenciaDesde),
    confchhas: formatDateForVelneo(formattedData.vigenciaHasta),
    conpremio: formattedData.prima,
    asegurado: formattedData.asegurado,

    // Datos del cliente
    clinom: formattedData.nombreAsegurado || formattedData.asegurado,
    condom: formattedData.direccion || '',
    
    // Datos comerciales
    contot: formattedData.premioTotal || formattedData.prima,
    concuo: formattedData.cantidadCuotas || 1,
    moncod: mapMonedaToCode(formattedData.moneda),
    conimp: formattedData.primaComercial || formattedData.prima,
    
    // Estados
    convig: mapEstadoPoliza(formattedData.estadoPoliza),
    consta: mapFormaPagoToCode(formattedData.formaPago),
    contra: mapTramiteToCode(formattedData.tramite),
    congesti: '1', // Pendiente por defecto
    congeses: '1', // Pendiente por defecto
    
    // Compañía
    com_alias: config.codigo,
    
    // Auditoría
    observaciones: formattedData.observaciones || '',
    procesadoConIA: true,
    fechaCreacion: new Date().toISOString(),
    fechaModificacion: new Date().toISOString(),
    
    // Campos legacy para compatibilidad
    documento: formattedData.documento || '',
    email: formattedData.email || '',
    telefono: formattedData.telefono || '',
    direccion: formattedData.direccion || '',
    localidad: formattedData.localidad || '',
    departamento: formattedData.departamento || '',
    moneda: formattedData.moneda
  };
}

/**
 * Aplica formatters específicos de la compañía
 */
function applyFormatters(formData: PolizaFormData, config: CompanyConfig): PolizaFormData {
  const formatted = { ...formData };
  
  Object.entries(config.formatters).forEach(([field, formatter]) => {
    const value = (formatted as any)[field];
    if (value !== undefined && value !== null) {
      (formatted as any)[field] = formatter(value);
    }
  });
  
  return formatted;
}

/**
 * Obtiene la configuración de una compañía
 */
function getCompanyConfig(companyId: number): CompanyConfig {
  return COMPANY_CONFIGS[companyId] || {
    id: companyId,
    nombre: 'Compañía Desconocida',
    codigo: 'UNK',
    requiredFields: ['asegurado', 'numeroPoliza', 'vigenciaDesde', 'vigenciaHasta', 'prima'],
    fieldMappings: {},
    businessRules: [],
    defaultValues: {},
    formatters: {}
  };
}

// ============================================================================
// 🗺️ FUNCIONES DE MAPEO ESPECÍFICAS
// ============================================================================

/**
 * Mapea moneda a código Velneo
 */
function mapMonedaToCode(moneda: string): number {
  const mapping: Record<string, number> = {
    'UYU': 1,
    'USD': 2,
    'UI': 3,
    'EUR': 4
  };
  return mapping[moneda] || 1;
}

/**
 * Mapea forma de pago a código Velneo
 */
function mapFormaPagoToCode(formaPago: string): string {
  const mapping: Record<string, string> = {
    'Contado': '1',
    'Tarjeta': '2',
    'Débito Automático': '3',
    'Cuotas': '4',
    'Transferencia': '5'
  };
  return mapping[formaPago] || '1';
}

/**
 * Mapea trámite a código Velneo
 */
function mapTramiteToCode(tramite: string): string {
  const mapping: Record<string, string> = {
    'Nuevo': 'NU',
    'Renovacion': 'RN',
    'Cambio': 'CB',
    'Endoso': 'EN',
    'Cancelacion': 'CA'
  };
  return mapping[tramite] || 'NU';
}

/**
 * Mapea estado de póliza
 */
function mapEstadoPoliza(estado: string): string {
  const mapping: Record<string, string> = {
    'VIG': 'VIG',
    'VEN': 'VEN',
    'END': 'END',
    'CAN': 'CAN',
    'ANT': 'ANT'
  };
  return mapping[estado] || 'VIG';
}

/**
 * Formatea fecha para Velneo (YYYY-MM-DD)
 */
function formatDateForVelneo(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  return date.toISOString().split('T')[0];
}

/**
 * Formatea matrícula para Velneo
 */
function formatMatricula(matricula: string): string {
  return matricula.toUpperCase().replace(/\s/g, '');
}

// ============================================================================
// 🚗 MAPEOS ESPECÍFICOS DE VEHÍCULOS
// ============================================================================

/**
 * Mapea categoría de vehículo
 */
function mapCategoriaVehiculo(categoria: string): number {
  const mapping: Record<string, number> = {
    'AUTO': 1,
    'CAMIONETA': 2,
    'MOTO': 3,
    'CAMION': 4,
    'OMNIBUS': 5,
    'TRAILER': 6,
    'TRACTOCAMION': 7
  };
  return mapping[categoria?.toUpperCase()] || 1;
}

/**
 * Mapea destino de vehículo
 */
function mapDestinoVehiculo(destino: string): number {
  const mapping: Record<string, number> = {
    'PARTICULAR': 1,
    'COMERCIAL': 2,
    'TAXI': 3,
    'REMISE': 4,
    'CARGA': 5,
    'PUBLICO': 6
  };
  return mapping[destino?.toUpperCase()] || 1;
}

/**
 * Mapea calidad de vehículo
 */
function mapCalidadVehiculo(calidad: string): number {
  const mapping: Record<string, number> = {
    'NUEVO': 1,
    'USADO': 2,
    'SEMINUEVO': 3
  };
  return mapping[calidad?.toUpperCase()] || 2;
}

/**
 * Mapea clase de vehículo
 */
function mapClaseVehiculo(tipoVehiculo: string): number {
  const mapping: Record<string, number> = {
    'SEDAN': 1,
    'HATCHBACK': 2,
    'SUV': 3,
    'PICKUP': 4,
    'COUPE': 5,
    'CONVERTIBLE': 6
  };
  return mapping[tipoVehiculo?.toUpperCase()] || 1;
}

/**
 * Calcula deducible basado en la prima
 */
function mapDeducibleVehiculo(prima: number): number {
  if (prima < 10000) return 1; // Sin deducible
  if (prima < 30000) return 2; // Deducible bajo
  if (prima < 60000) return 3; // Deducible medio
  return 4; // Deducible alto
}

/**
 * Calcula responsabilidad civil
 */
function calculateResponsabilidadCivil(prima: number): number {
  // Mínimo legal en Uruguay: $600,000
  const minimo = 600000;
  const factor = Math.max(1, Math.floor(prima / 10000));
  return minimo * factor;
}

/**
 * Calcula bonificación por no siniestros
 */
function calculateBonificacionSinSiniestros(formData: PolizaFormData): number {
  // Lógica simplificada - en la práctica vendría de historial
  return 0; // Sin bonificación por defecto
}

/**
 * Calcula bonificación por antigüedad
 */
function calculateBonificacionAntiguedad(formData: PolizaFormData): number {
  const currentYear = new Date().getFullYear();
  const vehicleYear = parseInt(formData.anio) || currentYear;
  const years = currentYear - vehicleYear;
  
  if (years > 10) return -20; // Recargo por antigüedad
  if (years > 5) return -10;
  if (years < 2) return 5; // Bonificación por nuevo
  
  return 0;
}

/**
 * Mapea características de vehículo
 */
function mapCaracteristicasVehiculo(formData: PolizaFormData): number {
  let caracteristicas = 0;
  
  // Bits para diferentes características
  if (formData.color?.toLowerCase().includes('blanco')) caracteristicas |= 1;
  if (formData.combustible?.toLowerCase().includes('diesel')) caracteristicas |= 2;
  if (parseInt(formData.anio) > new Date().getFullYear() - 3) caracteristicas |= 4;
  
  return caracteristicas;
}

/**
 * Mapea capacidad de vehículo
 */
function mapCapacidadVehiculo(tipoVehiculo: string): number {
  const mapping: Record<string, number> = {
    'MOTO': 2,
    'AUTO': 5,
    'CAMIONETA': 5,
    'SUV': 7,
    'CAMION': 3,
    'OMNIBUS': 50
  };
  return mapping[tipoVehiculo?.toUpperCase()] || 5;
}

/**
 * Genera padrón de vehículo (simplificado)
 */
function generatePadronVehiculo(formData: PolizaFormData): string {
  // En la práctica, esto vendría de una API externa
  const year = formData.anio || new Date().getFullYear();
  const marca = formData.marca?.substring(0, 3).toUpperCase() || 'XXX';
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `${year}${marca}${random}`;
}

/**
 * Determina cobertura basada en el tipo
 */
function determineCobertura(cobertura: string): string {
  const mapping: Record<string, string> = {
    'RESPONSABILIDAD_CIVIL': 'RC',
    'TERCEROS_COMPLETO': 'TC',
    'TODO_RIESGO': 'TR',
    'TOTAL': 'TOT'
  };
  return mapping[cobertura?.toUpperCase()] || 'RC';
}

// ============================================================================
// 🏠 MAPEOS ESPECÍFICOS DE HOGAR
// ============================================================================

function mapCategoriaHogar(categoria: string): number {
  const mapping: Record<string, number> = {
    'CASA': 1,
    'APARTAMENTO': 2,
    'OFICINA': 3,
    'LOCAL': 4
  };
  return mapping[categoria?.toUpperCase()] || 1;
}

function mapDestinoHogar(destino: string): number {
  const mapping: Record<string, number> = {
    'VIVIENDA': 1,
    'COMERCIAL': 2,
    'MIXTO': 3
  };
  return mapping[destino?.toUpperCase()] || 1;
}

function mapCalidadHogar(calidad: string): number {
  const mapping: Record<string, number> = {
    'EXCELENTE': 1,
    'MUY_BUENA': 2,
    'BUENA': 3,
    'REGULAR': 4
  };
  return mapping[calidad?.toUpperCase()] || 3;
}

// ============================================================================
// 💼 MAPEOS ESPECÍFICOS DE VIDA
// ============================================================================

function mapCategoriaVida(categoria: string): number {
  const mapping: Record<string, number> = {
    'INDIVIDUAL': 1,
    'FAMILIAR': 2,
    'GRUPAL': 3
  };
  return mapping[categoria?.toUpperCase()] || 1;
}

function mapCalidadVida(calidad: string): number {
  const mapping: Record<string, number> = {
    'ESTANDAR': 1,
    'PREFERENCIAL': 2,
    'SUPER_PREFERENCIAL': 3
  };
  return mapping[calidad?.toUpperCase()] || 1;
}

function mapFormaPagoVida(formaPago: string): string {
  const mapping: Record<string, string> = {
    'ANUAL': 'A',
    'SEMESTRAL': 'S',
    'TRIMESTRAL': 'T',
    'MENSUAL': 'M'
  };
  return mapping[formaPago?.toUpperCase()] || 'A';
}

// ============================================================================
// ✅ VALIDACIONES ESPECÍFICAS POR COMPAÑÍA
// ============================================================================

/**
 * Valida datos según reglas de negocio de la compañía
 */
export function validateForCompany(
  formData: PolizaFormData,
  companyId: number
): { isValid: boolean; errors: ValidationError[]; warnings: ValidationError[] } {
  const config = getCompanyConfig(companyId);
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Validar campos requeridos
  config.requiredFields.forEach(field => {
    const value = formData[field];
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      errors.push({
        field,
        message: `${field} es requerido para ${config.nombre}`,
        severity: 'error'
      });
    }
  });

  // Aplicar reglas de negocio
  config.businessRules.forEach(rule => {
    const value = formData[rule.field];
    if (rule.condition(value, formData)) {
      const error: ValidationError = {
        field: rule.field,
        message: rule.message,
        severity: rule.action === 'error' ? 'error' : 'warning'
      };

      if (rule.action === 'error') {
        errors.push(error);
      } else if (rule.action === 'warning') {
        warnings.push(error);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Aplica valores por defecto de la compañía
 */
export function applyCompanyDefaults(
  formData: PolizaFormData,
  companyId: number
): PolizaFormData {
  const config = getCompanyConfig(companyId);
  
  return {
    ...config.defaultValues,
    ...formData // Los datos del formulario tienen prioridad
  };
}

/**
 * Obtiene el mapper apropiado según el tipo de póliza
 */
export function getMapperForPolicyType(
  policyType: string,
  formData: PolizaFormData,
  companyId: number
): PolizaCreateRequest {
  switch (policyType.toLowerCase()) {
    case 'vehiculo':
    case 'auto':
    case 'automotor':
      return mapVehiculoToVelneo(formData, companyId);
      
    case 'hogar':
    case 'casa':
    case 'vivienda':
      return mapHogarToVelneo(formData, companyId);
      
    case 'vida':
    case 'personal':
      return mapVidaToVelneo(formData, companyId);
      
    default:
      // Mapper genérico
      const config = getCompanyConfig(companyId);
      return mapBasePolizaToVelneo(formData, config);
  }
}

export default {
  // Mappers principales
  mapVehiculoToVelneo,
  mapHogarToVelneo,
  mapVidaToVelneo,
  
  // Validaciones
  validateForCompany,
  applyCompanyDefaults,
  
  // Utilidades
  getMapperForPolicyType,
  getCompanyConfig,
  
  // Mappers de campos específicos
  mapMonedaToCode,
  mapFormaPagoToCode,
  mapTramiteToCode,
  mapEstadoPoliza,
  formatDateForVelneo,
  formatMatricula
};