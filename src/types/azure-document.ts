// src/types/azure-document.ts - INTERFACES CORREGIDAS
// ================================
// ASEGURAR CONSISTENCIA CON EL BACKEND
// ================================

export interface AzureProcessResponse {
  archivo: string;
  timestamp: string;
  tiempoProcesamiento: number;
  estado: string; // "PROCESADO_CON_SMART_EXTRACTION"
  datosVelneo: DatosVelneo; // ✅ ESTE ES EL CAMPO PRINCIPAL
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
  cantidadCuotas: number;
  prima: number;
  premio: number;
  total: number;
  cuotas: number;
  valorCuota: number;
  moneda: string;
  monto: number;
  detalleCuotas: DetalleCuotas;
}

export interface DetalleCuotas {
  tieneCuotasDetalladas: boolean;
  cantidadTotal: number;
  cantidadDetalladas: number;
  primeraCuota: CuotaDetalle; 
  cuotas: CuotaDetalle[];
}

export interface CuotaDetalle {
  numero: number;
  fechaVencimiento: string;
  monto: number; 
}

// 🎁 BONIFICACIONES
export interface Bonificaciones {
  descuentos: number;
  recargos: number;
  bonificacionEspecial: number;
}

// 📝 OBSERVACIONES
export interface Observaciones {
  observacionesGenerales: string;
  observacionesInternas: string;
  notasEspeciales: string;
}

// 📊 MÉTRICAS DE EXTRACCIÓN
export interface MetricasExtraccion {
  camposExtraidos: number;
  camposCompletos: number;
  camposVacios: number;
  porcentajeCompletitud: number;
  nivelConfianza: number;
  tiempoExtraccion: number;
  camposFaltantes: string[];
  camposProblemáticos: string[];
}

// ================================
// PARA COMPATIBILIDAD CON WIZARD
// ================================

export interface DocumentProcessResult {
  documentId: string;
  nombreArchivo: string;
  estadoProcesamiento: string;
  timestamp?: string;
  
  // Datos principales extraídos
  numeroPoliza?: string;
  asegurado?: string;
  vigenciaDesde?: string;
  vigenciaHasta?: string;
  prima?: number;
  
  // Metadatos
  nivelConfianza?: number;
  requiereVerificacion?: boolean;
  readyForVelneo?: boolean;
  
  // ✅ DATOS COMPLETOS DESDE EL BACKEND
  datosVelneo?: DatosVelneo;  // La estructura completa del backend
  tiempoProcesamiento?: number;
  porcentajeCompletitud?: number;
}

export interface DatosClienteExtraidos {
  nombre?: string;
  documento?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  localidad?: string;
  departamento?: string;
  codigoPostal?: string;
}

export interface AzureBatchResponse {
  archivos: AzureProcessResponse[];
  totalProcesados: number;
  exitosos: number;
  fallidos: number;
  tiempoTotal: number;
  resumen: string;
}

export interface ClientSearchResult {
  encontrado: boolean;
  cliente?: {
    id: number;
    nombre: string;
    documento: string;
    email?: string;
    telefono?: string;
    direccion?: string;
  };
  confianza: number;
  mensaje: string;
}

// ================================
// FUNCIONES DE UTILIDAD
// ================================

export class AzureDocumentUtils {
  /**
   * Convierte fechas de diferentes formatos a formato ISO (YYYY-MM-DD)
   */
  static convertirFecha(fecha: string | undefined): string {
    if (!fecha) return '';
    
    try {
      // CASO 1: Ya es formato ISO
      if (fecha.includes('T') || /^\d{4}-\d{2}-\d{2}/.test(fecha)) {
        return fecha.split('T')[0];
      }
      
      // CASO 2: Formato DD/MM/YYYY o similares
      const fechaLimpia = fecha.trim().replace(/[^\d\/\-\.]/g, '');
      
      const formatosComunes = [
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // DD/MM/YYYY
        /^(\d{1,2})-(\d{1,2})-(\d{4})$/,   // DD-MM-YYYY
        /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/   // DD.MM.YYYY
      ];
      
      for (const formato of formatosComunes) {
        const match = fechaLimpia.match(formato);
        if (match) {
          const dia = parseInt(match[1]);
          const mes = parseInt(match[2]);
          const anio = parseInt(match[3]);
          
          if (dia >= 1 && dia <= 31 && mes >= 1 && mes <= 12) {
            const fechaObj = new Date(anio, mes - 1, dia);
            return fechaObj.toISOString().split('T')[0];
          }
        }
      }
      
      return '';
    } catch (error) {
      console.error('Error convirtiendo fecha:', fecha, error);
      return '';
    }
  }

  /**
   * Valida si los datos mínimos están presentes
   */
  static validarDatosMinimos(datos: DatosVelneo): boolean {
    return !!(
      datos.datosPoliza?.numeroPoliza &&
      datos.datosBasicos?.asegurado &&
      datos.datosBasicos?.documento
    );
  }

  /**
   * Calcula el porcentaje de completitud de los datos
   */
  static calcularCompletitud(datos: DatosVelneo): number {
    const camposEsenciales = [
      datos.datosPoliza?.numeroPoliza,
      datos.datosBasicos?.asegurado,
      datos.datosBasicos?.documento,
      datos.datosVehiculo?.marca,
      datos.condicionesPago?.premio
    ];
    
    const camposCompletos = camposEsenciales.filter(campo => 
      campo && campo.toString().trim() !== ''
    ).length;
    
    return Math.round((camposCompletos / camposEsenciales.length) * 100);
  }

  /**
   * Extrae resumen de procesamiento
   */
  static generarResumen(datos: DatosVelneo): string {
    const elementos = [];
    
    if (datos.porcentajeCompletitud) {
      elementos.push(`${datos.porcentajeCompletitud}% completitud`);
    }
    
    if (datos.camposCompletos) {
      elementos.push(`${datos.camposCompletos} campos extraídos`);
    }
    
    if (datos.condicionesPago?.cantidadCuotas) {
      elementos.push(`${datos.condicionesPago.cantidadCuotas} cuotas`);
    }
    
    if (!datos.tieneDatosMinimos) {
      elementos.push('REQUIERE VERIFICACIÓN');
    }
    
    return elementos.join(' • ');
  }
}

// ================================
// VALIDADORES
// ================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class AzureDocumentValidator {
  /**
   * Valida la estructura completa de datosVelneo
   */
  static validarEstructura(datos: DatosVelneo): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Validaciones críticas
    if (!datos.datosPoliza?.numeroPoliza) {
      errors.push('Número de póliza es requerido');
    }
    
    if (!datos.datosBasicos?.asegurado) {
      errors.push('Nombre del asegurado es requerido');
    }
    
    if (!datos.datosBasicos?.documento) {
      warnings.push('Documento del asegurado no encontrado');
    }
    
    // Validaciones de fechas
    if (datos.datosPoliza?.desde && datos.datosPoliza?.hasta) {
      const desde = new Date(datos.datosPoliza.desde);
      const hasta = new Date(datos.datosPoliza.hasta);
      
      if (desde >= hasta) {
        errors.push('La fecha de vigencia "desde" debe ser anterior a "hasta"');
      }
    }
    
    // Validaciones financieras
    if (datos.condicionesPago?.premio && datos.condicionesPago.premio <= 0) {
      warnings.push('El premio de la póliza parece incorrecto');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}