/**
 * Respuesta principal del procesamiento Azure con estructura Velneo
 */
export interface AzureProcessResponseVelneo {
  archivo: string;
  timestamp: string;
  tiempoProcesamiento: number;
  estado: string;
  datosVelneo: DatosVelneo;
  procesamientoExitoso: boolean;
  listoParaVelneo: boolean;
  porcentajeCompletitud: number;
}

/**
 * Estructura principal que contiene todos los datos organizados por secciones
 */
export interface DatosVelneo {
  datosBasicos: DatosBasicos;
  datosPoliza: DatosPoliza;
  datosVehiculo: DatosVehiculo;
  datosCobertura: DatosCobertura;
  condicionesPago: CondicionesPago;
  bonificaciones: Bonificaciones;
  observaciones: Observaciones;
  metricas: Metricas;
  tieneDatosMinimos: boolean;
  porcentajeCompletitud: number;
  camposCompletos: number;
}

/**
 * Datos básicos del cliente/asegurado
 */
export interface DatosBasicos {
  corredor: string;
  asegurado: string;
  estado: string;
  domicilio: string;            // ✅ Ya viene limpio sin "Dirección:"
  tramite: string;              // ✅ Ya mapeado (Emisión → Nuevo)
  fecha: string;
  asignado: string;
  tipo: string;                 // PERSONA | EMPRESA
  telefono: string;
  email: string;
  documento: string;
  departamento: string;
  localidad: string;
  codigoPostal: string;
}

/**
 * Datos específicos de la póliza
 */
export interface DatosPoliza {
  compania: string;
  desde: string;                // Fecha ISO
  hasta: string;                // Fecha ISO
  numeroPoliza: string;
  certificado: string;
  endoso: string;
  tipoMovimiento: string;       // "TIPO DE MOVIMIENTO: EMISIÓN"
  ramo: string;
}

/**
 * Datos completos del vehículo
 */
export interface DatosVehiculo {
  marcaModelo: string;          // Descripción completa
  marca: string;
  modelo: string;
  anio: string;
  motor: string;
  destino: string;              // PARTICULAR | COMERCIAL
  combustible: string;          // "DIESEL (GAS-OIL)"
  chasis: string;
  calidad: string;
  categoria: string;            // AUTOMOVIL
  matricula: string;
  color: string;
  tipoVehiculo: string;
  uso: string;                  // PARTICULAR | COMERCIAL
}

/**
 * Datos de cobertura y zona
 */
export interface DatosCobertura {
  cobertura: string;            // "SEGURO GLOBAL"
  zonaCirculacion: string;      // "MONTEVIDEO"
  moneda: string;               // "UYU"
  codigoMoneda: number;         // 1
}

/**
 * Condiciones de pago con cronograma detallado
 */
export interface CondicionesPago {
  formaPago: string;            // "TARJETA DE CRÉDITO"
  premio: number;               // 123584.47
  total: number;                // 153790
  valorCuota: number;           // 15379
  cuotas: number;               // 10
  moneda: string;               // "UYU"
  detalleCuotas: DetalleCuotas;
}

/**
 * Cronograma detallado de cuotas
 */
export interface DetalleCuotas {
  cantidadTotal: number;
  cuotas: Cuota[];
  primeraCuota: Cuota;
  montoPromedio: number;
  tieneCuotasDetalladas: boolean;
  primerVencimiento: string;    // Fecha ISO
  primaCuota: number;
}

/**
 * Cuota individual del cronograma
 */
export interface Cuota {
  numero: number;
  fechaVencimiento: string;     // Fecha ISO
  monto: number;
  estado: string;               // "PENDIENTE"
}

/**
 * Bonificaciones y descuentos
 */
export interface Bonificaciones {
  bonificaciones: any[];        // Array de bonificaciones aplicadas
  totalBonificaciones: number;
  descuentos: number;
  recargos: number;
  impuestoMSP: number;
}

/**
 * Observaciones y notas del procesamiento
 */
export interface Observaciones {
  observacionesGenerales: string;
  observacionesGestion: string;
  notasEscaneado: string[];     // ✅ Array de notas automáticas
  informacionAdicional: string;
}

/**
 * Métricas de calidad del procesamiento
 */
export interface Metricas {
  camposExtraidos: number;      // 114
  camposCompletos: number;      // 8
  porcentajeCompletitud: number; // 100
  tieneDatosMinimos: boolean;
  camposFaltantes: string[];
  camposConfianzaBaja: string[];
}

// ================================
// TIPOS PARA EL FORMULARIO
// ================================

/**
 * Datos completos del formulario que se envían a Velneo
 */
export interface PolizaFormDataComplete {
  // Datos Básicos
  corredor: string;
  asegurado: string;
  estado: string;
  domicilio: string;
  tramite: string;
  fecha: string;
  asignado: string;
  tipo: string;
  telefono: string;
  email: string;
  documento: string;
  departamento: string;
  localidad: string;
  codigoPostal: string;

  // Datos Póliza
  compania: string;
  desde: string;
  hasta: string;
  numeroPoliza: string;
  certificado: string;
  endoso: string;
  tipoMovimiento: string;
  ramo: string;

  // Datos Vehículo
  marcaModelo: string;
  marca: string;
  modelo: string;
  anio: string;
  motor: string;
  destino: string;
  combustible: string;
  chasis: string;
  calidad: string;
  categoria: string;
  matricula: string;
  color: string;
  tipoVehiculo: string;
  uso: string;

