import { OPERACIONES_CONFIG, TipoOperacion } from "../utils/operationLogic";
import { DatosVelneo } from "./azure-document";
import { Seccion } from "./seccion";
import { PolizaFormData, PolizaCreateRequest } from "./poliza";

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
  porcentajeCompletitud: any;
  documentId: string;
  nombreArchivo?: string;
  estadoProcesamiento: string;
  nivelConfianza?: number;
  requiereVerificacion?: boolean;
  requiereRevision?: boolean;
  readyForVelneo?: boolean;
  listoParaVelneo?: boolean;
  timestamp?: string;
  
  tiempoProcesamiento?: number;  
  
  numeroPoliza?: string;
  anio?: string;
  vigenciaDesde?: string;
  vigenciaHasta?: string;
  plan?: string;
  ramo?: string;
  asegurado?: string;
  documento?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  localidad?: string;
  departamento?: string;
  vehiculo?: string;
  marca?: string;
  modelo?: string;
  motor?: string;
  chasis?: string;
  matricula?: string;
  combustible?: string;
  prima?: number;
  primaComercial?: number;
  premioTotal?: number;
  moneda?: string;
  corredor?: string;
  compania?: string;
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

export type WizardStep = 'cliente' | 'company' | 'seccion' | 'operacion' | 'upload' | 'extract' | 'form' | 'success';

export interface Ramo {
  id: string;
  nombre: string;
  descripcion: string;
  icon: string;
  activo: boolean;
  companias?: number[]; 
}

export interface WizardState {
  currentStep: WizardStep;
  selectedCliente: Cliente | null;
  selectedCompany: Company | null;
  selectedSeccion: Seccion | null;
  selectedOperacion: TipoOperacion | null; 
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

export interface StepProgress {
  step: WizardStep;
  completed: boolean;
  current: boolean;
  data?: any;
}

export interface WizardConfig {
  steps: WizardStep[];
  allowSkip?: boolean;
  autoSave?: boolean;
  validationMode?: 'strict' | 'lenient';
  maxFileSize?: number;
  allowedFileTypes?: string[];
  requireAllSteps?: boolean;
}

export interface WizardMetrics {
  totalSteps: number;
  completedSteps: number;
  progress: number; // 0-100
  estimatedTimeRemaining?: number; // en segundos
  averageStepTime?: number;
  errorCount: number;
  retryCount: number;
  startTime?: Date;
  endTime?: Date;
}