// src/utils/velneoMapper.ts
// 🎯 MAPPER COMPLETO PARA CAMPOS ESTÁTICOS DE VELNEO

import { 
  VelneoTramite, 
  VelneoEstadoPoliza, 
  VelneoFormaPago, 
  VelneoMoneda,
  VelneoStaticFields,
  VelneoMappingInput,
  VelneoMappingResult,
  VelneoMappingInfo,
  VelneoEstadoGestion
} from '../types/velneo';

// ====================================================================
// 🔹 DICCIONARIOS DE MAPEO
// ====================================================================

// 📋 TRAMITE - Campo CONTRA (Estática: TRAMITE@Seguros)
const TRAMITE_MAPPING: Record<string, VelneoTramite> = {
  // Mapeo desde Azure/texto libre hacia valores Velneo
  'EMISION': 'Nuevo',
  'NUEVA': 'Nuevo', 
  'ALTA': 'Nuevo',
  'NUEVO': 'Nuevo',
  'EMISIÓN': 'Nuevo',
  
  'RENOVACION': 'Renovacion',
  'RENOV': 'Renovacion',
  'RENOVACIÓN': 'Renovacion',
  'RENOVAR': 'Renovacion',
  
  'MODIFICACION': 'Cambio',
  'CAMBIO': 'Cambio',
  'MODIF': 'Cambio',
  
  'ENDOSO': 'Endoso',
  'ENDOSAR': 'Endoso',
  
  'NO RENUEVA': 'No Renueva',
  'NO_RENUEVA': 'No Renueva',
  'SIN_RENOVACION': 'No Renueva',
  
  'ANULACION': 'Cancelacion',
  'BAJA': 'Cancelacion', 
  'CANCELACION': 'Cancelacion',
  'CANCELACIÓN': 'Cancelacion',
  'ANULAR': 'Cancelacion'
};

// 📊 ESTADO DE GESTIÓN - Campo CONGESES (Estática: ESTADO_GESTION@Seguros)
const ESTADO_GESTION_MAPPING: Record<string, string> = {
  'PENDIENTE': '1',
  'PENDIENTE_CPLAZO': '2',
  'PENDIENTE_C_PLAZO': '2', 
  'PENDIENTE_SPLAZO': '3',
  'PENDIENTE_S_PLAZO': '3',
  'TERMINADO': '4',
  'EN_PROCESO': '5',
  'EN PROCESO': '5',
  'PROCESANDO': '5',
  'MODIFICACIONES': '6',
  'EN_EMISION': '7',
  'EN EMISION': '7',
  'ENVIADO_A_CIA': '8',
  'ENVIADO A CIA': '8',
  'ENVIADO_A_AGENTE_MAIL': '9',
  'ENVIADO A AGENTE MAIL': '9',
  'DEVUELTO_A_EJECUTIVO': '10',
  'DEVUELTO A EJECUTIVO': '10',
  'DECLINADO': '11'
};

// ✅ ESTADO PÓLIZA - Campo CONVIG (Estática: ESTADO@Seguros)
const ESTADO_POLIZA_MAPPING: Record<string, VelneoEstadoPoliza> = {
  'VIGENTE': 'VIG',
  'VIG': 'VIG',
  'ACTIVA': 'VIG',
  'ACTIVO': 'VIG',
  
  'VENCIDA': 'VEN', 
  'VENCIDO': 'VEN',
  'VEN': 'VEN',
  'EXPIRADA': 'VEN',
  
  'ENDOSADA': 'END',
  'ENDOSO': 'END', 
  'END': 'END',
  'MODIFICADA': 'END',
  
  'CANCELADA': 'CAN',
  'ANULADA': 'CAN',
  'CAN': 'CAN',
  'BAJA': 'CAN',
  
  'ANTECEDENTE': 'ANT',
  'ANT': 'ANT',
  'ANTERIOR': 'ANT',
  'PREVIA': 'ANT'
};

