// src/types/velneo.ts
// 🎯 TIPOS TYPESCRIPT PARA INTEGRACIÓN VELNEO
// Basado en documentación oficial de campos estáticos y maestros

// ====================================================================
// 🔹 CAMPOS ESTÁTICOS DE VELNEO (Combos de texto plano)
// ====================================================================

// 📋 TRAMITE - Campo CONTRA (Estática: TRAMITE@Seguros)
export type VelneoTramite = 'Nuevo' | 'Renovacion' | 'Cambio' | 'Endoso' | 'No Renueva' | 'Cancelacion';

// 📊 ESTADO DE GESTIÓN - Campo CONGESES (Estática: ESTADO_GESTION@Seguros)
export type VelneoEstadoGestion = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11';

// ✅ ESTADO PÓLIZA - Campo CONVIG (Estática: ESTADO@Seguros)
export type VelneoEstadoPoliza = 'VIG' | 'VEN' | 'END' | 'CAN' | 'ANT';

// 💳 FORMA DE PAGO - Campo CONSTA (Estática: FORMA_PAGO@Seguros)
export type VelneoFormaPago = 
  | 'Efectivo' 
  | 'Tarjeta Cred.' 
  | 'Débito Banc.' 
  | 'Cobrador' 
  | 'Conforme' 
  | 'Cheque directo' 
  | 'Transferencia bancaria' 
  | 'Pass Card';

// 💰 MONEDA - Campo MONCOD (aunque es maestro, mapeamos a códigos)
export type VelneoMoneda = 'DOL' | 'EU' | 'PES' | 'RS' | 'UF';

// 📄 CLAUSULA - Campo CLAUSULA (Estática: CLAUSULA@Seguros)
export type VelneoClausula = string; // Valores específicos según configuración

// 🧾 FACTURACIÓN - Campo FACTURACION (Estática: FACTURACION@Seguros)
export type VelneoFacturacion = string; // Valores específicos según configuración

// 🎯 TIPO DE GESTIÓN - Campo CONGESTI (Estática: TIPO_GESTION@Seguros)
export type VelneoTipoGestion = '1' | '2' | '3' | '4' | '5';

// ====================================================================
// 🔹 INTERFACES PRINCIPALES
// ====================================================================

/**
 * Estructura completa de campos estáticos mapeados para Velneo
 */
export interface VelneoStaticFields {
  tramite: VelneoTramite;
  estadoGestion: VelneoEstadoGestion; 
  estadoPoliza: VelneoEstadoPoliza;
  formaPago: VelneoFormaPago;
  moneda: VelneoMoneda;
  tipoGestion?: VelneoTipoGestion;
  clausula?: VelneoClausula;
  facturacion?: VelneoFacturacion;
}

/**
 * Datos de entrada para el mapeo (desde Azure o formulario)
 */
export interface VelneoMappingInput {
  // Datos desde Azure Document Intelligence
  tramiteTexto?: string;
  estadoTexto?: string;
  estadoPolizaTexto?: string;
  formaPagoTexto?: string;
  monedaTexto?: string;
  
  // Datos del formulario del usuario
  operacion?: string;
  fechaVencimiento?: string | Date; 
  
  // Metadatos adicionales
  tipoDocumento?: string;
  fuenteDatos?: 'azure' | 'formulario' | 'manual';
}
/**
 * Resultado del mapeo con información de depuración
 */
export interface VelneoMappingResult {
  campos: VelneoStaticFields;
  warnings: string[];
  mapping: {
    tramite: { original: string; mapeado: VelneoTramite; metodo: string };
    estadoGestion: { original: string; mapeado: VelneoEstadoGestion; metodo: string };
    estadoPoliza: { original: string; mapeado: VelneoEstadoPoliza; metodo: string };
    formaPago: { original: string; mapeado: VelneoFormaPago; metodo: string };
    moneda: { original: string; mapeado: VelneoMoneda; metodo: string };
  };
}

/**
 * Contrato completo para enviar a Velneo (basado en documentación)
 */
export interface VelneoContrato {
  // 📋 IDENTIFICADORES PRINCIPALES
  id?: number;
  comcod: number;           // Compañía (Maestro: COMPANIAS@Seguros)
  seccod: number;           // Sección (Maestro: SECCIONES@Seguros)
  clinro: number;           // Cliente (Maestro: CLIENTES@Seguros)
  
  // 📄 DATOS BÁSICOS DE LA PÓLIZA
  conpol: string;           // Número de póliza
  conend?: string;          // Endoso
  confchdes: string | Date; // Fecha desde
  confchhas: string | Date; // Fecha hasta
  conpremio: number;        // Premio
  contot: number;           // Total
  concuo: number;           // Cuotas
  
  // 🎯 CAMPOS ESTÁTICOS CRÍTICOS (El núcleo del problema)
  contra: VelneoTramite;              // Trámite ← CAMPO CRÍTICO
  congeses: VelneoEstadoGestion;      // Estado gestión ← CAMPO CRÍTICO
  convig: VelneoEstadoPoliza;         // Estado póliza ← CAMPO CRÍTICO
  consta: VelneoFormaPago;            // Forma pago ← CAMPO CRÍTICO
  moncod: VelneoMoneda;               // Moneda ← CAMPO CRÍTICO
  congesti?: VelneoTipoGestion;       // Tipo gestión
  
