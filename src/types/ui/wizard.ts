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

export interface WizardStepData {
  cliente: Cliente | null;
  company: Company | null;
  seccion: Seccion | null;
  operacion: TipoOperacion | null;
  upload: File | null;
  extract: DocumentProcessResult | null;
  form: PolizaFormData | null;
  success: any;
}

export interface WizardState {
  currentStep: WizardStep;
  previousStep: WizardStep | null;
  completedSteps: Set<WizardStep>;
  stepData: WizardStepData; // ✅ ESTRUCTURA ORGANIZADA POR PASOS
  isComplete: boolean;
  canGoNext: boolean;
  canGoBack: boolean;
  isProcessing: boolean;
  error: string | null;
  
  // ✅ CAMPOS LEGACY PARA COMPATIBILIDAD (opcional)
  selectedCliente?: Cliente | null;
  selectedCompany?: Company | null;
  selectedSeccion?: Seccion | null;
  selectedOperacion?: TipoOperacion | null;
  uploadedFile?: File | null;
  extractedData?: DocumentProcessResult | null;
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

export interface ClienteStepProps {
  clienteSearch: string;
  clienteResults: Cliente[];
  loadingClientes: boolean;
  selectedCliente: Cliente | null;
  onSearchChange: (search: string) => void;
  onClienteSelect: (cliente: Cliente) => void;
  onNext: () => void;
  onBack: () => void;
  isDarkMode: boolean;
}

export interface CompanyStepProps {
  companies: Company[];
  loadingCompanies: boolean;
  selectedCompany: Company | null;
  onCompanySelect: (company: Company) => void;
  onLoadCompanies: () => void;
  onNext: () => void;
  onBack: () => void;
  isDarkMode: boolean;
}

export interface SeccionStepProps {
  secciones?: Seccion[];
  selectedSeccion?: Seccion | null;
  onSeccionSelect?: (seccion: Seccion) => void;
  onNext: () => Promise<boolean>;
  onBack: () => void;
  onComplete: (data: any) => Promise<boolean>;
  wizardData: any;
  isTransitioning: boolean;
}

export interface OperacionStepProps {
  selectedOperacion: TipoOperacion | null;
  onOperacionSelect: (operacion: TipoOperacion) => void;
  onNext: () => void;
  onBack: () => void;
  isDarkMode: boolean;
}

export interface UploadStepProps {
  uploadedFile: File | null;
  processing: boolean;
  onFileSelect: (file: File | null) => void;
  onProcess: (file: File) => Promise<void>;
  onNext: () => void;
  onBack: () => void;
  isDarkMode: boolean;
}

export interface ProcessingStepProps {
  uploadedFile: File | null;
  progress: number;
  selectedCliente: Cliente | null;
  selectedCompany: Company | null;
  onNext: () => void;
  onBack: () => void;
  isDarkMode: boolean;
  mode: string;
  status: string;
  stage: string;
  onRetry: () => void;
}