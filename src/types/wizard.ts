// src/types/wizard.ts
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
  documentId: string;
  nombreArchivo: string;
  estadoProcesamiento: string;
  numeroPoliza?: string;
  asegurado?: string;
  vigenciaDesde?: string;
  vigenciaHasta?: string;
  prima?: number;
  compania?: string;
  nivelConfianza?: number;
  requiereVerificacion?: boolean;
  readyForVelneo?: boolean;
  polizaData?: any;
  extractedFields?: ExtractedField[];
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