// 💳 FORMA DE PAGO - Campo CONSTA (Estática: FORMA_PAGO@Seguros)
const FORMA_PAGO_MAPPING: Record<string, VelneoFormaPago> = {
  'EFECTIVO': 'Efectivo',
  'CASH': 'Efectivo',
  'CONTADO': 'Efectivo',
  
  'TARJETA': 'Tarjeta Cred.',
  'TARJETA_CREDITO': 'Tarjeta Cred.',
  'TARJETA_DE_CREDITO': 'Tarjeta Cred.',
  'TARJETA DE CREDITO': 'Tarjeta Cred.',
  'CREDIT_CARD': 'Tarjeta Cred.',
  'TC': 'Tarjeta Cred.',
  
  'DEBITO': 'Débito Banc.',
  'DEBITO_BANCARIO': 'Débito Banc.',
  'DÉBITO BANCARIO': 'Débito Banc.',
  'DEBIT': 'Débito Banc.',
  'DB': 'Débito Banc.',
  
  'COBRADOR': 'Cobrador',
  'CONFORME': 'Conforme',
  
  'CHEQUE': 'Cheque directo',
  'CHEQUE_DIRECTO': 'Cheque directo',
  'CHECK': 'Cheque directo',
  
  'TRANSFERENCIA': 'Transferencia bancaria',
  'TRANSFERENCIA_BANCARIA': 'Transferencia bancaria',
  'TRANSFERENCIA BANCARIA': 'Transferencia bancaria',
  'WIRE_TRANSFER': 'Transferencia bancaria',
  'TRANSFER': 'Transferencia bancaria',
  
  'PASS_CARD': 'Pass Card',
  'PASSCARD': 'Pass Card',
  'PASS CARD': 'Pass Card'
};

// 💰 MONEDA - Campo MONCOD (Maestro: MONEDAS@Seguros)
const MONEDA_MAPPING: Record<string, VelneoMoneda> = {
  'USD': 'DOL',
  'DOLLAR': 'DOL', 
  'DOLARES': 'DOL',
  'DÓLARES': 'DOL',
  'US': 'DOL',
  'DOL': 'DOL',
  '$': 'DOL',
  
  'EUR': 'EU',
  'EURO': 'EU',
  'EUROS': 'EU',
  'EU': 'EU',
  '€': 'EU',
  
  'UYU': 'PES',
  'PESOS': 'PES', 
  'PESO_URUGUAYO': 'PES',
  'PESO URUGUAYO': 'PES',
  'PES': 'PES',
  '$U': 'PES',
  
  'BRL': 'RS',
  'REAL': 'RS',
  'REALES': 'RS', 
  'RS': 'RS',
  'R$': 'RS',
  
  'UF': 'UF',
  'UNIDAD_FOMENTO': 'UF',
  'UNIDAD DE FOMENTO': 'UF'
};

// ====================================================================
// 🔹 CLASE PRINCIPAL DE MAPEO
// ====================================================================

export class VelneoMapper {
  
  /**
   * Mapea texto libre hacia valor válido de Trámite
   */
  static mapearTramite(textoLibre: string): { valor: VelneoTramite; metodo: string; confianza: number } {
    if (!textoLibre) {
      return { valor: 'Nuevo', metodo: 'default_fallback', confianza: 0.3 };
    }
    
    const textoLimpio = textoLibre.trim().toUpperCase();
    
    // Buscar coincidencia exacta primero
    if (TRAMITE_MAPPING[textoLimpio]) {
      return { 
        valor: TRAMITE_MAPPING[textoLimpio], 
        metodo: 'exact_match', 
        confianza: 1.0 
      };
    }
    
    // Buscar por palabras clave
    for (const [key, value] of Object.entries(TRAMITE_MAPPING)) {
      if (textoLimpio.includes(key)) {
        return { 
          valor: value, 
          metodo: 'keyword_search', 
          confianza: 0.8 
        };
      }
    }
    
    return { valor: 'Nuevo', metodo: 'default_fallback', confianza: 0.3 };
  }
  
  /**
   * Mapea texto libre hacia valor válido de Estado de Gestión
   */
static mapearEstadoGestion(textoLibre: string): { valor: VelneoEstadoGestion; metodo: string; confianza: number } {
  if (!textoLibre) {
    return { valor: '5', metodo: 'default_fallback', confianza: 0.3 }; // En proceso
  }
  
  const textoLimpio = textoLibre.trim().toUpperCase();
  
  if (ESTADO_GESTION_MAPPING[textoLimpio]) {
    return { 
      valor: ESTADO_GESTION_MAPPING[textoLimpio] as VelneoEstadoGestion, 
      metodo: 'exact_match', 
      confianza: 1.0 
    };
  }
  
  return { valor: '5', metodo: 'default_fallback', confianza: 0.3 };
}
  