  // 🏢 DATOS DEL CLIENTE
  condom: string;           // Dirección
  clinom: string;           // Nombre cliente
  
  // 🚗 DATOS DEL VEHÍCULO (para automóviles)
  conmaraut?: string;       // Marca
  conanioaut?: number;      // Año
  conmataut?: string;       // Matrícula
  conchasis?: string;       // Chasis
  conmotor?: string;        // Motor
  conpadaut?: string;       // Padrón
  conclaaut?: number;       // Clase auto
  condedaut?: number;       // Deducible auto
  conresciv?: number;       // Responsabilidad civil
  concaraut?: number;       // Carga auto
  concapaut?: number;       // Capacidad auto
  
  // 📊 DATOS FINANCIEROS ADICIONALES
  catdsc?: number;          // Categoría (Maestro: CATEGORIAS@Seguros)
  desdsc?: number;          // Destino (Maestro: DESTINOS@Seguros)
  caldsc?: number;          // Calidad (Maestro: CALIDADES@Seguros)
  flocod?: number;          // Flota (Maestro: FLOTAS@Seguros)
  tarcod?: number;          // Tarifa (Maestro: TARIFAS@Seguros)
  corrnom?: number;         // Corredor (Maestro: CORREDORES@Seguros)
  
  // 📝 METADATOS Y AUDITORÍA
  observaciones?: string;   // Observaciones (Objeto Texto)
  conges?: string;          // Gestor
  congesfi?: Date;          // Fecha gestión
  ingresado?: Date;         // Fecha ingreso
  last_update?: Date;       // Última actualización
  
  // 🏷️ DATOS ADICIONALES
  ramo?: string;            // Ramo
  com_alias?: string;       // Alias compañía
  combustibles?: string;    // Combustible (Maestro: COMBUSTIBLES@Seguros)
  
  // 🔄 CAMPOS DE CONTROL
  concan?: number;          // Cancelación
  conpadre?: number;        // Póliza padre
  confchcan?: Date;         // Fecha cancelación
  concaucan?: string;       // Causa cancelación
  
  // 📍 UBICACIÓN Y RIESGOS
  dptnom?: number;          // Departamento (Maestro: DEPARTAMENTOS@Seguros)
  conubi?: string;          // Ubicación
  
  // 🚢 DATOS DE TRANSPORTE (si aplica)
  conmedtra?: string;       // Medio de transporte
  conviades?: string;       // Vía desde
  conviaa?: string;         // Vía a
  conviaenb?: string;       // Vía en barco
  conviakb?: number;        // Vía KB
  conviakn?: number;        // Vía KN
  conviatra?: string;       // Vía transporte
  conviacos?: number;       // Vía costo
  conviafle?: number;       // Vía flete
  
  // 🛡️ SEGUROS ESPECÍFICOS
  tpoconcod?: number;       // Tipo contrato (Maestro: TIPOS_DE_CONTRATO@Seguros)
  tpovivcod?: number;       // Tipo vivienda (Maestro: TIPOS_DE_VIVIENDA@Seguros)
  tporiecod?: number;       // Tipo riesgo (Maestro: TIPOS_DE_RIESGO@Seguros)
  modcod?: number;          // Modalidad (Maestro: MODALIDADES@Seguros)
  
  // 🔢 CAMPOS NUMÉRICOS ADICIONALES
  concapase?: number;       // Capacidad asegurada
  conpricap?: number;       // Prima capital
  conriecod?: number;       // Código riesgo
  conrecfin?: number;       // Recargo financiero
  conimprf?: number;        // Importe RF
  conafesin?: number;       // Afectación sin
  conautcor?: number;       // Auto corrección
  conlinrie?: number;       // Línea riesgo
  
  // 🚗 CAMPOS ESPECÍFICOS DE VEHÍCULOS
  conconesp?: number;       // Concepto especial
  conlimnav?: string;       // Límite navegación
  contpocob?: string;       // Tipo cobertura
  connomemb?: string;       // Nombre embarcación
  contpoemb?: string;       // Tipo embarcación
  
  // 🏷️ CAMPOS DE IDENTIFICACIÓN ADICIONALES
  connroser?: number;       // Número serie
  rieres?: string;          // Riesgo res
  connroint?: number;       // Número interno
  conautnd?: string;        // Auto ND
  conpadend?: number;       // Padre endoso
  contotpri?: number;       // Total prima
  
