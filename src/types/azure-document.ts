export interface AzureDocumentRequest {
  file: File;
}

export interface AzureDatosFormateados {
  numeroPoliza: string;
  asegurado: string;
  documento: string;
  vehiculo: string;
  marca: string;
  modelo: string;
  matricula: string;
  motor: string;
  chasis: string;
  primaComercial: number;
  premioTotal: number;
  vigenciaDesde: string | null;
  vigenciaHasta: string | null;
  corredor: string;
  plan: string;
  ramo: string;
  anio: string;
  email: string;
  direccion: string;
  departamento: string;
  localidad: string;
  compania: string;
  telefono: number;
  // Propiedades calculadas del backend
  tieneDatosMinimos?: boolean;
  camposCompletos?: number;
}

export interface AzureClienteInfo {
  id: number | null;
  nombre: string;
  documento: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  // Propiedades calculadas del backend
  tieneContacto?: boolean;
  contactoPrincipal?: string;
}

export interface AzureClienteMatch {
  cliente: AzureClienteInfo;
  score: number;
  criterio: string;
  coincidencias: string[];
  // Propiedades calculadas del backend
  esAltaConfianza?: boolean;
  esMediaConfianza?: boolean;
  esBajaConfianza?: boolean;
  nivelConfianza?: string;
}

export interface AzureBusquedaCliente {
  tipoResultado: 'MatchExacto' | 'MatchMuyProbable' | 'MultiplesMatches' | 'SinCoincidencias';
  mensaje: string;
  requiereIntervencion: boolean;
  clientesEncontrados: number;
  matches: AzureClienteMatch[];
  // Propiedades calculadas del backend
  tieneMatches?: boolean;
  esMatchExacto?: boolean;
  sonMultiplesMatches?: boolean;
  mejorMatch?: AzureClienteMatch;
}

export interface AzureResumen {
  procesamientoExitoso: boolean;
  numeroPolizaExtraido: string;
  clienteExtraido: string;
  documentoExtraido: string;
  vehiculoExtraido: string;
  clienteEncontrado: boolean;
  listoParaVelneo: boolean;
  // Propiedades calculadas del backend
  estadoGeneral?: string;
  porcentajeCompletitud?: number;
}

export interface AzureProcessResponse {
  archivo: string;
  timestamp: string;
  tiempoProcesamiento: number;
  estado: string;
  datosFormateados: AzureDatosFormateados;
  busquedaCliente: AzureBusquedaCliente;
  siguientePaso: string;
  resumen: AzureResumen;
  // Propiedades calculadas del backend
  procesamientoExitoso?: boolean;
  requiereIntervencion?: boolean;
  listoParaVelneo?: boolean;
}

export interface AzureBatchError {
  archivo: string;
  error: string;
  timestamp: string;
  codigoError?: string;
  detallesTecnicos?: string;
  // Propiedades calculadas del backend
  esErrorDeArchivo?: boolean;
  esErrorDeRed?: boolean;
  esErrorDeAzure?: boolean;
}

export interface AzureBatchEstadisticas {
  totalProcesados: number;
  totalErrores: number;
  porcentajeExito: number;
  clientesEncontrados: number;
  listosParaVelneo: number;
  requierenIntervencion: number;
  resumenTexto?: string;
}

export interface AzureBatchResponse {
  procesados: number;
  errores: number;
  totalArchivos: number;
  resultados: AzureProcessResponse[];
  erroresDetalle: AzureBatchError[];
  fechaProcesamiento: string;
  tiempoTotalProcesamiento: number;
  // Propiedades calculadas del backend
  porcentajeExito?: number;
  todosExitosos?: boolean;
  algunosExitosos?: boolean;
  tiempoPromedioPorArchivo?: number;
  estadisticas?: AzureBatchEstadisticas;
}

export interface AzureModelHealth {
  estaOperativo: boolean;
  tieneConexion: boolean;
  ultimaVerificacion: string;
  mensaje: string;
  nivel: 'success' | 'warning' | 'error' | 'info';
  iconoEstado?: string;
  mensajeCompleto?: string;
}

export interface AzureModelInfoResponse {
  modelId: string;
  endpoint: string;
  status: string;
  workingApiUrl?: string;
  httpStatus?: string;
  description?: string;
  createdOn?: string;
  docTypes?: string[];
  apiVersion?: string;
  warning?: string;
  message?: string;
  consultaTimestamp: string;
  // Propiedades calculadas del backend
  estaActivo?: boolean;
  tieneAdvertencias?: boolean;
  estadoSimplificado?: string;
  health?: AzureModelHealth;
}

export interface AzureErrorResponse {
  error: string;
  archivo?: string;
  timestamp: string;
  tiempoProcesamiento: number;
  estado: string;
  codigoError?: string;
  detallesTecnicos?: string;
  sugerencias?: string[];
}

export interface DatosClienteExtraidos {
  nombre: string;
  documento: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  localidad?: string;
  departamento?: string;
  confidenceScore?: number;
}