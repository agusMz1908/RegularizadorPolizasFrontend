/**
 * src/utils/poliza-mappers.ts
 * Funciones de mapeo para pólizas (separadas de los tipos)
 */

import type { 
  PolizaCreateRequest, 
  PolizaFormData,
  EstadoPoliza,
  Tramite,
  FormaPago,
  EstadoGestion,
  MonedaId
} from '../types/core/poliza';

// ============================================================================
// 🔄 FUNCIÓN PRINCIPAL DE MAPEO
// ============================================================================

/**
 * Función principal para mapear datos del wizard a estructura Velneo
 * SINCRONIZADA CON EL BACKEND
 */
export function mapearWizardAVelneo(
  formData: PolizaFormData, 
  selectedData: {
    selectedCompany: { id: number };
    selectedSeccion: { id: number };
    selectedCliente: { id: number; clinom?: string; clidir?: string };
  }
): PolizaCreateRequest {
  console.log('🔄 Mapeando datos del wizard a Velneo:', { formData, selectedData });

  const request: PolizaCreateRequest = {
    // ✅ CAMPOS BÁSICOS REQUERIDOS
    comcod: Number(selectedData.selectedCompany?.id || 0),
    seccod: Number(selectedData.selectedSeccion?.id || 0),
    clinro: Number(selectedData.selectedCliente?.id || 0),
    conpol: formData.numeroPoliza || "",
    confchdes: formData.vigenciaDesde || "",
    confchhas: formData.vigenciaHasta || "",
    conpremio: Number(formData.prima || 0),
    asegurado: formData.asegurado || selectedData.selectedCliente?.clinom || "",

    // ✅ MAPEAR CAMPOS DEL WIZARD A ESTRUCTURA VELNEO
    contra: mapearTramite(formData.tramite),
    congesti: "1", // Tipo gestión por defecto
    congeses: mapearEstadoGestion(formData.estadoPoliza),
    convig: mapearEstadoPoliza(formData.estadoPoliza),
    consta: mapearFormaPago(formData.formaPago),

    // ✅ DATOS DEL VEHÍCULO
    conmaraut: combinarMarcaModelo(formData.marca, formData.modelo) || formData.vehiculo || "",
    conanioaut: Number(formData.anio) || new Date().getFullYear(),
    conmataut: formData.matricula || "",
    conmotor: formData.motor || "",
    conchasis: formData.chasis || "",

    // ✅ COMERCIALES
    contot: Number(formData.premioTotal || formData.prima || 0),
    concuo: Number(formData.cantidadCuotas || 1),
    moncod: mapearMoneda(formData.moneda),
    ramo: "AUTOMOVILES",

    // ✅ CLASIFICACIONES
    catdsc: formData.categoriaId ? Number(formData.categoriaId) : undefined,
    desdsc: formData.destinoId ? Number(formData.destinoId) : undefined,
    caldsc: formData.calidadId ? Number(formData.calidadId) : undefined,

    // ✅ CLIENTE
    condom: formData.direccion || selectedData.selectedCliente?.clidir || "",
    clinom: formData.asegurado || selectedData.selectedCliente?.clinom || "",

    // ✅ COBERTURA
    tposegdsc: formData.cobertura || "",
    concar: formData.certificado || "0",
    conend: formData.certificado || "0",

    // ✅ DATOS ADICIONALES
    observaciones: formData.observaciones || "",
    procesadoConIA: false,

    // ✅ MANTENER CAMPOS LEGACY PARA COMPATIBILIDAD
    vehiculo: formData.vehiculo,
    marca: formData.marca,
    modelo: formData.modelo,
    motor: formData.motor,
    chasis: formData.chasis,
    matricula: formData.matricula,
    combustible: formData.combustible,
    anio: formData.anio ? Number(formData.anio) : undefined,
    premioTotal: formData.premioTotal ? Number(formData.premioTotal) : undefined,
    direccion: formData.direccion,
    moneda: formData.moneda,
    seccionId: Number(selectedData.selectedSeccion?.id || 0),
    tramite: formData.tramite,
    estadoPoliza: formData.estadoPoliza,
    formaPago: formData.formaPago,
    cantidadCuotas: formData.cantidadCuotas ? Number(formData.cantidadCuotas) : undefined,
    cobertura: formData.cobertura,
    certificado: formData.certificado
  };

  console.log('✅ Request mapeado:', request);
  return request;
}

// ============================================================================
// 🗺️ FUNCIONES DE MAPEO ESPECÍFICAS
// ============================================================================

/**
 * Mapear trámite a valores Velneo
 */
export function mapearTramite(tramite?: string): string {
  const mapping: Record<string, string> = {
    'NUEVO': 'Nuevo',
    'RENOVACION': 'Renovacion',
    'RENOVACIÓN': 'Renovacion',
    'ENDOSO': 'Endoso',
    'ANULACION': 'Cancelacion',
    'ANULACIÓN': 'Cancelacion',
    'CAMBIO': 'Cambio'
  };
  return mapping[tramite?.toUpperCase() || ''] || 'Nuevo';
}

/**
 * Mapear estado de póliza a valores Velneo
 */