  // Datos Cobertura
  cobertura: string;
  zonaCirculacion: string;
  moneda: string;
  codigoMoneda: number;

  // Condiciones Pago
  formaPago: string;
  premio: number;
  total: number;
  valorCuota: number;
  cuotas: number;

  // Observaciones
  observacionesGenerales: string;
  observacionesGestion: string;
  informacionAdicional: string;
}

// ================================
// TIPOS PARA EL WIZARD
// ================================

/**
 * Resultado del procesamiento adaptado para el wizard
 */
export interface DocumentProcessResultVelneo {
  documentId: string;
  nombreArchivo: string;
  estadoProcesamiento: string;
  timestamp: string;
  tiempoProcesamiento: number;
  porcentajeCompletitud: number;
  procesamientoExitoso: boolean;
  listoParaVelneo: boolean;
  
  // Datos completos estructurados
  datosVelneo: DatosVelneo;
  
  // Metadatos para el wizard
  nivelConfianza: number;
  requiereVerificacion: boolean;
}

// ================================
// TIPOS DE WIZARD Y CLIENTES
// ================================

/**
 * Cliente del sistema
 */
export interface Cliente {
  id: number;
  clinom: string;
  cliced?: string;
  cliruc?: string;
  telefono?: string;
  cliemail?: string;
  clidir?: string;
  activo: boolean;
}

/**
 * Compañía aseguradora
 */
export interface Company {
  id: number;
  comnom: string;
  comalias: string;
  cod_srvcompanias?: string;
  broker: boolean;
  activo: boolean;
}

/**
 * Pasos del wizard
 */
export type WizardStep = 'cliente' | 'company' | 'upload' | 'extract' | 'form' | 'success';

/**
 * Estado completo del wizard
 */
export interface WizardStateVelneo {
  currentStep: WizardStep;
  selectedCliente: Cliente | null;
  selectedCompany: Company | null;
  uploadedFile: File | null;
  extractedData: DocumentProcessResultVelneo | null;
  isComplete: boolean;
}

// ================================
// TIPOS DE RESPUESTA Y ERROR
// ================================

/**
 * Respuesta de error de Azure
 */
export interface AzureErrorResponseVelneo {
  error: string;
  archivo?: string;
  timestamp: string;
  tiempoProcesamiento: number;
  estado: string;
  codigoError?: string;
  detallesTecnicos?: string;
  sugerencias?: string[];
}

/**
 * Request para crear póliza en Velneo
 */
export interface PolizaCreateRequestVelneo {
  // IDs de relación
  clienteId: number;
  companiaId: number;
  
  // Datos de la póliza (estructura completa)
  datosPoliza: PolizaFormDataComplete;
  
  // Metadatos del procesamiento
  archivoOriginal: string;
  procesadoConIA: boolean;
  datosOriginales: DatosVelneo;
  porcentajeCompletitud: number;
  tiempoProcesamiento: number;
  
  // Observaciones finales
  observaciones?: string;
}

/**
 * Respuesta al crear póliza en Velneo
 */
export interface PolizaCreateResponseVelneo {
  id: number;
  numeroPoliza: string;
  estado: string;
  fechaCreacion: string;
  mensaje: string;
  procesamientoExitoso: boolean;
  errores?: string[];
}

// ================================
// UTILIDADES DE FORMATO
// ================================

/**
 * Utilidades para formateo de datos
 */
export interface FormatUtils {
  formatCurrency: (amount: number, currency?: string) => string;
  formatDate: (dateString: string) => string;
  formatPercentage: (value: number) => string;
  parseAmount: (amountString: string) => number;
}

/**
 * Configuración del validador de formulario
 */
export interface FormValidationConfig {
  requiredFields: (keyof PolizaFormDataComplete)[];
  minCompletionPercentage: number;
  validateOnChange: boolean;
  showValidationSummary: boolean;
}

/**
 * Resultado de validación del formulario
 */
export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
  completionPercentage: number;
  missingRequiredFields: string[];
}

// ================================
// EXPORTACIONES PARA COMPATIBILIDAD
// ================================

// Re-exportar tipos con nombres alternativos para compatibilidad
export type AzureVelneoResponse = AzureProcessResponseVelneo;
export type VelneoData = DatosVelneo;
export type VelneoFormData = PolizaFormDataComplete;
export type VelneoWizardResult = DocumentProcessResultVelneo;

// Constantes útiles
export const WIZARD_STEPS: WizardStep[] = ['cliente', 'company', 'upload', 'extract', 'form', 'success'];

export const MONEDAS = {
  UYU: { codigo: 1, simbolo: '$', nombre: 'Peso Uruguayo' },
  USD: { codigo: 2, simbolo: 'U$S', nombre: 'Dólar Americano' }
} as const;

export const TIPOS_CLIENTE = {
  PERSONA: 'PERSONA',
  EMPRESA: 'EMPRESA'
} as const;

export const TIPOS_USO_VEHICULO = {
  PARTICULAR: 'PARTICULAR',
  COMERCIAL: 'COMERCIAL',
  TAXI: 'TAXI',
  REMISE: 'REMISE'
} as const;

export const VALORES_TRAMITE = [
  'Nuevo',
  'Renovación', 
  'Cambio',
  'Endoso',
  'No Renueva',
  'Cancelación'
] as const;