  // 🎯 CAMPOS BOOLEANOS DE CONTROL
  leer?: boolean;           // Leer observaciones
  enviado?: boolean;        // Enviado
  sob_recib?: boolean;      // Sobre recibido
  leer_obs?: boolean;       // Leer observaciones
  tiene_alarma?: boolean;   // Tiene alarma
  aereo?: boolean;          // Habilitado aéreo
  maritimo?: boolean;       // Habilitado marítimo
  terrestre?: boolean;      // Habilitado terrestre
  importacion?: boolean;    // Importación
  exportacion?: boolean;    // Exportación
  offshore?: boolean;       // Offshore
  transito_interno?: boolean; // Tránsito interno
  llamar?: boolean;         // Llamada renovación
  granizo?: boolean;        // Granizo
  var_ubi?: boolean;        // Varias ubicaciones
  mis_rie?: boolean;        // Mismo riesgo
  conautcort?: boolean;     // Auto cortesía
  primaComercial?: number;
}

/**
 * Respuesta del servicio Velneo
 */
export interface VelneoResponse {
  success: boolean;
  data?: VelneoContrato;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  warnings?: string[];
  metadata?: {
    processingTime: number;
    timestamp: Date;
    version: string;
  };
}

/**
 * Configuración del cliente Velneo
 */
export interface VelneoConfig {
  apiUrl: string;
  timeout: number;
  retryCount: number;
  retryDelay: number;
  enableLogging: boolean;
  enableValidation: boolean;
}

/**
 * Error específico de Velneo
 */
export interface VelneoError extends Error {
  code: string;
  field?: string;
  originalValue?: any;
  suggestedValue?: any;
  context?: {
    contrato?: Partial<VelneoContrato>;
    input?: VelneoMappingInput;
  };
}

// ====================================================================
// 🔹 TIPOS AUXILIARES PARA VALIDACIÓN
// ====================================================================

/**
 * Resultado de validación de campos
 */
export interface VelneoValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    received: any;
    expected: string[];
  }>;
  warnings: Array<{
    field: string;
    message: string;
    value: any;
  }>;
}

/**
 * Información de mapeo para debugging
 */
export interface VelneoMappingInfo {
  field: string;
  originalValue: string;
  mappedValue: string;
  mappingMethod: 'exact_match' | 'keyword_search' | 'pattern_match' | 'default_fallback' | 'date_logic' | 'operation_logic' | 'no_mapping'; 
  confidence: number;
}

/**
 * Estadísticas de mapeo
 */
export interface VelneoMappingStats {
  totalFields: number;
  successfulMappings: number;
  defaultFallbacks: number;
  warnings: number;
  confidence: number; // Promedio de confianza
  processingTime: number;
}

// ====================================================================
// 🔹 CONSTANTES Y ENUMS
// ====================================================================

/**
 * Valores válidos para Estados de Gestión con descripciones
 */
export const VELNEO_ESTADOS_GESTION = {
  '1': 'Pendiente',
  '2': 'Pendiente c/plazo',
  '3': 'Pendiente s/plazo',
  '4': 'Terminado',
  '5': 'En proceso',
  '6': 'Modificaciones',
  '7': 'En emisión',
  '8': 'Enviado a cía',
  '9': 'Enviado a agente mail',
  '10': 'Devuelto a ejecutivo',
  '11': 'Declinado'
} as const;

/**
 * Valores válidos para Estados de Póliza con descripciones
 */
export const VELNEO_ESTADOS_POLIZA = {
  'VIG': 'Vigente',
  'VEN': 'Vencida',
  'END': 'Endosada',
  'CAN': 'Cancelada',
  'ANT': 'Antecedente'
} as const;

/**
 * Valores válidos para Trámites con descripciones
 */
export const VELNEO_TRAMITES = {
  'Nuevo': 'Póliza nueva (emisión)',
  'Renovacion': 'Renovación de póliza existente',
  'Cambio': 'Modificación/cambio en póliza',
  'Endoso': 'Endoso de póliza',
  'No Renueva': 'Póliza que no se renueva',
  'Cancelacion': 'Cancelación de póliza'
} as const;

/**
 * Prioridad de campos para validación
 */
export enum VelneoFieldPriority {
  CRITICAL = 'critical',    // Campos que impiden el envío si fallan
  IMPORTANT = 'important',  // Campos que generan warnings si fallan
  OPTIONAL = 'optional'     // Campos opcionales
}

/**
 * Mapeo de prioridades de campos
 */
export const VELNEO_FIELD_PRIORITIES: Record<keyof VelneoContrato, VelneoFieldPriority> = {
  // Campos críticos
  contra: VelneoFieldPriority.CRITICAL,
  congeses: VelneoFieldPriority.CRITICAL,
  convig: VelneoFieldPriority.CRITICAL,
  consta: VelneoFieldPriority.CRITICAL,
  moncod: VelneoFieldPriority.CRITICAL,
  conpol: VelneoFieldPriority.CRITICAL,
  confchdes: VelneoFieldPriority.CRITICAL,
  confchhas: VelneoFieldPriority.CRITICAL,
  
  // Campos importantes
  comcod: VelneoFieldPriority.IMPORTANT,
  seccod: VelneoFieldPriority.IMPORTANT,
  clinro: VelneoFieldPriority.IMPORTANT,
  clinom: VelneoFieldPriority.IMPORTANT,
  conpremio: VelneoFieldPriority.IMPORTANT,
  
  // Resto como opcional por defecto
} as any;