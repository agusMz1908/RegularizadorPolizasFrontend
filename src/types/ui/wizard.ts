import { Company } from "../../services/companyService";
import { Seccion } from "../core/seccion";
import { Cliente } from "../core/cliente";
import { PolizaFormData } from "../core/poliza";
import { TipoOperacion } from "../../utils/operationLogic";

// ============================================================================
// 📄 RESULTADO DEL PROCESAMIENTO DE DOCUMENTOS
// ============================================================================
export interface DocumentProcessResult {
  success: boolean;
  extractedFields: Record<string, any>;
  confidence: number;
  needsReview: boolean;
  documentId: string;
  estadoProcesamiento: string;
  error?: string;
  data?: any;
  
  // ✅ PROPIEDADES PRINCIPALES FALTANTES
  archivo?: string;                    // Nombre del archivo procesado
  estado?: string;                     // Estado del procesamiento
  listoParaVelneo?: boolean;          // Si está listo para enviar a Velneo
  porcentajeCompletitud?: number;     // Porcentaje de completitud general
  procesamientoExitoso?: boolean;     // Si el procesamiento fue exitoso
  tiempoProcesamiento?: number;       // Tiempo de procesamiento en ms
  timestamp?: string;                 // Timestamp del procesamiento
  
  // ✅ DATOS EXTRAÍDOS DE VELNEO
  datosVelneo?: {
    // Datos básicos del asegurado
    datosBasicos?: {
      asegurado?: string;
      documento?: string;
      telefono?: string;
      email?: string;
      domicilio?: string;
      departamento?: string;
      localidad?: string;
      codigoPostal?: string;
      corredor?: string;
      tipo?: string;
      tramite?: string;
      asignado?: string;
      fecha?: string;
      estado?: string;
    };
    
    // Datos de la póliza
    datosPoliza?: {
      numeroPoliza: string;
      desde?: string;
      hasta?: string;
      ramo?: string;
      certificado?: string;
      endoso?: string;
      tipoMovimiento?: string;
      compania?: string | number;
    };
    
    // Datos de cobertura
    datosCobertura?: {
      cobertura?: string;
      moneda?: string;
      zonaCirculacion?: string;
      codigoMoneda?: number;
    };
    
    // Datos del vehículo
    datosVehiculo?: {
      marca?: string;
      modelo?: string;
      marcaModelo?: string;
      matricula?: string;
      motor?: string;
      chasis?: string;
      anio?: string;
      color?: string;
      combustible?: string;
      categoria?: string;
      destino?: string;
      uso?: string;
      calidad?: string;
      tipoVehiculo?: string;
    };
    
    // Condiciones de pago (ACTUALIZADA CON ESTRUCTURA CORRECTA)
    condicionesPago?: {
      premio?: number;
      total?: number;
      cuotas?: number;
      formaPago?: string;
      valorCuota?: number;
      moneda?: string;
      
      // ✅ ESTRUCTURA CORRECTA PARA DETALLE DE CUOTAS
      detalleCuotas?: {
        cantidadTotal?: number;
        primeraCuota?: {
          fecha?: string;
          monto?: number;
        };
        montoPromedio?: number;
        tieneCuotasDetalladas?: boolean;
        cuotas?: Array<{
          numero?: number;
          fecha?: string;           // Cambiado de fechaVencimiento
          monto?: number;
        }>;
      };
    };
    
    // Bonificaciones y descuentos
    bonificaciones?: {
      bonificaciones?: any[];         // Array de bonificaciones
      descuentos?: number;
      recargos?: number;
      impuestoMSP?: number;
      totalBonificaciones?: number;
    };
    
    // ✅ OBSERVACIONES COMPLETAS
    observaciones?: {
      observacionesGenerales?: string;
      observacionesGestion?: string;
      informacionAdicional?: string;
      notasEscaneado?: string[];      // Array de notas del escaneo
    };
    
    // ✅ MÉTRICAS COMPLETAS
    metricas?: {
      camposCompletos?: number;
      camposConfianzaBaja?: any[];
      camposExtraidos?: number;
      camposFaltantes?: any[];
      porcentajeCompletitud?: number;
      tieneDatosMinimos?: boolean;
    };
    
    // ✅ PROPIEDADES ADICIONALES DEL NIVEL RAÍZ
    camposCompletos?: number;
    porcentajeCompletitud?: number;
    tieneDatosMinimos?: boolean;
  };
}

