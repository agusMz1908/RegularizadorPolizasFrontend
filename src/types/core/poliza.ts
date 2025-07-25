export interface PolizaCreateRequest {
  // ✅ CAMPOS BÁSICOS REQUERIDOS
  comcod: number;
  seccod: number;
  clinro: number;
  conpol: string;
  confchdes: string;
  confchhas: string;
  conpremio: number;
  asegurado: string;

  // ✅ CAMPOS DE CONTROL Y ESTADO
  contra?: string;        // Trámite
  congesti?: string;      // Tipo gestión
  congeses?: string;      // Estado gestión
  convig?: string;        // Estado póliza
  consta?: string;        // Forma pago

  // ✅ DATOS DEL VEHÍCULO
  conmaraut?: string;     // Marca
  conanioaut?: number;    // Año
  conmataut?: string;     // Matrícula
  conmotor?: string;      // Motor
  conchasis?: string;     // Chasis
  conpadaut?: string;     // Padrón

  // ✅ DATOS COMERCIALES
  contot?: number;        // Total
  concuo?: number;        // Cuotas
  moncod?: number;        // Moneda
  conimp?: number;        // Importe
  ramo?: string;
  com_alias?: string;

  // ✅ CLASIFICACIONES
  catdsc?: number;        // Categoría
  desdsc?: number;        // Destino
  caldsc?: number;        // Calidad
  flocod?: number;        // Flota
  tarcod?: number;        // Tarifa
  corrnom?: number;       // Corredor

  // ✅ DATOS DEL CLIENTE
  condom?: string;        // Dirección
  clinom?: string;        // Nombre cliente
  clinro1?: number;       // Tomador

  // ✅ COBERTURAS
  tposegdsc?: string;     // Tipo seguro/Cobertura
  concar?: string;        // Certificado
  conend?: string;        // Endoso
  forpagvid?: string;     // Forma pago vida

  // ✅ CAMPOS ADICIONALES VEHÍCULOS
  conclaaut?: number;
  condedaut?: number;
  conresciv?: number;
  conbonnsin?: number;
  conbonant?: number;
  concaraut?: number;
  concapaut?: number;

  // ✅ GESTIÓN
  concesnom?: string;
  concestel?: string;
  congesfi?: string;
  conges?: string;

  // ✅ AUDITORÍA
  observaciones?: string;
  procesadoConIA?: boolean;
  fechaCreacion?: string;
  fechaModificacion?: string;

  // ✅ CAMPOS LEGACY
  vehiculo?: string;
  marca?: string;
  modelo?: string;
  motor?: string;
  chasis?: string;
  matricula?: string;
  combustible?: string;
  anio?: number;
  primaComercial?: number;
  premioTotal?: number;
  corredor?: string;
  plan?: string;
  documento?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  localidad?: string;
  departamento?: string;
  moneda?: string;

  // ✅ CAMPOS DEL WIZARD
  seccionId?: number;
  estado?: string;
  tramite?: string;
  estadoPoliza?: string;
  calidadId?: number;
  destinoId?: number;
  categoriaId?: number;
  tipoVehiculo?: string;
  uso?: string;
  formaPago?: string;
  cantidadCuotas?: number;
  valorCuota?: number;
  tipo?: string;
  cobertura?: string;
  certificado?: string;
}

/**
 * Datos del formulario del wizard
 */
export interface PolizaFormData {
  // ✅ CAMPOS REQUERIDOS
  numeroPoliza: string;
  vigenciaDesde: string;
  vigenciaHasta: string;
  prima: string;              // ✅ CAMBIADO: number → string (para Velneo)
  moneda: string;
  asegurado: string;
  compania: number;
  nombreCompania: string;
  seccionId: number;
  clienteId: number;
  cobertura: string;

  // ✅ CAMPOS OPCIONALES EXISTENTES
  observaciones: string;
  vehiculo: string;
  marca: string;
  modelo: string;
  matricula: string;
  motor: string;
  chasis: string;
  anio: string;
  primaComercial: string;     // ✅ CAMBIADO: number → string
  premioTotal: string;        // ✅ CAMBIADO: number → string
  cantidadCuotas: number;
  valorCuota: string;         // ✅ CAMBIADO: number → string
  formaPago: string;
  primeraCuotaFecha: string;
  primeraCuotaMonto: string;  // ✅ CAMBIADO: number → string
  documento: string;
  email: string;
  telefono: string;
  direccion: string;
  localidad: string;
  departamento: string;
  corredor: string;
  plan: string;
  ramo: string;
  certificado: string;
  estadoPoliza: string;
  tramite: string;
  tipo: string;
  destino: string;
  combustible: string;
  calidad: string;
  categoria: string;
  tipoVehiculo: string;
  uso: string;

  // ✅ IDs para combos
  combustibleId: number | null;
  categoriaId: number | null;
  destinoId: number | null;
  calidadId: number | null;

