// src/types/ui/wizard.ts - Interfaz DocumentProcessResult corregida
// ✅ TIPO CORREGIDO PARA EVITAR ERRORES

import { OPERACIONES_CONFIG, TipoOperacion } from "../../utils/operationLogic";
import { DatosVelneo } from "../../utils/azure-document";
import { Seccion } from "../core/seccion";
import { PolizaFormData, PolizaCreateRequest } from "../core/poliza";
import { Company } from "../../services/companyService"; // ✅ Import corregido

export interface Cliente {
  id: number;
  clinom: string;
  cliced?: string;
  cliruc?: string;
  telefono?: string;
  cliemail?: string;
  clidir?: string;
  activo: boolean;
  nombre?: string; // Para compatibilidad
}

// ✅ TIPO CORREGIDO - Con todas las propiedades necesarias del backend
export interface DocumentProcessResult {
  // ✅ Propiedades que usa el código en usePolizaWizard
  success?: boolean;
  data?: any;
  extractedFields?: ExtractedField[] | Record<string, any>;
  confidence?: number;
  needsReview?: boolean;
  error?: string;

  // ✅ Propiedades que vienen del backend DocumentResultDto
  DocumentoId?: number;
  NombreArchivo?: string;
  EstadoProcesamiento?: string;
  MensajeError?: string;
  CamposExtraidos?: Record<string, string>;
  ConfianzaExtraccion?: number;
  RequiereRevision?: boolean;
  TiempoProcesamiento?: number;
  PolizaProcesada?: any;

  // Identificación del documento (frontend)
  documentId?: string;
  nombreArchivo?: string;
  estadoProcesamiento?: string;
  timestamp?: string;
  
  // Datos principales de la póliza
  numeroPoliza?: string;
  asegurado?: string;
  vigenciaDesde?: string;
  vigenciaHasta?: string;
  prima?: number;

  // Metadata del procesamiento
  nivelConfianza?: number;
  requiereVerificacion?: boolean;
  requiereRevision?: boolean;
  readyForVelneo?: boolean;
  listoParaVelneo?: boolean;
  tiempoProcesamiento?: number;
  porcentajeCompletitud?: number; 
  
  // Datos adicionales de la póliza
  anio?: string;
  plan?: string;
  ramo?: string;
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
  primaComercial?: number;
  premioTotal?: number;
  moneda?: string;
  corredor?: string;
  compania?: string;
  
  // Datos estructurados
  datosVelneo?: any;
  polizaData?: any;
  originalResponse?: any;
  errorMessage?: string;
}

export interface ExtractedField {
  field: string;
  value: string;
  confidence: number;
  needsReview: boolean;
}

export type WizardStep = 'cliente' | 'company' | 'seccion' | 'operacion' | 'upload' | 'processing' | 'extract' | 'form' | 'success';

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
  currentStepIndex: number;
  progressPercentage: number;
  startTime: Date;
  estimatedTimeRemaining?: number;
  averageStepTime?: number;
}