// ✅ INTERFAZ PARA LAS CUOTAS INDIVIDUALES
export interface CuotaDetalle {
  numero: number;
  fecha: string;
  monto: number;
}

// ✅ INTERFAZ PARA EL DETALLE COMPLETO DE CUOTAS
export interface DetalleCuotas {
  cantidadTotal: number;
  primeraCuota: {
    fecha: string;
    monto: number;
  };
  montoPromedio: number;
  tieneCuotasDetalladas: boolean;
  cuotas: CuotaDetalle[];
}

// ✅ INTERFAZ PARA LAS MÉTRICAS DE PROCESAMIENTO
export interface MetricasProcesamiento {
  camposCompletos: number;
  camposConfianzaBaja: any[];
  camposExtraidos: number;
  camposFaltantes: any[];
  porcentajeCompletitud: number;
  tieneDatosMinimos: boolean;
}
// ============================================================================
// 🧭 PASOS DEL WIZARD
// ============================================================================
export type WizardStep = 
  | 'cliente'
  | 'company' 
  | 'seccion'
  | 'operacion'
  | 'upload'
  | 'processing'
  | 'extract'
  | 'form'
  | 'success';

  interface StepDataStructure {
  cliente?: Cliente | null;
  company?: Company | null;
  seccion?: Seccion | null;
  operacion?: TipoOperacion | null;
  upload?: File | null;
  extract?: DocumentProcessResult | null;
  form?: PolizaFormData | null;
  success?: any;
}

// ============================================================================
// 🎯 ESTADO DEL WIZARD - SIMPLE Y CLARO
// ============================================================================
export interface WizardState {
  currentStep: WizardStep;
  selectedCliente: Cliente | null;
  selectedCompany: Company | null;
  selectedSeccion: Seccion | null;
  selectedOperacion: TipoOperacion | null;
  uploadedFile: File | null;
  extractedData: DocumentProcessResult | null;
  isComplete: boolean;
  stepData?: StepDataStructure;
}

interface FormError {
  field: string;
  message: string;
  type?: 'error' | 'warning';
}

interface ValidationState {
  isValid: boolean;
  errors: FormError[];
  warnings: FormError[];
  validation: {
    errors: FormError[];
    warnings: FormError[];
  };
  validateField: (field: string, value: any) => { isValid: boolean; error: FormError | null };
  validateAll: (data: any) => { isValid: boolean; errors: FormError[]; warnings: FormError[] };
  getFieldError: (field: string) => FormError | null;
  hasFieldError: (field: string) => boolean;
  hasErrors: boolean;
  hasWarnings: boolean;
  clearFieldError: (field: string) => void;
  clearAllErrors: () => void;
  markFieldTouched: (field: string) => void;
}

// ============================================================================
// 🏭 FACTORY FUNCTIONS PARA CREAR OBJETOS (MEJOR QUE TYPES CONFLICTIVOS)
// ============================================================================
export function createValidationState(): ValidationState {
  return {
    isValid: true,
    errors: [],
    warnings: [],
    validation: {
      errors: [],
      warnings: []
    },
    validateField: () => ({ isValid: true, error: null }),
    validateAll: () => ({ isValid: true, errors: [], warnings: [] }),
    getFieldError: () => null,
    hasFieldError: () => false,
    hasErrors: false,
    hasWarnings: false,
    clearFieldError: () => {},
    clearAllErrors: () => {},
    markFieldTouched: () => {}
  };
}

export function createStepData(
  selectedCliente: Cliente | null,
  selectedCompany: Company | null,
  selectedSeccion: Seccion | null,
  selectedOperacion: TipoOperacion | null,
  uploadedFile: File | null,
  extractedData: DocumentProcessResult | null,
  formData: PolizaFormData | null
): StepDataStructure {
  return {
    cliente: selectedCliente,
    company: selectedCompany,
    seccion: selectedSeccion,
    operacion: selectedOperacion,
    upload: uploadedFile,
    extract: extractedData,
    form: formData,
    success: null
  };
}

// ============================================================================
// ✅ EXPORTS LIMPIOS - SOLO LO NECESARIO
// ============================================================================
export type {
  WizardStep as WizardStepType,
  Cliente as ClienteType,
  DocumentProcessResult as ProcessResult
};