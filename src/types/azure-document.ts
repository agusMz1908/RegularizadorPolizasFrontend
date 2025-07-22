export interface AzureProcessResponse {
  archivo: string;
  timestamp: string;
  tiempoProcesamiento: number;
  estado: string; // "PROCESADO_CON_SMART_EXTRACTION"
  datosVelneo: DatosVelneo;
  procesamientoExitoso: boolean;
  listoParaVelneo: boolean;
  porcentajeCompletitud: number;
}

// ================================
// ESTRUCTURA PRINCIPAL ORGANIZADA
// ================================

export interface DatosVelneo {
  datosBasicos: DatosBasicos;
  datosPoliza: DatosPoliza;
  datosVehiculo: DatosVehiculo;
  datosCobertura: DatosCobertura;
  condicionesPago: CondicionesPago;
  bonificaciones: Bonificaciones;
  observaciones: Observaciones;
  metricas: MetricasExtraccion;
  tieneDatosMinimos: boolean;
  porcentajeCompletitud: number;
  camposCompletos: number;
}

// ================================
// SECCIONES ESPECÍFICAS
// ================================

// 👤 DATOS BÁSICOS DEL CLIENTE
export interface DatosBasicos {
  corredor: string;
  asegurado: string;
  estado: string;
  domicilio: string;
  tramite: string;
  fecha: string;
  asignado: string;
  tipo: string; // "EMPRESA" | "PERSONA"
  telefono: string;
  email: string;
  documento: string;
  departamento: string;
  localidad: string;
  codigoPostal: string;
}

// 📋 DATOS DE LA PÓLIZA
export interface DatosPoliza {
  compania: string;
  desde: string;
  hasta: string;
  numeroPoliza: string;
  certificado: string;
  endoso: string;
  tipoMovimiento: string;
  ramo: string;
}

// 🚗 DATOS DEL VEHÍCULO
export interface DatosVehiculo {
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
}

// 🛡️ DATOS DE COBERTURA
export interface DatosCobertura {
  cobertura: string;
  zonaCirculacion: string;
  moneda: string;
  codigoMoneda: number;
}

// 💰 CONDICIONES DE PAGO
export interface CondicionesPago {
  formaPago: string;
  premio: number;
  total: number;
  valorCuota: number;
  cuotas: number;
  moneda: string;
  detalleCuotas: DetalleCuotas;
}

// 📅 DETALLE DE CUOTAS
export interface DetalleCuotas {
  cantidadTotal: number;
  cuotas: Cuota[];
  primeraCuota: Cuota;
  montoPromedio: number;
  tieneCuotasDetalladas: boolean;
  primerVencimiento: string;
  primaCuota: number;
}

export interface Cuota {
  numero: number;
  fechaVencimiento: string;
  monto: number;
  estado: string; // "PENDIENTE" | "PAGADA" | "VENCIDA"
}

// 🎁 BONIFICACIONES Y DESCUENTOS
export interface Bonificaciones {
  bonificaciones: any[];
  totalBonificaciones: number;
  descuentos: number;
  recargos: number;
  impuestoMSP: number;
}

// 📝 OBSERVACIONES
export interface Observaciones {
  observacionesGenerales: string;
  observacionesGestion: string;
  notasEscaneado: string[];
  informacionAdicional: string;
}

// 📊 MÉTRICAS DE EXTRACCIÓN
export interface MetricasExtraccion {
  camposExtraidos: number;
  camposCompletos: number;
  porcentajeCompletitud: number;
  tieneDatosMinimos: boolean;
  camposFaltantes: string[];
  camposConfianzaBaja: string[];
}

// ================================
// RESULTADO PROCESADO PARA EL WIZARD
// ================================

export interface DocumentProcessResult {
  documentId: string;
  nombreArchivo: string;
  estadoProcesamiento: string;
  timestamp: string;
  tiempoProcesamiento: number;
  
  // ✅ CAMPOS PRINCIPALES EXTRAÍDOS
  numeroPoliza: string;
  asegurado: string;
  corredor: string;
  compania: string;
  
  // ✅ VIGENCIA
  vigenciaDesde: string;
  vigenciaHasta: string;
  
  // ✅ DATOS FINANCIEROS
  premio: number;
  total: number;
  moneda: string;
  formaPago: string;
  
  // ✅ VEHÍCULO
  vehiculo: string;
  marca: string;
  modelo: string;
  anio: string;
  motor: string;
  chasis: string;
  matricula: string;
  combustible: string;
  
  // ✅ CLIENTE
  documento: string;
  email: string;
  telefono: string;
  domicilio: string;
  departamento: string;
  localidad: string;
  
  // ✅ METADATOS
  procesamientoExitoso: boolean;
  listoParaVelneo: boolean;
  porcentajeCompletitud: number;
  nivelConfianza: number;
  requiereVerificacion: boolean;
  
  // ✅ DATOS COMPLETOS PARA FORMULARIO AVANZADO
  datosVelneo: DatosVelneo;
}

// ================================
// TIPOS AUXILIARES
// ================================

// ✅ ENUM PARA TIPOS DE CLIENTE
export enum TipoCliente {
  PERSONA = 'PERSONA',
  EMPRESA = 'EMPRESA'
}

// ✅ ENUM PARA ESTADOS DE CUOTA
export enum EstadoCuota {
  PENDIENTE = 'PENDIENTE',
  PAGADA = 'PAGADA',
  VENCIDA = 'VENCIDA'
}

// ✅ FORMULARIO EXTENDIDO PARA LA UI
export interface PolizaFormDataExtended {
  // Básicos
  numeroPoliza: string;
  asegurado: string;
  documento: string;
  email: string;
  telefono: string;
  domicilio: string;
  
  // Póliza
  compania: string;
  ramo: string;
  vigenciaDesde: string;
  vigenciaHasta: string;
  corredor: string;
  
  // Vehículo
  marca: string;
  modelo: string;
  anio: string;
  motor: string;
  chasis: string;
  matricula: string;
  combustible: string;
  uso: string;
  
  // Financiero
  premio: number;
  total: number;
  moneda: string;
  formaPago: string;
  cuotas: number;
  
  // Observaciones
  observacionesGenerales: string;
  observacionesGestion: string;
  
  // Metadatos
  tiempoProcesamiento: number;
  porcentajeCompletitud: number;
}

// ================================
// COMPATIBILIDAD CON TIPOS ANTERIORES
// ================================

// Mantener compatibilidad con código existente
export interface AzureDatosFormateados extends DatosVelneo {} // DEPRECATED
export interface ExtractedField {
  field: string;
  value: string;
  confidence: number;
  needsReview: boolean;
}

// Tipos de error
export interface AzureErrorResponse {
  error: string;
  timestamp: string;
  tiempoProcesamiento: number;
  estado: string;
  codigoError?: string;
  detallesTecnicos?: string;
  sugerencias?: string[];
}

// Respuesta de información del modelo
export interface AzureModelInfoResponse {
  modelId: string;
  description: string;
  createdDateTime: string;
  lastUpdatedDateTime: string;
  status: string;
}

// Respuesta de batch (si se necesita)
export interface AzureBatchResponse {
  archivos: string[];
  procesamientosExitosos: number;
  procesamientosFallidos: number;
  tiempoTotal: number;
  resultados: DocumentProcessResult[];
}

// ================================
// CONSTANTES ÚTILES
// ================================

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