export function mapearEstadoPoliza(estado?: string): string {
  const mapping: Record<string, string> = {
    'VIGENTE': 'VIG',
    'VENCIDA': 'VEN',
    'VENCIDO': 'VEN',
    'ENDOSADA': 'END',
    'ENDOSADO': 'END',
    'CANCELADA': 'CAN',
    'CANCELADO': 'CAN',
    'ANULADA': 'CAN',
    'ANULADO': 'CAN',
    'ANTECEDENTE': 'ANT'
  };
  return mapping[estado?.toUpperCase() || ''] || 'VIG';
}

/**
 * Mapear estado de gestión a valores Velneo
 */
export function mapearEstadoGestion(estado?: string): string {
  const mapping: Record<string, string> = {
    'PENDIENTE': '1',
    'PENDIENTE C/PLAZO': '2',
    'PENDIENTE S/PLAZO': '3',
    'TERMINADO': '4',
    'EN PROCESO': '5',
    'MODIFICACIONES': '6',
    'EN EMISIÓN': '7',
    'ENVIADO A CIA': '8',
    'ENVIADO A AGENTE MAIL': '9',
    'DEVUELTO A EJECUTIVO': '10',
    'DECLINADO': '11'
  };
  return mapping[estado?.toUpperCase() || ''] || '1';
}

/**
 * Mapear forma de pago a valores Velneo
 */
export function mapearFormaPago(formaPago?: string): string {
  const mapping: Record<string, string> = {
    'CONTADO': '1',
    'TARJETA': '2',
    'TARJETA DE CREDITO': '2',
    'TARJETA DE CRÉDITO': '2',
    'DEBITO': '3',
    'DEBITO AUTOMATICO': '3',
    'DÉBITO AUTOMÁTICO': '3',
    'CUOTAS': '4'
  };
  return mapping[formaPago?.toUpperCase() || ''] || '1';
}

/**
 * Mapear moneda a código numérico Velneo
 */
export function mapearMoneda(moneda?: string): number {
  const mapping: Record<string, number> = {
    'UYU': 1,
    'USD': 2,
    'UI': 3
  };
  return mapping[moneda?.toUpperCase() || ''] || 1;
}

// ============================================================================
// 🔧 FUNCIONES AUXILIARES
// ============================================================================

/**
 * Combinar marca y modelo en un solo campo
 */
function combinarMarcaModelo(marca?: string, modelo?: string): string {
  if (marca && modelo) {
    return `${marca} ${modelo}`.trim();
  }
  return marca || "";
}

/**
 * Mapear código de moneda a string
 */
export function mapearCodigoMonedaAString(codigo: number): string {
  const mapping: Record<number, string> = {
    1: 'UYU',
    2: 'USD',
    3: 'UI'
  };
  return mapping[codigo] || 'UYU';
}

/**
 * Mapear código de forma de pago a string
 */
export function mapearCodigoFormaPagoAString(codigo: string): string {
  const mapping: Record<string, string> = {
    '1': 'Contado',
    '2': 'Tarjeta',
    '3': 'Débito Automático',
    '4': 'Cuotas'
  };
  return mapping[codigo] || 'Contado';
}

/**
 * Mapear estado de póliza a string legible
 */
export function mapearEstadoPolizaAString(estado: string): string {
  const mapping: Record<string, string> = {
    'VIG': 'Vigente',
    'VEN': 'Vencida',
    'END': 'Endosada',
    'CAN': 'Cancelada',
    'ANT': 'Antecedente'
  };
  return mapping[estado] || estado;
}

/**
 * Mapear trámite a string legible
 */
export function mapearTramiteAString(tramite: string): string {
  const mapping: Record<string, string> = {
    'Nuevo': 'Póliza nueva',
    'Renovacion': 'Renovación',
    'Cambio': 'Modificación',
    'Endoso': 'Endoso',
    'Cancelacion': 'Cancelación'
  };
  return mapping[tramite] || tramite;
}

// ============================================================================
// 📊 FUNCIONES DE CONVERSIÓN PARA UI
// ============================================================================

/**
 * Convertir PolizaDto a formato para mostrar en UI
 */
export function convertirPolizaParaUI(poliza: any) {
  return {
    id: poliza.id,
    numeroPoliza: poliza.conpol,
    cliente: poliza.clinom,
    asegurado: poliza.clinom,
    vehiculo: poliza.conmaraut,
    matricula: poliza.conmataut,
    anio: poliza.conanioaut,
    premio: poliza.conpremio,
    total: poliza.contot,
    moneda: mapearCodigoMonedaAString(poliza.moncod),
    estado: mapearEstadoPolizaAString(poliza.convig),
    tramite: mapearTramiteAString(poliza.contra),
    formaPago: mapearCodigoFormaPagoAString(poliza.consta),
    vigenciaDesde: poliza.confchdes,
    vigenciaHasta: poliza.confchhas,
    fechaCreacion: poliza.fechaCreacion,
    procesado: poliza.procesado
  };
}

/**
 * Generar resumen de póliza para cards/listas
 */
export function generarResumenPoliza(poliza: any) {
  return {
    titulo: poliza.conpol,
    subtitulo: poliza.clinom,
    descripcion: `${poliza.conmaraut} ${poliza.conanioaut || ''}`.trim(),
    monto: `${poliza.conpremio} ${mapearCodigoMonedaAString(poliza.moncod)}`,
    estado: mapearEstadoPolizaAString(poliza.convig),
    fechaVencimiento: poliza.confchhas,
    procesadoConIA: poliza.procesado
  };
}