  // ✅ CAMPOS ADICIONALES EXISTENTES
  operacion: string | null;
  seccion: string;

  // ✅ CAMPOS FALTANTES QUE CAUSAN ERRORES
  nombreAsegurado: string;
  chapa: string;

  // ✅ CAMPOS ADICIONALES DEL HOOK usePolizaForm
  color: string;
  impuestoMSP: string;        // ✅ CAMBIADO: number → string
  descuentos: string;         // ✅ CAMBIADO: number → string
  recargos: string;           // ✅ CAMBIADO: number → string
  codigoPostal: string;

  // ✅ CAMPOS ESPECÍFICOS DE VELNEO
  tramiteVelneo?: string;
  estadoPolizaVelneo?: string;
  formaPagoVelneo?: string;
  monedaVelneo?: string;
  estadoGestionVelneo: string;

  // ✅ CAMPOS FALTANTES QUE APARECEN EN EL ERROR
  endoso: string;                    // ✅ AGREGADO
  tipoMovimiento: string;           // ✅ AGREGADO
  zonaCirculacion: string;          // ✅ AGREGADO
  codigoMoneda: string;             // ✅ AGREGADO
  totalBonificaciones: string;      // ✅ AGREGADO
  observacionesGestion: string;     // ✅ AGREGADO
  informacionAdicional: string;     // ✅ AGREGADO

  datosVelneo?: any;               // Para referencia completa si es necesario
}

export const createEmptyPolizaFormData = (): PolizaFormData => ({
  // Campos requeridos
  numeroPoliza: '',
  vigenciaDesde: '',
  vigenciaHasta: '',
  prima: '0',
  moneda: 'UYU',
  asegurado: '',
  compania: 0,
  nombreCompania: '',
  seccionId: 0,
  clienteId: 0,
  cobertura: '',

  // Campos opcionales existentes
  observaciones: '',
  vehiculo: '',
  marca: '',
  modelo: '',
  matricula: '',
  motor: '',
  chasis: '',
  anio: '',
  primaComercial: '0',
  premioTotal: '0',
  cantidadCuotas: 1,
  valorCuota: '0',
  formaPago: '',
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
  estadoPoliza: '',
  tramite: '',
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

  // Campos adicionales
  operacion: null,
  seccion: '',
  nombreAsegurado: '',
  chapa: '',
  color: '',
  impuestoMSP: '0',
  descuentos: '0',
  recargos: '0',
  codigoPostal: '',

  // Campos Velneo
  estadoGestionVelneo: '',

  // Campos nuevos agregados
  endoso: '',
  tipoMovimiento: '',
  zonaCirculacion: '',
  codigoMoneda: '',
  totalBonificaciones: '0',
  observacionesGestion: '',
  informacionAdicional: ''
});

export interface PolizaDto {
  id: number;
  comcod: number;
  clinro: number;
  conpol: string;
  confchdes: Date | null;
  confchhas: Date | null;
  conpremio: number;
  clinom: string;
  condom: string;
  conmaraut: string;
  conmotor: string;
  conchasis: string;
  conmataut: string;
  conanioaut: number | null;
  moncod: number | null;
  contot: number | null;
  ramo: string;
  com_alias: string;
  observaciones: string;
  convig: string;
  consta: string;
  contra: string;
  activo: boolean;
  procesado: boolean;
  fechaCreacion: Date;
  fechaModificacion: Date;
  ingresado: Date;
  last_update: Date;
}

// ============================================================================
// 🏷️ TIPOS Y CONSTANTES
// ============================================================================

/**
 * Estados de póliza válidos
 */
export const ESTADOS_POLIZA = {
  'VIG': 'Vigente',
  'VEN': 'Vencida',
  'END': 'Endosada',
  'CAN': 'Cancelada',
  'ANT': 'Antecedente'
} as const;

export type EstadoPoliza = keyof typeof ESTADOS_POLIZA;

/**
 * Trámites válidos
 */
export const TRAMITES = {
  'Nuevo': 'Póliza nueva (emisión)',
  'Renovacion': 'Renovación de póliza existente',
  'Cambio': 'Modificación/cambio en póliza',
  'Endoso': 'Endoso de póliza',
  'Cancelacion': 'Cancelación de póliza'
} as const;

export type Tramite = keyof typeof TRAMITES;

/**
 * Formas de pago válidas
 */
export const FORMAS_PAGO = {
  '1': 'Contado',
  '2': 'Tarjeta',
  '3': 'Débito Automático',
  '4': 'Cuotas'
} as const;

export type FormaPago = keyof typeof FORMAS_PAGO;

/**
 * Monedas válidas
 */
export const MONEDAS = {
  1: 'UYU',
  2: 'USD',
  3: 'UI'
} as const;

export type MonedaId = keyof typeof MONEDAS;

/**
 * Estados de gestión válidos
 */
export const ESTADOS_GESTION = {
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

export type EstadoGestion = keyof typeof ESTADOS_GESTION;