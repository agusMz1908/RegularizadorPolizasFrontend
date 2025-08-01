// src/types/azureDocumentResult.ts - Actualizado con la estructura real
export interface AzureProcessResponse {
  archivo: string;
  timestamp: string;
  tiempoProcesamiento: number;
  estado: string;
  datosVelneo: AzureDatosPolizaVelneoDto;
  procesamientoExitoso: boolean;
  listoParaVelneo: boolean;
  porcentajeCompletitud: number;
}

export interface AzureDatosPolizaVelneoDto {
  datosBasicos: AzureDatosBasicosDto;
  datosPoliza: AzureDatosPolizaDto;
  datosVehiculo: AzureDatosVehiculoDto;
  datosCobertura: AzureDatosCoberturaDto;
  condicionesPago: AzureCondicionesPagoDto;
  bonificaciones: AzureBonificacionesDto;
  observaciones: AzureObservacionesDto;
  metricas: AzureMetricasDto;
  tieneDatosMinimos: boolean;
  porcentajeCompletitud: number;
  camposCompletos: number;
}

export interface AzureDatosBasicosDto {
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
}

export interface AzureDatosPolizaDto {
  compania: string;
  desde: string;
  hasta: string;
  numeroPoliza: string;
  certificado: string;
  endoso: string;
  tipoMovimiento: string;
  ramo: string;
}

export interface AzureDatosVehiculoDto {
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

export interface AzureDatosCoberturaDto {
  cobertura: string;
  zonaCirculacion: string;
  moneda: string;
  codigoMoneda: number;
}

export interface AzureCondicionesPagoDto {
  formaPago: string;
  premio: number;
  total: number;
  valorCuota: number;
  cuotas: number;
  moneda: string;
  detalleCuotas: AzureDetalleCuotasDto;
}

export interface AzureDetalleCuotasDto {
  cantidadTotal: number;
  cuotas: AzureDetalleCuotaDto[];
  primeraCuota: AzureDetalleCuotaDto;
  montoPromedio: number;
  tieneCuotasDetalladas: boolean;
  primerVencimiento: string;
  primaCuota: number;
}

export interface AzureDetalleCuotaDto {
  numero: number;
  fechaVencimiento: string;
  monto: number;
  estado: string;
}

export interface AzureBonificacionesDto {
  bonificaciones: any[];
  totalBonificaciones: number;
  descuentos: number;
  recargos: number;
  impuestoMSP: number;
}

export interface AzureObservacionesDto {
  observacionesGenerales: string;
  observacionesGestion: string;
  notasEscaneado: string[];
  informacionAdicional: string;
}

export interface AzureMetricasDto {
  camposExtraidos: number;
  camposCompletos: number;
  porcentajeCompletitud: number;
  tieneDatosMinimos: boolean;
  camposFaltantes: string[];
  camposConfianzaBaja: string[];
}

// Tipo legacy para compatibilidad hacia atrás
export interface AzureDocumentResult {
  archivo: string;
  timestamp: string;
  tiempoProcesamiento: number;
  estado: string;
  campos: Record<string, string>;
  confianza?: number;
  errores?: string[];
}