import { DatosVelneo } from "./azure-document";

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

export interface Company {
  id: number;
  comnom: string;
  comalias: string;
  cod_srvcompanias?: string;
  broker: boolean;
  activo: boolean;
}

export interface DocumentProcessResult {
  // Metadatos del documento
  documentId: string;
  nombreArchivo?: string;
  estadoProcesamiento: string;
  nivelConfianza?: number;
  requiereVerificacion?: boolean;
  requiereRevision?: boolean;
  readyForVelneo?: boolean;
  listoParaVelneo?: boolean;
  timestamp?: string;
  
  // Información básica de la póliza
  numeroPoliza?: string;
  anio?: string;
  vigenciaDesde?: string;
  vigenciaHasta?: string;
  plan?: string;
  ramo?: string;
  
  // Datos del asegurado/cliente
  asegurado?: string;
  documento?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  localidad?: string;
  departamento?: string;
  
  // 🚗 DATOS DEL VEHÍCULO (CAMPOS NUEVOS)
  vehiculo?: string;
  marca?: string;
  modelo?: string;
  motor?: string;
  chasis?: string;
  matricula?: string;
  combustible?: string;
  
  // 💰 INFORMACIÓN FINANCIERA (CAMPOS NUEVOS)
  prima?: number;
  primaComercial?: number;
  premioTotal?: number;
  moneda?: string;
  
  // Datos del corredor
  corredor?: string;
  compania?: string;
  
  // Campos técnicos
  polizaData?: any;
  extractedFields?: ExtractedField[] | Record<string, any>;
  originalResponse?: any;
  errorMessage?: string;
  
  datosVelneo?: DatosVelneo;
}


export interface ExtractedField {
  field: string;
  value: string;
  confidence: number;
  needsReview: boolean;
}

export interface PolizaFormData {
  numeroPoliza: string;
  vigenciaDesde: string;
  vigenciaHasta: string;
  prima: number | string;
  moneda: string;
  asegurado: string;
  observaciones: string;
  color?: string;
  tipoVehiculo?: string;
  uso?: string;
  impuestoMSP?: number;
  formaPago?: string;
  cantidadCuotas?: number;
  descuentos?: number;
  recargos?: number;
  codigoPostal?: string;
}

// 🔧 INTERFAZ EXTENDIDA PARA EL FORMULARIO COMPLETO
export interface PolizaFormDataExtended {
  // Información de la Póliza
  numeroPoliza: string;
  anio?: string | number;
  vigenciaDesde: string;
  vigenciaHasta: string;
  plan?: string;
  ramo?: string;
  compania: string;
  
  // Datos del Cliente
  asegurado: string;
  documento?: string;
  email?: string;
  direccion?: string;
  localidad?: string;
  departamento?: string;
  telefono?: string;
  
  // Datos del Vehículo
  vehiculo?: string;
  marca?: string;
  modelo?: string;
  motor?: string;
  chasis?: string;
  matricula?: string;
  combustible?: string;
  
  // Información Financiera
  prima: number;
  primaComercial?: number;
  premioTotal?: number;
  moneda: string;
  
  // Corredor de Seguros
  corredor?: string;
  
  // Observaciones
  observaciones: string;
}

export interface PolizaCreateRequest {
  comcod: number;
  clinro: number;
  conpol?: string;
  confchdes?: string;
  confchhas?: string;
  conpremio?: number;
  asegurado?: string;
  observaciones?: string;
  moneda?: string;
  documentoId?: string;
  archivoOriginal?: string;
  procesadoConIA?: boolean;
}

export type WizardStep = 'cliente' | 'company' | 'upload' | 'extract' | 'form' | 'success';

export interface WizardState {
  currentStep: WizardStep;
  selectedCliente: Cliente | null;
  selectedCompany: Company | null;
  uploadedFile: File | null;
  extractedData: DocumentProcessResult | null;
  isComplete: boolean;
}

export interface WizardResult {
  cliente: Cliente;
  company: Company;
  file: File;
  extractedData: DocumentProcessResult;
  formData: PolizaFormData;
  polizaCreated?: any;
}

export interface WizardError {
  step: WizardStep;
  message: string;
  details?: string;
  code?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Tipos para el progreso del wizard
export interface StepProgress {
  step: WizardStep;
  completed: boolean;
  current: boolean;
  data?: any;
}

// Tipos para configuración del wizard
export interface WizardConfig {
  maxFileSize: number;
  allowedFileTypes: string[];
  autoAdvance: boolean;
  showProgress: boolean;
  enableValidation: boolean;
}

// Tipos para métricas del wizard
export interface WizardMetrics {
  startTime: Date;
  endTime?: Date;
  duration?: number;
  stepsCompleted: number;
  errors: WizardError[];
  abandoned: boolean;
}