  /**
   * Mapea texto libre hacia valor válido de Estado Póliza
   */
static mapearEstadoPoliza(
  textoLibre: string, 
  fechaVencimiento?: string | Date, // ✅ CAMBIAR TIPO AQUÍ
  operacion?: string
): { valor: VelneoEstadoPoliza; metodo: string; confianza: number } {
  
  // Lógica automática basada en fechas/operación si no hay texto
  if (!textoLibre) {
    if (fechaVencimiento) {
      // ✅ MANEJAR AMBOS TIPOS:
      const fecha = typeof fechaVencimiento === 'string' 
        ? new Date(fechaVencimiento) 
        : fechaVencimiento;
        
      if (new Date() > fecha) {
        return { valor: 'VEN', metodo: 'date_logic', confianza: 0.9 };
      }
    }
    if (operacion?.toUpperCase().includes('ENDOSO')) {
      return { valor: 'END', metodo: 'operation_logic', confianza: 0.9 };
    }
    return { valor: 'VIG', metodo: 'default_fallback', confianza: 0.7 };
  }
  
  const textoLimpio = textoLibre.trim().toUpperCase();
  
  if (ESTADO_POLIZA_MAPPING[textoLimpio]) {
    return { 
      valor: ESTADO_POLIZA_MAPPING[textoLimpio], 
      metodo: 'exact_match', 
      confianza: 1.0 
    };
  }
  
  return { valor: 'VIG', metodo: 'default_fallback', confianza: 0.7 };
}
  
  /**
   * Mapea texto libre hacia valor válido de Forma de Pago
   */
  static mapearFormaPago(textoLibre: string): { valor: VelneoFormaPago; metodo: string; confianza: number } {
    if (!textoLibre) {
      return { valor: 'Efectivo', metodo: 'default_fallback', confianza: 0.3 };
    }
    
    const textoLimpio = textoLibre.trim().toUpperCase();
    
    // Buscar coincidencia exacta
    if (FORMA_PAGO_MAPPING[textoLimpio]) {
      return { 
        valor: FORMA_PAGO_MAPPING[textoLimpio], 
        metodo: 'exact_match', 
        confianza: 1.0 
      };
    }
    
    // Buscar por palabras clave
    for (const [key, value] of Object.entries(FORMA_PAGO_MAPPING)) {
      if (textoLimpio.includes(key)) {
        return { 
          valor: value, 
          metodo: 'keyword_search', 
          confianza: 0.8 
        };
      }
    }
    
    return { valor: 'Efectivo', metodo: 'default_fallback', confianza: 0.3 };
  }
  
  /**
   * Mapea texto libre hacia valor válido de Moneda
   */
  static mapearMoneda(textoLibre: string): { valor: VelneoMoneda; metodo: string; confianza: number } {
    if (!textoLibre) {
      return { valor: 'PES', metodo: 'default_fallback', confianza: 0.3 }; // Pesos uruguayos
    }
    
    const textoLimpio = textoLibre.trim().toUpperCase();
    
    if (MONEDA_MAPPING[textoLimpio]) {
      return { 
        valor: MONEDA_MAPPING[textoLimpio], 
        metodo: 'exact_match', 
        confianza: 1.0 
      };
    }
    
    return { valor: 'PES', metodo: 'default_fallback', confianza: 0.3 };
  }
  
  /**
   * Función principal que mapea todos los campos de una vez
   */
  static mapearCamposCompletos(input: VelneoMappingInput): VelneoMappingResult {
    const tramiteResult = this.mapearTramite(input.tramiteTexto || '');
    const estadoGestionResult = this.mapearEstadoGestion(input.estadoTexto || '');
    const estadoPolizaResult = this.mapearEstadoPoliza(
      input.estadoPolizaTexto || '',
      input.fechaVencimiento,
      input.operacion
    );
    const formaPagoResult = this.mapearFormaPago(input.formaPagoTexto || '');
    const monedaResult = this.mapearMoneda(input.monedaTexto || '');
    
    // Generar warnings para campos con baja confianza
    const warnings: string[] = [];
    if (tramiteResult.confianza < 0.7) {
      warnings.push(`Trámite mapeado con baja confianza: "${input.tramiteTexto}" → "${tramiteResult.valor}"`);
    }
    if (estadoPolizaResult.confianza < 0.7) {
      warnings.push(`Estado póliza mapeado con baja confianza: "${input.estadoPolizaTexto}" → "${estadoPolizaResult.valor}"`);
    }
    if (formaPagoResult.confianza < 0.7) {
      warnings.push(`Forma pago mapeada con baja confianza: "${input.formaPagoTexto}" → "${formaPagoResult.valor}"`);
    }
    if (monedaResult.confianza < 0.7) {
      warnings.push(`Moneda mapeada con baja confianza: "${input.monedaTexto}" → "${monedaResult.valor}"`);
    }
    
    return {
      campos: {
        tramite: tramiteResult.valor,
        estadoGestion: estadoGestionResult.valor,
        estadoPoliza: estadoPolizaResult.valor,
        formaPago: formaPagoResult.valor,
        moneda: monedaResult.valor
      },
      warnings,
      mapping: {
        tramite: {
          original: input.tramiteTexto || '',
          mapeado: tramiteResult.valor,
          metodo: tramiteResult.metodo
        },
        estadoGestion: {
          original: input.estadoTexto || '',
          mapeado: estadoGestionResult.valor,
          metodo: estadoGestionResult.metodo
        },
        estadoPoliza: {
          original: input.estadoPolizaTexto || '',
          mapeado: estadoPolizaResult.valor,
          metodo: estadoPolizaResult.metodo
        },
        formaPago: {
          original: input.formaPagoTexto || '',
          mapeado: formaPagoResult.valor,
          metodo: formaPagoResult.metodo
        },
        moneda: {
          original: input.monedaTexto || '',
          mapeado: monedaResult.valor,
          metodo: monedaResult.metodo
        }
      }
    };
  }
}

// ====================================================================
// 🔹 FUNCIONES DE UTILIDAD
// ====================================================================

/**
 * Valida que un valor sea un trámite válido de Velneo
 */
export const esTramiiteValido = (valor: string): valor is VelneoTramite => {
  const tramitesValidos: VelneoTramite[] = ['Nuevo', 'Renovacion', 'Cambio', 'Endoso', 'No Renueva', 'Cancelacion'];
  return tramitesValidos.includes(valor as VelneoTramite);
};

/**
 * Valida que un valor sea un estado de póliza válido de Velneo
 */
export const esEstadoPolizaValido = (valor: string): valor is VelneoEstadoPoliza => {
  const estadosValidos: VelneoEstadoPoliza[] = ['VIG', 'VEN', 'END', 'CAN', 'ANT'];
  return estadosValidos.includes(valor as VelneoEstadoPoliza);
};

/**
 * Obtiene información detallada sobre un mapeo específico
 */
export const obtenerInfoMapeo = (campo: string, valorOriginal: string): VelneoMappingInfo => {
  switch (campo.toLowerCase()) {
    case 'tramite':
      const tramiteResult = VelneoMapper.mapearTramite(valorOriginal);
      return {
        field: campo,
        originalValue: valorOriginal,
        mappedValue: tramiteResult.valor,
        mappingMethod: tramiteResult.metodo as 'exact_match' | 'keyword_search' | 'pattern_match' | 'default_fallback', // ✅ CORREGIDO
        confidence: tramiteResult.confianza
      };
    
    case 'estadopoliza':
      const estadoResult = VelneoMapper.mapearEstadoPoliza(valorOriginal);
      return {
        field: campo,
        originalValue: valorOriginal,
        mappedValue: estadoResult.valor,
        mappingMethod: estadoResult.metodo as 'exact_match' | 'keyword_search' | 'pattern_match' | 'default_fallback' | 'date_logic' | 'operation_logic', // ✅ CORREGIDO
        confidence: estadoResult.confianza
      };
    
    default:
      return {
        field: campo,
        originalValue: valorOriginal,
        mappedValue: valorOriginal,
        mappingMethod: 'no_mapping',
        confidence: 1.0
      };
  }
};

export type { VelneoMappingInput };